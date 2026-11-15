import { RBACAdapters } from '../types';
import { defaultAuthAdapter } from './authAdapter';
import { defaultRolesAdapter } from './rolesAdapter';
import { defaultPermissionsAdapter } from './permissionsAdapter';
import { defaultMastersAdapter } from './mastersAdapter';

export * from './authAdapter';
export * from './rolesAdapter';
export * from './permissionsAdapter';
export * from './mastersAdapter';

export const DEFAULT_ADAPTERS: RBACAdapters = {
  auth: defaultAuthAdapter,
  roles: defaultRolesAdapter,
  permissions: defaultPermissionsAdapter,
  masters: defaultMastersAdapter,
};
