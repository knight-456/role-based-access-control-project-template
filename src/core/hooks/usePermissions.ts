import { useState, useCallback } from 'react';
import { useRBACConfig } from '../context/RBACConfigContext';
import { StandardAction, StandardModuleWithActions, RolePermissionMatrixRow, StandardPermissionActionMapping } from '../types';

export function usePermissions() {
  const { config, http } = useRBACConfig();
  const [actions, setActions] = useState<StandardAction[]>([]);
  const [registryModules, setRegistryModules] = useState<StandardModuleWithActions[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page] = useState<number>(1);
  const [limit] = useState<number>(50);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchActions = useCallback(async () => {
    try {
      const raw = await http.get(config.endpoints.PERMISSIONS_ACTIONS);
      const items = config.adapters.permissions.transformActionsListResponse(raw);
      setActions(items);
      return items;
    } catch (err: any) {
      console.warn('Failed to fetch actions list, using configured defaults', err);
      return config.adapters.permissions.transformActionsListResponse([]);
    }
  }, [config.adapters.permissions, config.endpoints.PERMISSIONS_ACTIONS, http]);

  const fetchRegistry = useCallback(
    async (params?: { page?: number; limit?: number }) => {
      setIsLoading(true);
      setError(null);
      try {
        const queryParams = {
          page: params?.page ?? page,
          limit: params?.limit ?? limit,
        };
        const raw = await http.get(config.endpoints.PERMISSIONS_REGISTRY, queryParams);
        const result = config.adapters.permissions.transformRegistryResponse(raw);
        setRegistryModules(result.items);
        setTotal(result.total);
        return result;
      } catch (err: any) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [config.adapters.permissions, config.endpoints.PERMISSIONS_REGISTRY, http, limit, page]
  );

  /**
   * Transforms hierarchical modules into a flat matrix structure for the UI table
   */
  const buildMatrixRows = useCallback(
    (
      modules: StandardModuleWithActions[],
      assignedActionIds: Set<string | number>,
      availableActions: StandardAction[],
      level = 0
    ): RolePermissionMatrixRow[] => {
      const rows: RolePermissionMatrixRow[] = [];

      modules.forEach((mod) => {
        // Map each available action to whether this module has it registered and assigned
        const actionRow = availableActions.map((action) => {
          const registered = mod.actions.find(
            (pa: StandardPermissionActionMapping) =>
              String(pa.actionId) === String(action.id) || pa.actionDetails?.key === action.key
          );

          const isAssigned = registered ? assignedActionIds.has(registered.permissionActionId) : false;

          return {
            actionKey: action.key,
            actionName: action.name,
            actionId: action.id,
            permissionActionId: registered ? registered.permissionActionId : '',
            permissionKey: registered ? registered.permissionKey : `${mod.slug}.${action.key}`,
            isAssigned,
          };
        });

        rows.push({
          moduleId: mod.id,
          moduleName: mod.name,
          slug: mod.slug,
          parentId: mod.parentId,
          level,
          actions: actionRow,
        });

        if (mod.children && mod.children.length > 0) {
          rows.push(...buildMatrixRows(mod.children, assignedActionIds, availableActions, level + 1));
        }
      });

      return rows;
    },
    []
  );

  return {
    actions,
    registryModules,
    total,
    page,
    limit,
    isLoading,
    error,
    fetchActions,
    fetchRegistry,
    buildMatrixRows,
  };
}
