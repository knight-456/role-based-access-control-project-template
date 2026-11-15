import { RBACAdapters } from '../core/types/adapter.types';
import { DEFAULT_ADAPTERS } from '../core/adapters';
import { RBAC_CONSTANTS, configureRBACConstants, RBACLocaleStrings } from '../constants';
import { configurePermissionKeys } from '../constants/permissions';
import { RBACTheme, defaultRBACTheme, mergeThemes } from '../theme';
import { PermissionKeyResolverFn, defaultPermissionResolver } from '../core/utils/permissionResolver';
import { RouterAdapter } from '../core/types/router.types';
import { PaginationConfig, defaultPaginationConfig } from '../core/types/pagination.types';

export interface RBACNotification {
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

export type RBACNotificationHandler = (notification: RBACNotification) => void;

export interface ModuleFeatureConfig {
  enabled?: boolean;
  allowAdd?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowView?: boolean;
}

export type FeatureToggle = boolean | ModuleFeatureConfig;

export interface RBACFeaturesConfig {
  masters: {
    entity: FeatureToggle;
    department: FeatureToggle;
    designation: FeatureToggle;
    employee: FeatureToggle;
    moduleMaster: FeatureToggle;
    subModuleMaster: FeatureToggle;
    [customMaster: string]: FeatureToggle | undefined;
  };
  rolesAndPermissions: {
    roleCrud: FeatureToggle;
    permissionAssignmentMatrix: boolean;
    permissionRegistry: boolean;
  };
}

export interface RBACConfig {
  apiBaseUrl: string;
  features: RBACFeaturesConfig;
  endpoints: typeof RBAC_CONSTANTS.endpoints;
  adapters: RBACAdapters;
  theme: RBACTheme;
  router?: RouterAdapter;
  pagination: PaginationConfig;
  permissionResolver: PermissionKeyResolverFn;
  permissionAliases: Record<string, string>;
  i18n?: Partial<RBACLocaleStrings>;
  onNotification?: RBACNotificationHandler;
  getToken?: () => string | null | undefined;
  getTenantId?: () => string | number | null | undefined;
  getCustomHeaders?: () => Record<string, string>;
  refreshToken?: () => Promise<string | null | undefined>;
  onUnauthorized?: () => void;
}

export const defaultRBACConfig: RBACConfig = {
  apiBaseUrl: 'https://containerapi1.wipl.co.in',
  features: {
    masters: {
      entity: { enabled: true, allowAdd: true, allowEdit: true, allowDelete: true },
      department: { enabled: true, allowAdd: true, allowEdit: true, allowDelete: true },
      designation: { enabled: true, allowAdd: true, allowEdit: true, allowDelete: true },
      employee: { enabled: true, allowAdd: true, allowEdit: true, allowDelete: true },
      moduleMaster: { enabled: true, allowAdd: true, allowEdit: true, allowDelete: true },
      subModuleMaster: { enabled: true, allowAdd: true, allowEdit: true, allowDelete: true },
    },
    rolesAndPermissions: {
      roleCrud: { enabled: true, allowAdd: true, allowEdit: true, allowDelete: true },
      permissionAssignmentMatrix: true,
      permissionRegistry: true,
    },
  },
  endpoints: { ...RBAC_CONSTANTS.endpoints },
  adapters: { ...DEFAULT_ADAPTERS },
  theme: defaultRBACTheme,
  pagination: defaultPaginationConfig,
  permissionResolver: defaultPermissionResolver,
  permissionAliases: {},
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || undefined;
    }
    return undefined;
  },
};

/**
 * Check if a specific CRUD action is allowed for a given feature toggle
 */
export function isActionAllowed(
  configValue: FeatureToggle | undefined,
  action: 'add' | 'edit' | 'delete' | 'view'
): boolean {
  if (configValue === undefined || configValue === false) return false;
  if (configValue === true) return true;
  if (configValue.enabled === false) return false;
  if (action === 'add') return configValue.allowAdd ?? true;
  if (action === 'edit') return configValue.allowEdit ?? true;
  if (action === 'delete') return configValue.allowDelete ?? true;
  if (action === 'view') return configValue.allowView ?? true;
  return true;
}

