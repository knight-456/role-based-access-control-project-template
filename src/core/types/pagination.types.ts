export interface PaginationConfig {
  pageIndexOffset?: 0 | 1; // 1 for 1-based (default), 0 for 0-based (Spring Boot, etc.)
  pageParamName?: string;  // e.g. 'page' or 'pageNumber' or 'pageIndex'
  limitParamName?: string; // e.g. 'limit' or 'size' or 'pageSize'
  useOffsetLimit?: boolean;// If true, sends offset and limit instead of page and limit
  offsetParamName?: string;// e.g. 'offset' or 'skip'
}

export const defaultPaginationConfig: Required<PaginationConfig> = {
  pageIndexOffset: 1,
  pageParamName: 'page',
  limitParamName: 'limit',
  useOffsetLimit: false,
  offsetParamName: 'offset',
};

export function buildPaginationQueryParams(
  page: number,
  limit: number,
  config?: PaginationConfig
): Record<string, number> {
  const cfg = { ...defaultPaginationConfig, ...(config || {}) };

  if (cfg.useOffsetLimit) {
    const offset = Math.max(0, (page - 1) * limit);
    return {
      [cfg.offsetParamName]: offset,
      [cfg.limitParamName]: limit,
    };
  }

  const backendPage = cfg.pageIndexOffset === 0 ? Math.max(0, page - 1) : page;
  return {
    [cfg.pageParamName]: backendPage,
    [cfg.limitParamName]: limit,
  };
}
