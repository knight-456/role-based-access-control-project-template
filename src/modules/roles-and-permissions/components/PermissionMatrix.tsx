import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { usePermissions } from '../../../core/hooks/usePermissions';
import { useRoles } from '../../../core/hooks/useRoles';
import { StandardRole, RolePermissionMatrixRow } from '../../../core/types';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { useRBACConfig } from '../../../core/context/RBACConfigContext';
import { RBAC_CONSTANTS } from '../../../constants';

export interface PermissionMatrixProps {
  role: StandardRole;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ role, onSuccess, onCancel }) => {
  const { config } = useRBACConfig();
  const i18n = RBAC_CONSTANTS.i18n;
  const { actions, registryModules, fetchActions, fetchRegistry, buildMatrixRows, isLoading: isRegistryLoading } =
    usePermissions();
  const { fetchRolePermissions, assignPermissions } = useRoles();

  const [assignedIds, setAssignedIds] = useState<Set<string | number>>(new Set());
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Load actions, registry tree, and current role permissions
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setInitialLoading(true);
      try {
        const [, , currentPerms] = await Promise.all([
          fetchActions(),
          fetchRegistry({ limit: 100 }),
          fetchRolePermissions(role.id),
        ]);
        if (isMounted) {
          setAssignedIds(new Set(currentPerms));
        }
      } catch (err) {
        console.error('Failed to load permission matrix data', err);
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [fetchActions, fetchRegistry, fetchRolePermissions, role.id]);

  // Compute matrix rows
  const matrixRows = useMemo<RolePermissionMatrixRow[]>(() => {
    return buildMatrixRows(registryModules, assignedIds, actions);
  }, [buildMatrixRows, registryModules, assignedIds, actions]);

  // Toggle single action on a module
  const toggleAction = useCallback((permissionActionId: string | number) => {
    if (!permissionActionId) return;
    setAssignedIds((prev) => {
      const next = new Set(prev);
      if (next.has(permissionActionId)) {
        next.delete(permissionActionId);
      } else {
        next.add(permissionActionId);
      }
      return next;
    });
  }, []);

  // Toggle entire row (all actions on one module)
  const toggleRow = useCallback((row: RolePermissionMatrixRow) => {
    const validActionIds = row.actions.map((a: { permissionActionId: string | number }) => a.permissionActionId).filter(Boolean);
    if (validActionIds.length === 0) return;

    setAssignedIds((prev) => {
      const next = new Set(prev);
      const allRowSelected = validActionIds.every((id: string | number) => next.has(id));

      if (allRowSelected) {
        validActionIds.forEach((id: string | number) => next.delete(id));
      } else {
        validActionIds.forEach((id: string | number) => next.add(id));
      }
      return next;
    });
  }, []);

  // Toggle entire column (e.g. all 'view' actions across all modules)
  const toggleColumn = useCallback(
    (actionKey: string) => {
      const columnActionIds: (string | number)[] = [];
      matrixRows.forEach((row) => {
        const cell = row.actions.find((a: { actionKey: string }) => a.actionKey === actionKey);
        if (cell && cell.permissionActionId) {
          columnActionIds.push(cell.permissionActionId);
        }
      });

      if (columnActionIds.length === 0) return;

      setAssignedIds((prev) => {
        const next = new Set(prev);
        const allColSelected = columnActionIds.every((id) => next.has(id));

        if (allColSelected) {
          columnActionIds.forEach((id) => next.delete(id));
        } else {
          columnActionIds.forEach((id) => next.add(id));
        }
        return next;
      });
    },
    [matrixRows]
  );

  // Select All / Deselect All
  const toggleAll = useCallback(() => {
    const allValidIds: (string | number)[] = [];
    matrixRows.forEach((row) => {
      row.actions.forEach((a: { permissionActionId: string | number }) => {
        if (a.permissionActionId) allValidIds.push(a.permissionActionId);
      });
    });

    setAssignedIds((prev) => {
      const allSelected = allValidIds.length > 0 && allValidIds.every((id) => prev.has(id));
      return allSelected ? new Set() : new Set(allValidIds);
    });
  }, [matrixRows]);

  const handleSave = async () => {
    setIsSubmitting(true);
    setSaveSuccess(false);
    try {
      await assignPermissions(role.id, Array.from(assignedIds));
      setSaveSuccess(true);
      if (config.onNotification) {
        config.onNotification({
          type: 'success',
          title: i18n.success || 'Success',
          message: `Permissions updated successfully for role "${role.name}"`,
        });
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (config.onNotification) {
        config.onNotification({
          type: 'error',
          title: i18n.error || 'Error',
          message: err.message || 'Failed to update permissions',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading || isRegistryLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#28518F] border-t-transparent mb-3"></div>
        <p className="text-sm text-gray-500">Loading permission matrix...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-900">Role: {role.name}</span>
          <Badge variant="info">{role.key}</Badge>
          <span className="text-xs text-gray-500">({assignedIds.size} permissions assigned)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleAll}>
            Toggle All
          </Button>
          <Button variant="primary" size="sm" isLoading={isSubmitting} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
          ✓ Permissions successfully updated for <strong>{role.name}</strong>.
        </div>
      )}

      {/* Checkbox Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-[#FAFAFC] text-gray-700 font-semibold">
            <tr>
              <th className="px-4 py-3 text-left w-1/3">Module / Sub-Module</th>
              {actions.map((act) => (
                <th key={act.id} className="px-3 py-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span>{act.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleColumn(act.key)}
                      className="text-[10px] text-blue-600 hover:underline font-normal"
                    >
                      toggle
                    </button>
                  </div>
                </th>
              ))}
              <th className="px-3 py-3 text-center">Row</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {matrixRows.map((row) => {
              const rowActionIds = row.actions.map((a: { permissionActionId: string | number }) => a.permissionActionId).filter(Boolean);
              const isRowFullySelected =
                rowActionIds.length > 0 && rowActionIds.every((id: string | number) => assignedIds.has(id));

              return (
                <tr key={`${row.moduleId}-${row.slug}`} className="hover:bg-gray-50/75 transition-colors">
                  {/* Module Name with Indentation based on level */}
                  <td className="px-4 py-3 text-gray-800">
                    <div
                      style={{ paddingLeft: `${row.level * 20}px` }}
                      className="flex items-center gap-2 font-medium"
                    >
                      {row.level > 0 && <span className="text-gray-300">↳</span>}
                      <span>{row.moduleName}</span>
                      <span className="text-xs text-gray-400 font-mono">({row.slug})</span>
                    </div>
                  </td>

                  {/* Actions Checkboxes */}
                  {actions.map((act) => {
                    const cell = row.actions.find((a: { actionKey: string }) => a.actionKey === act.key);
                    const isRegistered = Boolean(cell?.permissionActionId);
                    const isChecked = cell && cell.permissionActionId ? assignedIds.has(cell.permissionActionId) : false;

                    return (
                      <td key={act.id} className="px-3 py-3 text-center">
                        {isRegistered ? (
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => cell && toggleAction(cell.permissionActionId)}
                            className="h-4 w-4 rounded border-gray-300 text-[#28518F] focus:ring-[#28518F] cursor-pointer"
                          />
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Row Toggle */}
                  <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={isRowFullySelected}
                      onChange={() => toggleRow(row)}
                      className="h-4 w-4 rounded border-gray-300 text-[#28518F] focus:ring-[#28518F] cursor-pointer"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            {i18n.cancel || 'Cancel'}
          </Button>
        )}
        <Button variant="primary" isLoading={isSubmitting} onClick={handleSave}>
          {i18n.saveChanges || 'Save Permissions'}
        </Button>
      </div>
    </div>
  );
};