/**
 * Deep merge helper to create full config with user overrides
 */
export function createRBACConfig(custom: Partial<{
  apiBaseUrl: string;
  features: Partial<{
    masters: Partial<Record<string, FeatureToggle>>;
    rolesAndPermissions: Partial<{
      roleCrud: FeatureToggle;
      permissionAssignmentMatrix: boolean;
      permissionRegistry: boolean;
    }>;
  }>;
  endpoints: Partial<typeof RBAC_CONSTANTS.endpoints>;
  adapters: Partial<{
    auth: Partial<RBACAdapters['auth']>;
    roles: Partial<RBACAdapters['roles']>;
    permissions: Partial<RBACAdapters['permissions']>;
    masters: Partial<RBACAdapters['masters']>;
  }>;
  theme: Partial<RBACTheme>;
  router: RouterAdapter;
  pagination: Partial<PaginationConfig>;
  permissionResolver: PermissionKeyResolverFn;
  permissionAliases: Record<string, string>;
  permissionKeys: Parameters<typeof configurePermissionKeys>[0];
  constants: Parameters<typeof configureRBACConstants>[0];
  i18n: Partial<RBACLocaleStrings>;
  onNotification: RBACNotificationHandler;
  getToken: () => string | null | undefined;
  getTenantId: () => string | number | null | undefined;
  getCustomHeaders: () => Record<string, string>;
  refreshToken: () => Promise<string | null | undefined>;
  onUnauthorized: () => void;
}> = {}): RBACConfig {
  if (custom.constants) {
    configureRBACConstants(custom.constants);
  }

  if (custom.permissionKeys) {
    configurePermissionKeys(custom.permissionKeys);
  }

  if (custom.i18n) {
    configureRBACConstants({ i18n: custom.i18n });
  }

  const features: RBACFeaturesConfig = {
    masters: {
      ...defaultRBACConfig.features.masters,
      ...(custom.features?.masters || {}),
    },
    rolesAndPermissions: {
      ...defaultRBACConfig.features.rolesAndPermissions,
      ...(custom.features?.rolesAndPermissions || {}),
    },
  };

  const endpoints = {
    ...defaultRBACConfig.endpoints,
    ...(custom.endpoints || {}),
  };

  const adapters: RBACAdapters = {
    auth: { ...defaultRBACConfig.adapters.auth, ...(custom.adapters?.auth || {}) },
    roles: { ...defaultRBACConfig.adapters.roles, ...(custom.adapters?.roles || {}) },
    permissions: { ...defaultRBACConfig.adapters.permissions, ...(custom.adapters?.permissions || {}) },
    masters: { ...defaultRBACConfig.adapters.masters, ...(custom.adapters?.masters || {}) },
  };

  const theme = mergeThemes(defaultRBACTheme, custom.theme);
  const pagination = { ...defaultPaginationConfig, ...(custom.pagination || {}) };

  return {
    apiBaseUrl: custom.apiBaseUrl || defaultRBACConfig.apiBaseUrl,
    features,
    endpoints,
    adapters,
    theme,
    router: custom.router || defaultRBACConfig.router,
    pagination,
    permissionResolver: custom.permissionResolver || defaultRBACConfig.permissionResolver,
    permissionAliases: {
      ...defaultRBACConfig.permissionAliases,
      ...(custom.permissionAliases || {}),
    },
    i18n: custom.i18n,
    onNotification: custom.onNotification,
    getToken: custom.getToken || defaultRBACConfig.getToken,
    getTenantId: custom.getTenantId || defaultRBACConfig.getTenantId,
    getCustomHeaders: custom.getCustomHeaders || defaultRBACConfig.getCustomHeaders,
    refreshToken: custom.refreshToken || defaultRBACConfig.refreshToken,
    onUnauthorized: custom.onUnauthorized || defaultRBACConfig.onUnauthorized,
  };
}
