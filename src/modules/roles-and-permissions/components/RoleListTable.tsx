import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRoles } from '../../../core/hooks/useRoles';
import { useRBACConfig } from '../../../core/context/RBACConfigContext';
import { isActionAllowed } from '../../../config/rbac.config';
import { StandardRole, RoleFormData } from '../../../core/types';
import { Can } from '../../../core/guards/Can';
import { Table, Column, TableProps, BatchAction } from '../../../shared/components/Table';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { Modal } from '../../../shared/components/Modal';
import { RoleModal } from './RoleModal';
import { PermissionMatrix } from './PermissionMatrix';
import { RoleListTableClassNames } from '../../../core/types/style.types';
import { RBAC_CONSTANTS } from '../../../constants';

export interface RoleListTableProps {
  title?: string;
  description?: string;
  entities?: Array<{ id: string | number; name: string }>;
  departments?: Array<{ id: string | number; name: string }>;

  // Dynamic Action Toggles
  allowAdd?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowPermissions?: boolean;

  // Custom permission key overrides (e.g. if backend uses 'roles.addition')
  permissionKeys?: {
    view?: string;
    add?: string;
    edit?: string;
    delete?: string;
    assign?: string;
  };

  // Dynamic Column Customization
  columns?: Column<StandardRole>[];
  extendColumns?: Column<StandardRole>[];
  omitColumns?: string[];

  // Custom row actions
  customActions?: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    onClick: (role: StandardRole) => void;
  }>;

  // Sorting Customization (Opt-in)
  defaultSortBy?: string;
  defaultSortOrder?: 'asc' | 'desc';

  // Bulk Row Selection & Batch Actions (Opt-in)
  selectable?: boolean;
  batchActions?: BatchAction<StandardRole>[];

  // URL Query Sync (Deep linking - Opt-in)
  syncWithUrl?: boolean;

  // Complete Style Overrides
  classNames?: RoleListTableClassNames;
  unstyled?: boolean;

  // Slot / Render Props
  renderHeader?: (props: {
    title: string;
    description?: string;
    canAdd: boolean;
    onOpenCreate: () => void;
  }) => React.ReactNode;
  renderSearch?: (props: {
    search: string;
    onSearchChange: (value: string) => void;
    placeholder: string;
  }) => React.ReactNode;
  renderTable?: (props: TableProps<StandardRole>) => React.ReactNode;
}

