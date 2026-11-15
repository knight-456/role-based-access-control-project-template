/**
 * Field keys for Role entity, Role list, and Role assignment APIs.
 */
export const DEFAULT_ROLE_KEYS = {
  // Primary identifier (supports both 'id' and 'roleId')
  ID: 'id',
  ROLE_ID: 'roleId',

  // Basic info
  ROLE_NAME: 'role_name',
  ROLE_KEY: 'role_key',
  DESCRIPTION: 'description',
  IS_ACTIVE: 'is_active',
  IS_DELETED: 'is_deleted',
  SORT_ORDER: 'sort_order',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',

  // Scoping relationships
  ENTITY_ID: 'entityId',
  ENTITY_OBJECT: 'entity',
  ENTITY_NAME: 'entity_name',

  DEPARTMENT_ID: 'departmentId',
  DEPARTMENT_OBJECT: 'department',
  DEPARTMENT_NAME: 'department_name',

  // Role permissions assignment
  ASSIGNED_PERMISSIONS_ARRAY: 'permissions',
  ASSIGNED_PERMISSION_KEYS: 'permissionKeys',
  ASSIGNED_ACTION_IDS_PAYLOAD_KEY: 'permissionActionIds',
} as const;

export type RoleKeys = typeof DEFAULT_ROLE_KEYS;
