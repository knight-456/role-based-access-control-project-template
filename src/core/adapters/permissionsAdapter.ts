import { RBAC_CONSTANTS } from '../../constants';
import { PermissionsAdapter, StandardAction, StandardModuleWithActions, PaginatedResult } from '../types';

export const defaultPermissionsAdapter: PermissionsAdapter = {
  transformActionsListResponse: (raw: any): StandardAction[] => {
    const dataKey = RBAC_CONSTANTS.api.DATA;
    const root = raw?.[dataKey] || raw || [];
    const items = Array.isArray(root) ? root : root.list || [];

    return items.map((a: any) => ({
      id: a[RBAC_CONSTANTS.permissions.ACTION_ID] ?? a.id,
      name: a[RBAC_CONSTANTS.permissions.ACTION_NAME] ?? a.name,
      key: a[RBAC_CONSTANTS.permissions.ACTION_KEY] ?? a.key,
      isActive: Boolean(a[RBAC_CONSTANTS.permissions.IS_ACTIVE] ?? true),
      sortOrder: a.sort_order ?? 0,
    }));
  },

  transformRegistryResponse: (raw: any): PaginatedResult<StandardModuleWithActions> => {
    const permKeys = RBAC_CONSTANTS.permissions;
    const dataKey = RBAC_CONSTANTS.api.DATA;
    const pagKeys = RBAC_CONSTANTS.pagination;

    let itemsRaw: any[] = [];
    let total = 0;
    let page = 1;
    let limit = 10;

    const root = raw?.[dataKey] ?? raw;
    if (Array.isArray(root)) {
      itemsRaw = root;
      total = root.length;
    } else if (root && typeof root === 'object') {
      itemsRaw = root[pagKeys.ITEMS] || root.items || [];
      total = root[pagKeys.TOTAL] ?? itemsRaw.length;
      page = root[pagKeys.PAGE] ?? 1;
      limit = root[pagKeys.LIMIT] ?? 10;
    }

    const mapModule = (m: any): StandardModuleWithActions => {
      const rawActions = m[permKeys.ACTIONS_ARRAY] || [];
      const actions = Array.isArray(rawActions)
        ? rawActions.map((pa: any) => {
            const ad = pa[permKeys.ACTION_DETAILS] || {};
            return {
              permissionActionId: pa[permKeys.PERMISSION_ACTION_ID] ?? pa.id,
              moduleId: pa[permKeys.PERMISSION_MASTER_ID] ?? m[permKeys.PERMISSION_MASTER_ID],
              actionId: pa[permKeys.ACTION_ID] ?? ad[permKeys.ACTION_ID],
              permissionKey: pa[permKeys.PERMISSION_KEY] || '',
              routePath: pa[permKeys.ROUTE_PATH],
              description: pa.description,
              sortOrder: pa[permKeys.SORT_ORDER] || 0,
              actionDetails: {
                id: ad[permKeys.ACTION_ID] ?? pa[permKeys.ACTION_ID] ?? 0,
                name: ad[permKeys.ACTION_NAME] || pa[permKeys.ACTION_NAME] || '',
                key: ad[permKeys.ACTION_KEY] || pa[permKeys.ACTION_KEY] || '',
                isActive: Boolean(ad[permKeys.IS_ACTIVE] ?? true),
              },
            };
          })
        : [];

      const rawChildren = m[permKeys.CHILDREN_ARRAY] || m[permKeys.SUBMODULES_ARRAY] || [];
      const children = Array.isArray(rawChildren) ? rawChildren.map(mapModule) : [];

      return {
        id: m[permKeys.PERMISSION_MASTER_ID] ?? m.id,
        name: m[permKeys.MODULE_NAME] || '',
        slug: m[permKeys.SLUG_NAME] || '',
        routePath: m[permKeys.ROUTE_PATH],
        sortOrder: m[permKeys.SORT_ORDER] || 0,
        parentId: m[permKeys.PARENT_ID] || 0,
        isActive: Boolean(m[permKeys.IS_ACTIVE] ?? true),
        actions,
        children,
      };
    };

    const items = itemsRaw.map(mapModule);
    return { items, total, page, limit };
  },

  transformModuleParentsResponse: (raw: any): PaginatedResult<StandardModuleWithActions> => {
    return defaultPermissionsAdapter.transformRegistryResponse(raw);
  },

  transformModuleSubmodulesResponse: (raw: any): PaginatedResult<StandardModuleWithActions> => {
    return defaultPermissionsAdapter.transformRegistryResponse(raw);
  },
};
