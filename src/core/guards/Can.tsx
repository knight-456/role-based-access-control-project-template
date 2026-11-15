import React from 'react';
import { usePermission } from '../context/PermissionContext';
import { useRBACConfig } from '../context/RBACConfigContext';
import { resolvePermission } from '../utils/permissionResolver';

export interface CanProps {
  /**
   * The permission key to check e.g. "roles.add", "entity_master.edit"
   */
  do?: string;
  /**
   * Alternatively specify module and action without hardcoding the slug format:
   * e.g. <Can module="roles" action="add">
   */
  module?: string;
  action?: string;
  /**
   * Check route permission
   */
  route?: string;
  /**
   * Multiple permissions check (all must be present)
   */
  all?: string[];
  /**
   * Multiple permissions check (any one is sufficient)
   */
  any?: string[];
  /**
   * Invert the check (render if user DOES NOT have permission)
   */
  not?: boolean;
  /**
   * Fallback UI if access denied
   */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({
  do: actionKey,
  module: moduleKey,
  action: moduleAction,
  route,
  all,
  any,
  not = false,
  fallback = null,
  children,
}) => {
  const { hasPermission, canNavigate } = usePermission();
  const { config } = useRBACConfig();

  let isAllowed = true;

  // Resolve permission key if module and action are supplied or if 'do' has aliases
  const targetPermission = resolvePermission(
    { permissionKey: actionKey, module: moduleKey, action: moduleAction },
    config.permissionResolver,
    config.permissionAliases
  );

  if (targetPermission) {
    isAllowed = isAllowed && hasPermission(targetPermission);
  }

  if (route) {
    isAllowed = isAllowed && canNavigate(route);
  }

  if (all && all.length > 0) {
    isAllowed =
      isAllowed &&
      all.every((k) =>
        hasPermission(
          resolvePermission({ permissionKey: k }, config.permissionResolver, config.permissionAliases)
        )
      );
  }

  if (any && any.length > 0) {
    isAllowed =
      isAllowed &&
      any.some((k) =>
        hasPermission(
          resolvePermission({ permissionKey: k }, config.permissionResolver, config.permissionAliases)
        )
      );
  }

  const result = not ? !isAllowed : isAllowed;

  if (!result) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
