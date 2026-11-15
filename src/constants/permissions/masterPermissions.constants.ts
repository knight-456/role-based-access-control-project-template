/**
 * Permission keys for Masters modules: Entity, Department, Designation, Employee, Module, SubModule.
 * Override any module's permission slugs if your backend uses different formats.
 */
export const DEFAULT_MASTER_PERMISSIONS = {
  entity: {
    VIEW: 'entity_master.view',
    ADD: 'entity_master.add',
    EDIT: 'entity_master.edit',
    DELETE: 'entity_master.delete',
  },
  department: {
    VIEW: 'department_master.view',
    ADD: 'department_master.add',
    EDIT: 'department_master.edit',
    DELETE: 'department_master.delete',
  },
  designation: {
    VIEW: 'designation_master.view',
    ADD: 'designation_master.add',
    EDIT: 'designation_master.edit',
    DELETE: 'designation_master.delete',
  },
  employee: {
    VIEW: 'employee_master.view',
    ADD: 'employee_master.add',
    EDIT: 'employee_master.edit',
    DELETE: 'employee_master.delete',
  },
  moduleMaster: {
    VIEW: 'module_master.view',
    ADD: 'module_master.add',
    EDIT: 'module_master.edit',
    DELETE: 'module_master.delete',
  },
  subModuleMaster: {
    VIEW: 'sub_module_master.view',
    ADD: 'sub_module_master.add',
    EDIT: 'sub_module_master.edit',
    DELETE: 'sub_module_master.delete',
  },
} as const;

export type MasterPermissionKeys = typeof DEFAULT_MASTER_PERMISSIONS;
