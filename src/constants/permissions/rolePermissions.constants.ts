/**
 * Permission keys for Roles & Permissions module.
 * If your backend uses different slugs (e.g. 'roles.addition' or 'roles:create'),
 * override them here or via configureRBACConstants({ permissions: { ... } }).
 */
export const DEFAULT_ROLE_PERMISSIONS = {
  VIEW: 'roles.view',
  ADD: 'roles.add',
  EDIT: 'roles.edit',
  DELETE: 'roles.delete',
  ASSIGN: 'roles.assign',
  REGISTRY_VIEW: 'permission.view',
  REGISTRY_ADD: 'permission.add',
  REGISTRY_EDIT: 'permission.edit',
  REGISTRY_DELETE: 'permission.delete',
} as const;

export type RolePermissionKeys = typeof DEFAULT_ROLE_PERMISSIONS;
