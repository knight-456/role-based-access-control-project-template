/**
 * Field keys for Masters modules: Entity, Department, Designation, Employee, Module Master, Sub-Module.
 */
export const DEFAULT_MASTER_KEYS = {
  // Generic master keys
  ID: 'id',
  NAME: 'name',
  DESCRIPTION: 'description',
  IS_ACTIVE: 'is_active',
  IS_DELETED: 'is_deleted',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',

  // Entity Master
  ENTITY: {
    ID: 'entityId',
    NAME: 'entity_name',
    CODE: 'entity_code',
    STATE: 'state',
    CITY: 'city',
    PINCODE: 'pincode',
    STATUS: 'status',
  },

  // Department Master
  DEPARTMENT: {
    ID: 'departmentId',
    NAME: 'department_name',
    CODE: 'department_code',
    ENTITY_ID: 'entityId',
  },

  // Designation Master
  DESIGNATION: {
    ID: 'designationId',
    NAME: 'designation_name',
    CODE: 'designation_code',
    DEPARTMENT_ID: 'departmentId',
  },

  // Employee Master
  EMPLOYEE: {
    ID: 'employeeUserId',
    EMPLOYEE_CODE: 'employee_code',
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
    EMAIL: 'email',
    MOBILE_NUMBER: 'mobile_number',
    ENTITY_ID: 'entityId',
    DEPARTMENT_ID: 'departmentId',
    DESIGNATION_ID: 'designationId',
    REPORTING_MANAGER_ID: 'reportingManagerId',
    ROLE_ID: 'roleId',
    STATUS: 'status',
  },

  // Module & Sub-Module Master
  MODULE: {
    ID: 'permissionMasterId',
    NAME: 'name',
    SLUG_NAME: 'slug_name',
    ROUTE_PATH: 'route_path',
    SORT_ORDER: 'sort_order',
    PARENT_ID: 'parentId',
  },
} as const;

export type MasterKeys = typeof DEFAULT_MASTER_KEYS;
