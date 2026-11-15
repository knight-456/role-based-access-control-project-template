import { PERMISSION_KEYS } from '../../constants/permissions';

export type PermissionKeyResolverFn = (moduleKey: string, actionKey: string) => string;

/**
 * Default resolver produces: `<module>.<action>` (e.g. "roles.add", "department_master.view")
 */
export const defaultPermissionResolver: PermissionKeyResolverFn = (moduleKey: string, actionKey: string): string => {
  // Check if defined in PERMISSION_KEYS container
  if (moduleKey === 'roles') {
    const act = actionKey.toUpperCase() as keyof typeof PERMISSION_KEYS.roles;
    if (PERMISSION_KEYS.roles[act]) return PERMISSION_KEYS.roles[act];
  }

  const masterModule = PERMISSION_KEYS.masters[moduleKey as keyof typeof PERMISSION_KEYS.masters];
  if (masterModule) {
    const act = actionKey.toUpperCase() as keyof typeof masterModule;
    if (masterModule[act]) return masterModule[act];
  }

  return `${moduleKey}.${actionKey}`;
};

/**
 * Resolves a permission string, checking alias maps if present
 */
export function resolvePermission(
  input: { permissionKey?: string; module?: string; action?: string },
  resolver: PermissionKeyResolverFn = defaultPermissionResolver,
  aliasMap: Record<string, string> = {}
): string {
  let resolved = input.permissionKey || '';

  if (!resolved && input.module && input.action) {
    resolved = resolver(input.module, input.action);
  }

  // Check alias override if configured
  if (resolved && aliasMap[resolved]) {
    return aliasMap[resolved];
  }

  return resolved;
}
