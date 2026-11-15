/**
 * Field keys for Auth, Login, and User Profile (/auth/me) responses.
 * Never hardcode field names in components or adapters.
 */
export const DEFAULT_AUTH_KEYS = {
  // Login response fields
  USER_CONTAINER: 'user',
  TOKEN: 'token',
  ACCESS_TOKEN: 'accessToken',
  SESSION_ID: 'sessionId',

  // User entity fields
  USER_ID: 'id',
  EMPLOYEE_USER_ID: 'employeeUserId',
  EMAIL: 'email',
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  FULL_NAME: 'name',
  MOBILE_NUMBER: 'mobile_number',
  IS_MOBILE_VERIFIED: 'is_mobile_number_verified',
  ENTITY_ID: 'entityId',
  DEPARTMENT_ID: 'departmentId',

  // Role reference inside user
  USER_ROLE: 'role',
  USER_ROLE_ID: 'id',
  USER_ROLE_NAME: 'role_name',
  USER_ROLE_KEY: 'role_key',

  // Permissions & Navigation inside /auth/me
  PERMISSIONS_ARRAY: 'permissions',
  PERMISSION_KEY: 'permission_key',
  ROUTE_PATH: 'route_path',

  NAVIGATION_ARRAY: 'navigation',
  MODULES_ARRAY: 'modules',
} as const;

export type AuthKeys = typeof DEFAULT_AUTH_KEYS;
