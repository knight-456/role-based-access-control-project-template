import { DEFAULT_ROLE_PERMISSIONS } from './rolePermissions.constants';
import { DEFAULT_MASTER_PERMISSIONS } from './masterPermissions.constants';

export * from './rolePermissions.constants';
export * from './masterPermissions.constants';

export const PERMISSION_KEYS = {
  roles: { ...DEFAULT_ROLE_PERMISSIONS },
  masters: {
    entity: { ...DEFAULT_MASTER_PERMISSIONS.entity },
    department: { ...DEFAULT_MASTER_PERMISSIONS.department },
    designation: { ...DEFAULT_MASTER_PERMISSIONS.designation },
    employee: { ...DEFAULT_MASTER_PERMISSIONS.employee },
    moduleMaster: { ...DEFAULT_MASTER_PERMISSIONS.moduleMaster },
    subModuleMaster: { ...DEFAULT_MASTER_PERMISSIONS.subModuleMaster },
  },
};

export type PermissionKeysContainer = typeof PERMISSION_KEYS;

/**
 * Configure permission key overrides globally (e.g. if backend uses roles.addition)
 */
export function configurePermissionKeys(overrides: Partial<{
  roles: Partial<typeof DEFAULT_ROLE_PERMISSIONS>;
  masters: Partial<{
    entity: Partial<typeof DEFAULT_MASTER_PERMISSIONS.entity>;
    department: Partial<typeof DEFAULT_MASTER_PERMISSIONS.department>;
    designation: Partial<typeof DEFAULT_MASTER_PERMISSIONS.designation>;
    employee: Partial<typeof DEFAULT_MASTER_PERMISSIONS.employee>;
    moduleMaster: Partial<typeof DEFAULT_MASTER_PERMISSIONS.moduleMaster>;
    subModuleMaster: Partial<typeof DEFAULT_MASTER_PERMISSIONS.subModuleMaster>;
  }>;
}>): void {
  if (overrides.roles) Object.assign(PERMISSION_KEYS.roles, overrides.roles);
  if (overrides.masters) {
    if (overrides.masters.entity) Object.assign(PERMISSION_KEYS.masters.entity, overrides.masters.entity);
    if (overrides.masters.department) Object.assign(PERMISSION_KEYS.masters.department, overrides.masters.department);
    if (overrides.masters.designation) Object.assign(PERMISSION_KEYS.masters.designation, overrides.masters.designation);
    if (overrides.masters.employee) Object.assign(PERMISSION_KEYS.masters.employee, overrides.masters.employee);
    if (overrides.masters.moduleMaster) Object.assign(PERMISSION_KEYS.masters.moduleMaster, overrides.masters.moduleMaster);
    if (overrides.masters.subModuleMaster) Object.assign(PERMISSION_KEYS.masters.subModuleMaster, overrides.masters.subModuleMaster);
  }
}
