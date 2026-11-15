export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuthRedirect?: boolean;
  skipTokenRefresh?: boolean;
}

export function extractFieldErrors(data: any): Record<string, string> | undefined {
  if (!data || typeof data !== 'object') return undefined;

  // Pattern 1: { fieldErrors: { email: "taken" } }
  if (data.fieldErrors && typeof data.fieldErrors === 'object' && !Array.isArray(data.fieldErrors)) {
    return data.fieldErrors;
  }

  // Pattern 2: { errors: { email: "taken" | ["taken", "invalid"] } }
  if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
    const res: Record<string, string> = {};
    for (const [k, v] of Object.entries(data.errors)) {
      res[k] = Array.isArray(v) ? String(v[0]) : String(v);
    }
    return res;
  }

  // Pattern 3: { errors: [{ field: "email", message: "taken" }] } or [{ path: "email", msg: "taken" }]
  if (Array.isArray(data.errors)) {
    const res: Record<string, string> = {};
    for (const item of data.errors) {
      const key = item.field || item.path || item.param || item.key;
      const msg = item.message || item.msg || item.error;
      if (key && msg) res[key] = String(msg);
    }
    return Object.keys(res).length > 0 ? res : undefined;
  }

  // Pattern 4: { validationErrors: { ... } }
  if (data.validationErrors && typeof data.validationErrors === 'object') {
    const res: Record<string, string> = {};
    for (const [k, v] of Object.entries(data.validationErrors)) {
      res[k] = Array.isArray(v) ? String(v[0]) : String(v);
    }
    return res;
  }

  return undefined;
}

export class HttpClient {
  private baseUrl: string;
  private getToken?: () => string | null | undefined;
  private getTenantId?: () => string | number | null | undefined;
  private getCustomHeaders?: () => Record<string, string>;
  private onUnauthorized?: () => void;
  private refreshTokenFn?: () => Promise<string | null | undefined>;

  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string | null) => void> = [];

  constructor(options: {
    baseUrl: string;
    getToken?: () => string | null | undefined;
    getTenantId?: () => string | number | null | undefined;
    getCustomHeaders?: () => Record<string, string>;
    onUnauthorized?: () => void;
    refreshToken?: () => Promise<string | null | undefined>;
  }) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.getToken = options.getToken;
    this.getTenantId = options.getTenantId;
    this.getCustomHeaders = options.getCustomHeaders;
    this.onUnauthorized = options.onUnauthorized;
    this.refreshTokenFn = options.refreshToken;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, "");
  }

  private subscribeTokenRefresh(cb: (token: string | null) => void) {
    this.refreshSubscribers.push(cb);
  }

  private onTokenRefreshed(token: string | null) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  private buildUrl(path: string, params?: Record<string, any>): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${cleanPath}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  public async request<T = any>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = this.buildUrl(path, options.params);
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    };

    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;
    if (!isFormData && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    } else if (isFormData) {
      delete headers["Content-Type"]; // Let browser generate boundary
    }

    // Inject custom headers if configured
    if (this.getCustomHeaders) {
      Object.assign(headers, this.getCustomHeaders());
    }

    // Inject tenant/entity identifier if configured
    if (this.getTenantId) {
      const tenantId = this.getTenantId();
      if (tenantId) {
        headers["X-Tenant-Id"] = String(tenantId);
        headers["X-Entity-Id"] = String(tenantId);
      }
    }

    // Inject Bearer token
    const token = this.getToken ? this.getToken() : null;
    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
        credentials: options.credentials || 'include',
      });
    } catch (networkError: any) {
      throw new Error(
        `Network error: ${networkError.message || "Failed to fetch"}`,
      );
    }

    // Handle 401 Unauthorized with Silent Token Refresh
    if (response.status === 401 && !options.skipAuthRedirect) {
      if (this.refreshTokenFn && !options.skipTokenRefresh) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          try {
            const newToken = await this.refreshTokenFn();
            this.isRefreshing = false;
            this.onTokenRefreshed(newToken || null);

            if (newToken) {
              // Retry original request with newly refreshed token
              headers["Authorization"] = `Bearer ${newToken}`;
              return this.request<T>(path, {
                ...options,
                headers,
                skipTokenRefresh: true,
              });
            }
          } catch (refreshErr) {
            this.isRefreshing = false;
            this.onTokenRefreshed(null);
            if (this.onUnauthorized) this.onUnauthorized();
            throw refreshErr;
          }
        } else {
          // Another request is already refreshing the token; wait for it
          return new Promise<T>((resolve, reject) => {
            this.subscribeTokenRefresh((newToken) => {
              if (newToken) {
                headers["Authorization"] = `Bearer ${newToken}`;
                resolve(
                  this.request<T>(path, {
                    ...options,
                    headers,
                    skipTokenRefresh: true,
                  }),
                );
              } else {
                if (this.onUnauthorized) this.onUnauthorized();
                reject(new Error("Session expired"));
              }
            });
          });
        }
      }

      // If no refreshToken handler, trigger unauthorized callback
      if (this.onUnauthorized) {
        this.onUnauthorized();
      }
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg =
        data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`;
      const error: any = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      // Extract field-level validation errors if returned by backend
      error.fieldErrors = extractFieldErrors(data);
      throw error;
    }

    return data as T;
  }

  public get<T = any>(
    path: string,
    params?: Record<string, any>,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET", params });
  }

  public post<T = any>(
    path: string,
    body?: any,
    options?: RequestOptions,
  ): Promise<T> {
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: isFormData
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
    });
  }

  public patch<T = any>(
    path: string,
    body?: any,
    options?: RequestOptions,
  ): Promise<T> {
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: isFormData
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
    });
  }

  public put<T = any>(
    path: string,
    body?: any,
    options?: RequestOptions,
  ): Promise<T> {
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      body: isFormData
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
    });
  }

  public delete<T = any>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }

  public upload<T = any>(path: string, formData: FormData, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: formData,
    });
  }
}
