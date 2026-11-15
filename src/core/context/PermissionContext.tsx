import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useRBACConfig } from './RBACConfigContext';
import { StandardUser, StandardNavigationItem, LoginCredentials } from '../types';

export interface PermissionContextValue {
  user: StandardUser | null;
  permissions: Set<string>;
  navigation: StandardNavigationItem[];
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  activeTenantId: string | number | null;
  setTenantId: (id: string | number | null) => void;
  hasPermission: (permissionKey: string) => boolean;
  canNavigate: (routePath: string) => boolean;
  login: (credentials: LoginCredentials) => Promise<any>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export interface PermissionProviderProps {
  children: React.ReactNode;
  autoFetch?: boolean;
  // SSR Hydration Props to eliminate FOUC (Flash of Unauthorized Content)
  initialUser?: StandardUser | null;
  initialPermissions?: string[] | Set<string>;
  initialNavigation?: StandardNavigationItem[];
  initialTenantId?: string | number | null;
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

export const PermissionProvider: React.FC<PermissionProviderProps> = ({
  children,
  autoFetch = true,
  initialUser = null,
  initialPermissions,
  initialNavigation = [],
  initialTenantId = null,
}) => {
  const { config, http } = useRBACConfig();

  const [user, setUser] = useState<StandardUser | null>(initialUser);
  const [permissions, setPermissions] = useState<Set<string>>(() => {
    if (!initialPermissions) return new Set();
    return initialPermissions instanceof Set ? initialPermissions : new Set(initialPermissions);
  });
  const [routePaths, setRoutePaths] = useState<Set<string>>(new Set());
  const [navigation, setNavigation] = useState<StandardNavigationItem[]>(initialNavigation);
  const [activeTenantId, setActiveTenantId] = useState<string | number | null>(initialTenantId);

  // If initial user or permissions are provided by SSR, start with isLoading = false!
  const [isLoading, setIsLoading] = useState<boolean>(() => !initialUser && !initialPermissions && autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const fetchAuthMe = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const raw = await http.get(config.endpoints.AUTH_ME);
      const transformed = config.adapters.auth.transformAuthMeResponse(raw);

      setUser(transformed.user);

      const permKeys = new Set<string>();
      const routes = new Set<string>();

      transformed.permissions.forEach((p) => {
        if (p.permissionKey) permKeys.add(p.permissionKey);
        if (p.routePath) routes.add(p.routePath);
      });

      setPermissions(permKeys);
      setRoutePaths(routes);
      setNavigation(transformed.navigation);
    } catch (err: any) {
      setUser(null);
      setPermissions(new Set());
      setRoutePaths(new Set());
      setNavigation([]);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [config.adapters.auth, config.endpoints.AUTH_ME, http]);

  useEffect(() => {
    if (autoFetch && !initialUser) {
      fetchAuthMe();
    }
  }, [autoFetch, fetchAuthMe, initialUser]);

  const setTenantId = useCallback(
    (newTenantId: string | number | null) => {
      setActiveTenantId(newTenantId);
      // Re-fetch permissions for the newly switched tenant
      fetchAuthMe();
    },
    [fetchAuthMe]
  );

  const hasPermission = useCallback(
    (permissionKey: string): boolean => {
      if (!permissionKey) return true;
      if (permissions.has('*') || permissions.has('all')) return true;

      // 1. Direct match
      if (permissions.has(permissionKey)) return true;

      // 2. Check alias map from config (e.g. 'roles.add' -> 'roles.addition')
      const aliasedKey = config.permissionAliases[permissionKey];
      if (aliasedKey && permissions.has(aliasedKey)) return true;

      // 3. Reverse alias check (if user passed 'roles.addition', check if 'roles.add' is in set)
      for (const [standardKey, mappedKey] of Object.entries(config.permissionAliases)) {
        if (mappedKey === permissionKey && permissions.has(standardKey)) return true;
      }

      // 4. Wildcard matching (e.g. "roles.*" or "department_master.*")
      const parts = permissionKey.split(/[.:_]/);
      if (parts.length > 1) {
        const wildcardDot = `${parts[0]}.*`;
        const wildcardColon = `${parts[0]}:*`;
        if (permissions.has(wildcardDot) || permissions.has(wildcardColon)) return true;
      }

      return false;
    },
    [config.permissionAliases, permissions]
  );

  const canNavigate = useCallback(
    (routePath: string): boolean => {
      if (!routePath) return true;
      if (permissions.has('*')) return true;
      if (routePaths.has(routePath)) return true;

      // Allow matching paths with dynamic parameters e.g. /masters/entity-master/edit/[id]
      for (const allowedRoute of routePaths) {
        if (allowedRoute === routePath) return true;
        if (allowedRoute.includes('[') || allowedRoute.includes(':')) {
          const regexStr = '^' + allowedRoute.replace(/\[\w+\]|:\w+/g, '[^/]+') + '$';
          if (new RegExp(regexStr).test(routePath)) return true;
        }
      }
      return false;
    },
    [permissions, routePaths]
  );

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      try {
        const payload = config.adapters.auth.transformLoginPayload(credentials);
        const raw = await http.post(config.endpoints.AUTH_LOGIN, payload, { skipAuthRedirect: true });
        const res = config.adapters.auth.transformLoginResponse(raw);

        if (res.token && typeof window !== 'undefined') {
          localStorage.setItem('token', res.token);
        }

        await fetchAuthMe();
        return res;
      } catch (err: any) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [config.adapters.auth, config.endpoints.AUTH_LOGIN, fetchAuthMe, http]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await http.delete(config.endpoints.AUTH_LOGOUT).catch(() => {});
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      setUser(null);
      setPermissions(new Set());
      setRoutePaths(new Set());
      setNavigation([]);
    } finally {
      setIsLoading(false);
    }
  }, [config.endpoints.AUTH_LOGOUT, http]);

  const value = useMemo<PermissionContextValue>(
    () => ({
      user,
      permissions,
      navigation,
      isLoading,
      isAuthenticated: Boolean(user),
      error,
      activeTenantId,
      setTenantId,
      hasPermission,
      canNavigate,
      login,
      logout,
      refresh: fetchAuthMe,
    }),
    [
      user,
      permissions,
      navigation,
      isLoading,
      error,
      activeTenantId,
      setTenantId,
      hasPermission,
      canNavigate,
      login,
      logout,
      fetchAuthMe,
    ]
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
};

export function usePermission(): PermissionContextValue {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
}
