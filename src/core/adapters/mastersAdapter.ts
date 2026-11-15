import { RBAC_CONSTANTS } from '../../constants';
import {
  MastersAdapter,
  StandardEntityMaster,
  StandardDepartmentMaster,
  StandardDesignationMaster,
  StandardEmployeeMaster,
  StandardModuleMasterItem,
  PaginatedResult,
} from '../types';

function extractListAndMeta(raw: any): { itemsRaw: any[]; total: number; page: number; limit: number } {
  const dataKey = RBAC_CONSTANTS.api.DATA;
  const pagKeys = RBAC_CONSTANTS.pagination;
  const root = raw?.[dataKey] ?? raw;

  if (Array.isArray(root)) {
    return { itemsRaw: root, total: root.length, page: 1, limit: 10 };
  } else if (root && typeof root === 'object') {
    const itemsRaw = root[pagKeys.ITEMS] || root.items || root.rows || [];
    const total = root[pagKeys.TOTAL] ?? itemsRaw.length;
    const page = root[pagKeys.PAGE] ?? 1;
    const limit = root[pagKeys.LIMIT] ?? 10;
    return { itemsRaw, total, page, limit };
  }
  return { itemsRaw: [], total: 0, page: 1, limit: 10 };
}

export const defaultMastersAdapter: MastersAdapter = {
  transformEntityListResponse: (raw: any): PaginatedResult<StandardEntityMaster> => {
    const k = RBAC_CONSTANTS.masters.ENTITY;
    const { itemsRaw, total, page, limit } = extractListAndMeta(raw);

    const items = itemsRaw.map((e: any) => ({
      id: e[k.ID] ?? e.id,
      name: e[k.NAME] ?? e.name,
      code: e[k.CODE],
      state: e[k.STATE],
      city: e[k.CITY],
      pincode: e[k.PINCODE],
      isActive: Boolean(e[RBAC_CONSTANTS.masters.IS_ACTIVE] ?? e.is_active ?? true),
      createdAt: e[RBAC_CONSTANTS.masters.CREATED_AT],
    }));

    return { items, total, page, limit };
  },

  transformDepartmentListResponse: (raw: any): PaginatedResult<StandardDepartmentMaster> => {
    const k = RBAC_CONSTANTS.masters.DEPARTMENT;
    const { itemsRaw, total, page, limit } = extractListAndMeta(raw);

    const items = itemsRaw.map((d: any) => ({
      id: d[k.ID] ?? d.id,
      name: d[k.NAME] ?? d.name,
      code: d[k.CODE],
      entityId: d[k.ENTITY_ID] ?? d.entity?.entityId,
      entityName: d.entity?.entity_name ?? d.entityName,
      isActive: Boolean(d[RBAC_CONSTANTS.masters.IS_ACTIVE] ?? d.is_active ?? true),
      createdAt: d[RBAC_CONSTANTS.masters.CREATED_AT],
    }));

    return { items, total, page, limit };
  },

  transformDesignationListResponse: (raw: any): PaginatedResult<StandardDesignationMaster> => {
    const k = RBAC_CONSTANTS.masters.DESIGNATION;
    const { itemsRaw, total, page, limit } = extractListAndMeta(raw);

    const items = itemsRaw.map((des: any) => ({
      id: des[k.ID] ?? des.id,
      name: des[k.NAME] ?? des.name,
      code: des[k.CODE],
      departmentId: des[k.DEPARTMENT_ID] ?? des.department?.departmentId,
      departmentName: des.department?.department_name ?? des.departmentName,
      isActive: Boolean(des[RBAC_CONSTANTS.masters.IS_ACTIVE] ?? des.is_active ?? true),
      createdAt: des[RBAC_CONSTANTS.masters.CREATED_AT],
    }));

    return { items, total, page, limit };
  },

  transformEmployeeListResponse: (raw: any): PaginatedResult<StandardEmployeeMaster> => {
    const k = RBAC_CONSTANTS.masters.EMPLOYEE;
    const { itemsRaw, total, page, limit } = extractListAndMeta(raw);

    const items = itemsRaw.map((emp: any) => {
      const fn = emp[k.FIRST_NAME] || '';
      const ln = emp[k.LAST_NAME] || '';
      return {
        id: emp[k.ID] ?? emp.id,
        employeeCode: emp[k.EMPLOYEE_CODE],
        firstName: fn,
        lastName: ln,
        fullName: `${fn} ${ln}`.trim() || emp.name || emp[k.EMAIL] || '',
        email: emp[k.EMAIL] || '',
        mobileNumber: emp[k.MOBILE_NUMBER],
        entityId: emp[k.ENTITY_ID],
        entityName: emp.entity?.entity_name,
        departmentId: emp[k.DEPARTMENT_ID],
        departmentName: emp.department?.department_name,
        designationId: emp[k.DESIGNATION_ID],
        designationName: emp.designation?.designation_name,
        reportingManagerId: emp[k.REPORTING_MANAGER_ID],
        roleId: emp[k.ROLE_ID] ?? emp.role?.id,
        roleName: emp.role?.role_name,
        isActive: Boolean(emp[RBAC_CONSTANTS.masters.IS_ACTIVE] ?? emp.is_active ?? true),
        createdAt: emp[RBAC_CONSTANTS.masters.CREATED_AT],
      };
    });

    return { items, total, page, limit };
  },

  transformModuleMasterListResponse: (raw: any): PaginatedResult<StandardModuleMasterItem> => {
    const k = RBAC_CONSTANTS.masters.MODULE;
    const { itemsRaw, total, page, limit } = extractListAndMeta(raw);

    const items = itemsRaw.map((m: any) => ({
      id: m[k.ID] ?? m.id,
      name: m[k.NAME] ?? m.name,
      slug: m[k.SLUG_NAME] ?? m.slug,
      routePath: m[k.ROUTE_PATH],
      sortOrder: m[k.SORT_ORDER] || 0,
      parentId: m[k.PARENT_ID] || 0,
      parentName: m.parent?.name,
      isActive: Boolean(m[RBAC_CONSTANTS.masters.IS_ACTIVE] ?? m.is_active ?? true),
      createdAt: m[RBAC_CONSTANTS.masters.CREATED_AT],
    }));

    return { items, total, page, limit };
  },
};