export const RoleListTable: React.FC<RoleListTableProps> = ({
  title = 'Roles & Permissions',
  description = 'Manage organizational roles, assign granular permissions, and configure access scopes.',
  entities = [],
  departments = [],
  allowAdd: propAllowAdd,
  allowEdit: propAllowEdit,
  allowDelete: propAllowDelete,
  allowPermissions: propAllowPermissions,
  permissionKeys,
  columns: customColumns,
  extendColumns = [],
  omitColumns = [],
  customActions = [],
  defaultSortBy,
  defaultSortOrder,
  selectable = false,
  batchActions,
  syncWithUrl = false,
  classNames,
  unstyled = false,
  renderHeader,
  renderSearch,
  renderTable,
}) => {
  const { config } = useRBACConfig();
  const i18n = RBAC_CONSTANTS.i18n;
  const { roles, total, page, limit, isLoading, fetchRoles, createRole, editRole, deleteRole } = useRoles();

  // Resolve actions permission from props OR central config
  const roleCrudConfig = config.features.rolesAndPermissions.roleCrud;
  const canAdd = propAllowAdd !== undefined ? propAllowAdd : isActionAllowed(roleCrudConfig, 'add');
  const canEdit = propAllowEdit !== undefined ? propAllowEdit : isActionAllowed(roleCrudConfig, 'edit');
  const canDelete = propAllowDelete !== undefined ? propAllowDelete : isActionAllowed(roleCrudConfig, 'delete');
  const canManagePermissions =
    propAllowPermissions !== undefined
      ? propAllowPermissions
      : config.features.rolesAndPermissions.permissionAssignmentMatrix;

  // URL query sync initialization (if syncWithUrl is active)
  const initialUrlParams = useMemo(() => {
    if (!syncWithUrl || typeof window === 'undefined') return {};
    const sp = new URLSearchParams(window.location.search);
    return {
      search: sp.get('search') || '',
      sortBy: sp.get('sortBy') || defaultSortBy,
      sortOrder: (sp.get('sortOrder') as 'asc' | 'desc') || defaultSortOrder,
      page: sp.get('page') ? Number(sp.get('page')) : undefined,
    };
  }, [syncWithUrl, defaultSortBy, defaultSortOrder]);

  const [search, setSearch] = useState<string>(initialUrlParams.search || '');
  const [sortBy, setSortBy] = useState<string | undefined>(initialUrlParams.sortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(initialUrlParams.sortOrder);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<StandardRole | null>(null);
  const [matrixRole, setMatrixRole] = useState<StandardRole | null>(null);
  const [deleteTargetRole, setDeleteTargetRole] = useState<StandardRole | null>(null);

  // Synchronize state with URL query parameters when enabled
  const updateUrlParams = useCallback(
    (params: Record<string, string | number | undefined>) => {
      if (!syncWithUrl || typeof window === 'undefined') return;
      const url = new URL(window.location.href);
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== null) {
          url.searchParams.set(k, String(v));
        } else {
          url.searchParams.delete(k);
        }
      });
      window.history.replaceState({}, '', url.toString());
    },
    [syncWithUrl]
  );

  useEffect(() => {
    const fetchParams: Record<string, any> = {
      page: initialUrlParams.page || 1,
      limit: 10,
      search,
    };
    if (sortBy) fetchParams.sortBy = sortBy;
    if (sortOrder) fetchParams.sortOrder = sortOrder;

    fetchRoles(fetchParams);
    updateUrlParams({
      search,
      sortBy,
      sortOrder,
      page: initialUrlParams.page || 1,
    });
  }, [fetchRoles, search, sortBy, sortOrder, initialUrlParams.page, updateUrlParams]);

  const handleCreateOrUpdate = async (formData: RoleFormData) => {
    try {
      if (editingRole) {
        await editRole(editingRole.id, formData);
        if (config.onNotification) {
          config.onNotification({
            type: 'success',
            title: i18n.success || 'Success',
            message: `Role "${formData.role_name}" updated successfully`,
          });
        }
      } else {
        await createRole(formData);
        if (config.onNotification) {
          config.onNotification({
            type: 'success',
            title: i18n.success || 'Success',
            message: `Role "${formData.role_name}" created successfully`,
          });
        }
      }
    } catch (err: any) {
      if (config.onNotification) {
        config.onNotification({
          type: 'error',
          title: i18n.error || 'Error',
          message: err.message || 'Failed to save role',
        });
      }
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetRole) return;
    try {
      await deleteRole(deleteTargetRole.id);
      if (config.onNotification) {
        config.onNotification({
          type: 'success',
          title: i18n.success || 'Success',
          message: `Role "${deleteTargetRole.name}" deleted successfully`,
        });
      }
      setDeleteTargetRole(null);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTargetRole.id));
    } catch (err: any) {
      if (config.onNotification) {
        config.onNotification({
          type: 'error',
          title: i18n.error || 'Error',
          message: err.message || 'Delete role failed',
        });
      }
    }
  };

  const handleBatchDelete = async (ids: (string | number)[]) => {
    if (!window.confirm(`Are you sure you want to delete ${ids.length} roles?`)) return;
    try {
      await Promise.all(ids.map((id) => deleteRole(id)));
      if (config.onNotification) {
        config.onNotification({
          type: 'success',
          title: i18n.success || 'Success',
          message: `${ids.length} roles deleted successfully`,
        });
      }
      setSelectedIds([]);
    } catch (err: any) {
      if (config.onNotification) {
        config.onNotification({
          type: 'error',
          title: i18n.error || 'Error',
          message: err.message || 'Batch delete failed',
        });
      }
    }
  };

  const effectiveBatchActions: BatchAction<StandardRole>[] = useMemo(() => {
    if (batchActions) return batchActions;
    if (canDelete) {
      return [
        {
          key: 'batch-delete',
          label: i18n.delete || 'Delete',
          variant: 'danger',
          onClick: handleBatchDelete,
        },
      ];
    }
    return [];
  }, [batchActions, canDelete, i18n.delete]);

  const defaultColumns: Column<StandardRole>[] = [
    {
      key: 'name',
      header: 'Role Name',
      sortable: true,
      render: (role) => (
        <div>
          <div className="font-semibold text-gray-900">{role.name}</div>
          <div className="text-xs text-gray-400 font-mono">{role.key}</div>
        </div>
      ),
    },
    {
      key: 'scope',
      header: 'Scope',
      render: (role) => (
        <div className="text-xs text-gray-600">
          <div>Entity: {role.entityName || 'Global'}</div>
          {role.departmentName && <div>Dept: {role.departmentName}</div>}
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (role) => <span className="text-xs text-gray-500">{role.description || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      sortable: true,
      render: (role) => (
        <Badge variant={role.isActive ? 'success' : 'neutral'}>
          {role.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const computedColumns = useMemo<Column<StandardRole>[]>(() => {
    let base = customColumns || defaultColumns;
    if (omitColumns.length > 0) {
      base = base.filter((c) => !omitColumns.includes(c.key));
    }
    const combined = [...base, ...extendColumns];

    const hasActions = canEdit || canDelete || canManagePermissions || customActions.length > 0;
    if (!hasActions) return combined;

    return [
      ...combined,
      {
        key: '_actions',
        header: i18n.actions || 'Actions',
        align: 'right',
        render: (role: StandardRole) => (
          <div className="flex items-center justify-end gap-1.5">
            {customActions.map((ca) => (
              <Button
                key={ca.key}
                variant="ghost"
                size="sm"
                onClick={() => ca.onClick(role)}
              >
                {ca.icon} {ca.label}
              </Button>
            ))}

            {canManagePermissions && (
              <Can
                do={permissionKeys?.assign}
                module={!permissionKeys?.assign ? 'roles' : undefined}
                action={!permissionKeys?.assign ? 'assign' : undefined}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMatrixRole(role)}
                >
                  Permissions
                </Button>
              </Can>
            )}

            {canEdit && (
              <Can
                do={permissionKeys?.edit}
                module={!permissionKeys?.edit ? 'roles' : undefined}
                action={!permissionKeys?.edit ? 'edit' : undefined}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingRole(role);
                    setIsRoleModalOpen(true);
                  }}
                >
                  {i18n.edit || 'Edit'}
                </Button>
              </Can>
            )}

            {canDelete && (
              <Can
                do={permissionKeys?.delete}
                module={!permissionKeys?.delete ? 'roles' : undefined}
                action={!permissionKeys?.delete ? 'delete' : undefined}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => setDeleteTargetRole(role)}
                >
                  {i18n.delete || 'Delete'}
                </Button>
              </Can>
            )}
          </div>
        ),
      },
    ];
  }, [
    customColumns,
    defaultColumns,
    omitColumns,
    extendColumns,
    canEdit,
    canDelete,
    canManagePermissions,
    customActions,
    permissionKeys,
    i18n,
  ]);

  const tableProps: TableProps<StandardRole> = {
    columns: computedColumns,
    data: roles,
    isLoading,
    classNames: classNames?.table,
    unstyled,
    sortBy,
    sortOrder,
    onSortChange: (newSortBy, newSortOrder) => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
    },
    selectable,
    selectedIds,
    onSelectRow: (id) => {
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    },
    onSelectAll: (checked) => {
      setSelectedIds(checked ? roles.map((r) => r.id) : []);
    },
    batchActions: effectiveBatchActions,
    pagination: {
      page,
      limit,
      total,
      onPageChange: (newPage) => {
        fetchRoles({ page: newPage, limit, search, sortBy, sortOrder });
        updateUrlParams({ page: newPage });
      },
    },
  };

  return (
    <div className={classNames?.root || (unstyled ? '' : 'space-y-4')}>
      {/* Top Header */}
      {renderHeader ? (
        renderHeader({
          title,
          description,
          canAdd,
          onOpenCreate: () => {
            setEditingRole(null);
            setIsRoleModalOpen(true);
          },
        })
      ) : (
        <div
          className={
            classNames?.header?.container ||
            (unstyled ? '' : 'flex flex-col sm:flex-row sm:items-center justify-between gap-4')
          }
        >
          <div>
            <h2 className={classNames?.header?.title || (unstyled ? '' : 'text-xl font-bold text-gray-900')}>
              {title}
            </h2>
            <p className={classNames?.header?.description || (unstyled ? '' : 'text-xs text-gray-500 mt-1')}>
              {description}
            </p>
          </div>

          {canAdd && (
            <Can
              do={permissionKeys?.add}
              module={!permissionKeys?.add ? 'roles' : undefined}
              action={!permissionKeys?.add ? 'add' : undefined}
            >
              <Button
                variant="primary"
                className={classNames?.header?.createButton}
                onClick={() => {
                  setEditingRole(null);
                  setIsRoleModalOpen(true);
                }}
              >
                + {i18n.create || 'Create Role'}
              </Button>
            </Can>
          )}
        </div>
      )}

      {/* Filter / Search Bar */}
      {renderSearch ? (
        renderSearch({
          search,
          onSearchChange: setSearch,
          placeholder: `${i18n.search || 'Search'} roles...`,
        })
      ) : (
        <div className={classNames?.search?.container || (unstyled ? '' : 'flex items-center gap-3')}>
          <input
            type="text"
            placeholder={`${i18n.search || 'Search'} roles...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={
              classNames?.search?.input ||
              (unstyled
                ? ''
                : 'w-full sm:w-72 px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#28518F]')
            }
          />
        </div>
      )}

      {/* Table: Slot or Default Table */}
      {renderTable ? renderTable(tableProps) : <Table {...tableProps} />}

      {/* Create / Edit Role Modal */}
      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingRole}
        entities={entities}
        departments={departments}
      />

      {/* Permission Assignment Matrix Modal */}
      <Modal
        isOpen={Boolean(matrixRole)}
        onClose={() => setMatrixRole(null)}
        title={`Permissions Matrix: ${matrixRole?.name}`}
        description="Toggle checkboxes to configure granular actions allowed for this role."
        maxWidth="4xl"
      >
        {matrixRole && (
          <PermissionMatrix
            role={matrixRole}
            onSuccess={() => {}}
            onCancel={() => setMatrixRole(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTargetRole)}
        onClose={() => setDeleteTargetRole(null)}
        title="Delete Role"
        maxWidth="sm"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete role <strong>{deleteTargetRole?.name}</strong>? Users assigned to this
            role may lose access.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteTargetRole(null)}>
              {i18n.cancel || 'Cancel'}
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              {i18n.confirm || 'Yes, Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
