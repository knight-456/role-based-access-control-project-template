import { DEFAULT_API_RESPONSE_KEYS, DEFAULT_PAGINATION_KEYS } from './apiKeys.constants';
import { DEFAULT_AUTH_KEYS } from './auth.constants';
import { DEFAULT_ACTION_KEYS, DEFAULT_ACTION_CONFIGS } from './actions.constants';
import { DEFAULT_ROLE_KEYS } from './roles.constants';
import { DEFAULT_PERMISSION_KEYS } from './permissions.constants';
import { DEFAULT_MASTER_KEYS } from './masters.constants';
import { DEFAULT_ENDPOINTS } from './endpoints.constants';
import { DEFAULT_LOCALE_STRINGS, RBACLocaleStrings } from './i18n.constants';

export * from './apiKeys.constants';
export * from './auth.constants';
export * from './actions.constants';
export * from './roles.constants';
export * from './permissions.constants';
export * from './masters.constants';
export * from './endpoints.constants';
export * from './i18n.constants';

export interface ActionConfigItem {
  actionId: number;
  action_key: string;
  action_name: string;
  sort_order: number;
}

/**
 * Global Constants Container.
 * All adapters and components reference this object instead of raw strings.
 */
export const RBAC_CONSTANTS = {
  api: { ...DEFAULT_API_RESPONSE_KEYS },
  pagination: { ...DEFAULT_PAGINATION_KEYS },
  auth: { ...DEFAULT_AUTH_KEYS },
  actions: { ...DEFAULT_ACTION_KEYS },
  actionConfigs: [...DEFAULT_ACTION_CONFIGS] as ActionConfigItem[],
  roles: { ...DEFAULT_ROLE_KEYS },
  permissions: { ...DEFAULT_PERMISSION_KEYS },
  masters: { ...DEFAULT_MASTER_KEYS },
  endpoints: { ...DEFAULT_ENDPOINTS },
  i18n: { ...DEFAULT_LOCALE_STRINGS },
};

export type RBACConstantsRegistry = typeof RBAC_CONSTANTS;

/**
 * Helper to override keys at runtime or during app initialization.
 */
export function configureRBACConstants(overrides: Partial<{
  api: Partial<typeof DEFAULT_API_RESPONSE_KEYS>;
  pagination: Partial<typeof DEFAULT_PAGINATION_KEYS>;
  auth: Partial<typeof DEFAULT_AUTH_KEYS>;
  actions: Partial<typeof DEFAULT_ACTION_KEYS>;
  actionConfigs: ActionConfigItem[];
  roles: Partial<typeof DEFAULT_ROLE_KEYS>;
  permissions: Partial<typeof DEFAULT_PERMISSION_KEYS>;
  masters: Partial<typeof DEFAULT_MASTER_KEYS>;
  endpoints: Partial<typeof DEFAULT_ENDPOINTS>;
  i18n: Partial<RBACLocaleStrings>;
}>): void {
  if (overrides.api) Object.assign(RBAC_CONSTANTS.api, overrides.api);
  if (overrides.pagination) Object.assign(RBAC_CONSTANTS.pagination, overrides.pagination);
  if (overrides.auth) Object.assign(RBAC_CONSTANTS.auth, overrides.auth);
  if (overrides.actions) Object.assign(RBAC_CONSTANTS.actions, overrides.actions);
  if (overrides.actionConfigs) RBAC_CONSTANTS.actionConfigs = overrides.actionConfigs;
  if (overrides.roles) Object.assign(RBAC_CONSTANTS.roles, overrides.roles);
  if (overrides.permissions) Object.assign(RBAC_CONSTANTS.permissions, overrides.permissions);
  if (overrides.masters) Object.assign(RBAC_CONSTANTS.masters, overrides.masters);
  if (overrides.endpoints) Object.assign(RBAC_CONSTANTS.endpoints, overrides.endpoints);
  if (overrides.i18n) Object.assign(RBAC_CONSTANTS.i18n, overrides.i18n);
}
