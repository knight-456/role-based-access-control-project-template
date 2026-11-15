import { RBAC_CONSTANTS } from '../../constants';
import { RolesAdapter, StandardRole, PaginatedResult, RoleFormData } from '../types';

export const defaultRolesAdapter: RolesAdapter = {
  transformRoleListResponse: (raw: any): PaginatedResult<StandardRole> => {
    const roleKeys = RBAC_CONSTANTS.roles;
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
      itemsRaw = root[pagKeys.ITEMS] || root.roles || root.items || root.rows || [];
      total = root[pagKeys.TOTAL] ?? itemsRaw.length;
      page = root[pagKeys.PAGE] ?? 1;
      limit = root[pagKeys.LIMIT] ?? 10;
    }

    const items: StandardRole[] = itemsRaw.map((r: any) => {
      const entityObj = r[roleKeys.ENTITY_OBJECT];
      const deptObj = r[roleKeys.DEPARTMENT_OBJECT];

      return {
        id: r[roleKeys.ID] ?? r[roleKeys.ROLE_ID],
        name: r[roleKeys.ROLE_NAME] || '',
        key: r[roleKeys.ROLE_KEY] || '',
        description: r[roleKeys.DESCRIPTION],
        isActive: Boolean(r[roleKeys.IS_ACTIVE] ?? true),
        entityId: r[roleKeys.ENTITY_ID] ?? entityObj?.[RBAC_CONSTANTS.masters.ENTITY.ID],
        entityName: entityObj?.[roleKeys.ENTITY_NAME] ?? entityObj?.name,
        departmentId: r[roleKeys.DEPARTMENT_ID] ?? deptObj?.[RBAC_CONSTANTS.masters.DEPARTMENT.ID],
        departmentName: deptObj?.[roleKeys.DEPARTMENT_NAME] ?? deptObj?.name,
        createdAt: r[roleKeys.CREATED_AT],
        updatedAt: r[roleKeys.UPDATED_AT],
      };
    });

    return { items, total, page, limit };
  },

  transformRoleDetailsResponse: (raw: any): StandardRole => {
    const roleKeys = RBAC_CONSTANTS.roles;
    const dataKey = RBAC_CONSTANTS.api.DATA;
    const r = raw?.[dataKey] || raw || {};

    return {
      id: r[roleKeys.ID] ?? r[roleKeys.ROLE_ID],
      name: r[roleKeys.ROLE_NAME] || '',
      key: r[roleKeys.ROLE_KEY] || '',
      description: r[roleKeys.DESCRIPTION],
      isActive: Boolean(r[roleKeys.IS_ACTIVE] ?? true),
      entityId: r[roleKeys.ENTITY_ID],
      departmentId: r[roleKeys.DEPARTMENT_ID],
      createdAt: r[roleKeys.CREATED_AT],
      updatedAt: r[roleKeys.UPDATED_AT],
    };
  },

  transformCreateRolePayload: (data: RoleFormData): Record<string, any> => {
    const roleKeys = RBAC_CONSTANTS.roles;
    return {
      [roleKeys.ROLE_NAME]: data.role_name,
      [roleKeys.ROLE_KEY]: data.role_key,
      [roleKeys.DESCRIPTION]: data.description || '',
      ...(data.entityId ? { [roleKeys.ENTITY_ID]: data.entityId } : {}),
      ...(data.departmentId ? { [roleKeys.DEPARTMENT_ID]: data.departmentId } : {}),
      [roleKeys.IS_ACTIVE]: data.is_active ?? true,
    };
  },

  transformEditRolePayload: (data: Partial<RoleFormData>): Record<string, any> => {
    const roleKeys = RBAC_CONSTANTS.roles;
    const payload: Record<string, any> = {};
    if (data.role_name !== undefined) payload[roleKeys.ROLE_NAME] = data.role_name;
    if (data.role_key !== undefined) payload[roleKeys.ROLE_KEY] = data.role_key;
    if (data.description !== undefined) payload[roleKeys.DESCRIPTION] = data.description;
    if (data.entityId !== undefined) payload[roleKeys.ENTITY_ID] = data.entityId;
    if (data.departmentId !== undefined) payload[roleKeys.DEPARTMENT_ID] = data.departmentId;
    if (data.is_active !== undefined) payload[roleKeys.IS_ACTIVE] = data.is_active;
    return payload;
  },

  transformRolePermissionsResponse: (raw: any): (string | number)[] => {
    const dataKey = RBAC_CONSTANTS.api.DATA;
    const root = raw?.[dataKey] || raw || {};
    const permissions = root[RBAC_CONSTANTS.roles.ASSIGNED_PERMISSIONS_ARRAY] || root.permissionActionIds || root;

    if (Array.isArray(permissions)) {
      return permissions.map((p: any) => {
        if (typeof p === 'number' || typeof p === 'string') return p;
        return (
          p[RBAC_CONSTANTS.permissions.PERMISSION_ACTION_ID] ??
          p[RBAC_CONSTANTS.permissions.ACTION_ID] ??
          p[RBAC_CONSTANTS.permissions.PERMISSION_KEY_ID] ??
          p.id
        );
      });
    }
    return [];
  },

  transformAssignPermissionsPayload: (_roleId: string | number, permissionActionIds: (string | number)[]) => {
    return {
      [RBAC_CONSTANTS.roles.ASSIGNED_ACTION_IDS_PAYLOAD_KEY]: permissionActionIds,
    };
  },
};
