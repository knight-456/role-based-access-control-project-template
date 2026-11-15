/**
 * Default API route endpoints matching the live container API structure.
 * Override any URL in `rbac.config.ts` without modifying component source code.
 */
export const DEFAULT_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME: '/auth/me',

  // Roles & Permissions
  ROLES_LIST: '/roles/list',
  ROLES_CREATE: '/roles/create',
  ROLES_DETAILS: '/roles/details/:id',
  ROLES_EDIT: '/roles/edit/:id',
  ROLES_DELETE: '/roles/delete/:id',
  ROLES_GET_PERMISSIONS: '/roles/permissions/:id',
  ROLES_ASSIGN_PERMISSIONS: '/roles/assign-permissions/:id',

  // Alternate user-panel roles endpoints (if backend uses /user-panel/roles)
  USER_PANEL_ROLES_LIST: '/user-panel/roles/list',
  USER_PANEL_ROLES_CREATE: '/user-panel/roles/create',
  USER_PANEL_ROLES_UPDATE: '/user-panel/roles/update/:id',
  USER_PANEL_ROLES_DELETE: '/user-panel/roles/delete/:id',
  USER_PANEL_ROLES_ASSIGN_PERMISSIONS: '/user-panel/roles/:id/assign-permissions',

  // Permission Registry & Modules
  PERMISSIONS_ACTIONS: '/permissions/actions',
  PERMISSIONS_REGISTRY: '/permissions/registry',
  PERMISSIONS_MODULES_PARENTS: '/permissions/modules/parents',
  PERMISSIONS_MODULES_SUBMODULES: '/permissions/modules/submodules',
  PERMISSIONS_MODULE_CREATE: '/permissions/modules',
  PERMISSIONS_MODULE_EDIT: '/permissions/modules/:id',
  PERMISSIONS_MODULE_DELETE: '/permissions/modules/:id',
  PERMISSIONS_SETUP_MODULE: '/permissions/setup-module',

  USER_PANEL_PERMISSION_KEYS: '/user-panel/permissions/keys',
  USER_PANEL_PERMISSION_KEY_REGISTER: '/user-panel/permissions/keys/register',
  USER_PANEL_PERMISSION_MODULES: '/user-panel/permissions/modules',

  // Masters: Entity
  ENTITY_LIST: '/entity/list',
  ENTITY_CREATE: '/entity/create',
  ENTITY_EDIT: '/entity/edit/:id',
  ENTITY_DELETE: '/entity/delete/:id',

  // Masters: Department
  DEPARTMENT_LIST: '/department/list',
  DEPARTMENT_CREATE: '/department/create',
  DEPARTMENT_EDIT: '/department/edit/:id',
  DEPARTMENT_DELETE: '/department/delete/:id',

  // Masters: Designation
  DESIGNATION_LIST: '/designation/list',
  DESIGNATION_CREATE: '/designation/create',
  DESIGNATION_EDIT: '/designation/edit/:id',
  DESIGNATION_DELETE: '/designation/delete/:id',

  // Masters: Employee
  EMPLOYEE_LIST: '/employee/list',
  EMPLOYEE_CREATE: '/employee/create',
  EMPLOYEE_EDIT: '/employee/edit/:id',
  EMPLOYEE_DELETE: '/employee/delete/:id',
} as const;

export type Endpoints = typeof DEFAULT_ENDPOINTS;
