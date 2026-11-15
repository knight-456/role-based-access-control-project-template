/**
 * Global API response and pagination field keys.
 * If your backend wraps responses in different keys (e.g. `items` instead of `list`),
 * change it here or pass overrides via RBACConfig.
 */
export const DEFAULT_API_RESPONSE_KEYS = {
  SUCCESS: 'success',
  STATUS_CODE: 'statusCode',
  MESSAGE: 'message',
  DATA: 'data',
  ERROR: 'error',
  ERRORS: 'errors',
} as const;

export const DEFAULT_PAGINATION_KEYS = {
  PAGE: 'page',
  LIMIT: 'limit',
  TOTAL: 'total',
  TOTAL_PAGES: 'totalPages',
  HAS_NEXT: 'hasNext',
  ITEMS: 'list', // container API returns `list` or direct array
} as const;

export type ApiResponseKeys = typeof DEFAULT_API_RESPONSE_KEYS;
export type PaginationKeys = typeof DEFAULT_PAGINATION_KEYS;
