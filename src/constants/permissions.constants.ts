/**
 * Field keys for Permission Registry, Module Hierarchy, and Permission Actions.
 */
export const DEFAULT_PERMISSION_KEYS = {
  // Module master
  PERMISSION_MASTER_ID: 'permissionMasterId',
  MODULE_ID: 'id',
  MODULE_NAME: 'name',
  SLUG_NAME: 'slug_name',
  ROUTE_PATH: 'route_path',
  SORT_ORDER: 'sort_order',
  PARENT_ID: 'parentId',
  IS_ACTIVE: 'is_active',
  IS_DELETED: 'is_deleted',
  CHILDREN_ARRAY: 'children',
  SUBMODULES_ARRAY: 'submodules',

  // Actions on a module
  ACTIONS_ARRAY: 'actions',
  PERMISSION_ACTION_ID: 'permissionActionId',
  ACTION_ID: 'actionId',
  ACTION_DETAILS: 'actionDetails',
  PERMISSION_KEY: 'permission_key',
  ACTION_NAME: 'action_name',
  ACTION_KEY: 'action_key',

  // Flat permission keys list
  PERMISSION_KEY_ID: 'permissionKeyId',
  NAME: 'name',
  PERMISSION_TYPE: 'permission_type',
  PRODUCT_ID: 'productId',
} as const;

export type PermissionKeys = typeof DEFAULT_PERMISSION_KEYS;
