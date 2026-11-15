import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Column, TableProps, BatchAction } from '../../../shared/components/Table';
import { Button } from '../../../shared/components/Button';
import { Modal } from '../../../shared/components/Modal';
import { Input } from '../../../shared/components/Input';
import { Can } from '../../../core/guards/Can';
import { useRBACConfig } from '../../../core/context/RBACConfigContext';
import { isActionAllowed, FeatureToggle } from '../../../config/rbac.config';
import { MasterDataTableClassNames } from '../../../core/types/style.types';
import { RBAC_CONSTANTS } from '../../../constants';
import { extractFieldErrors } from '../../../core/api/httpClient';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'select' | 'checkbox' | 'textarea';
  placeholder?: string;
  required?: boolean;
  defaultValue?: any;
  // Cascading & Dynamic options support
  options?: SelectOption[] | ((formData: Record<string, any>) => SelectOption[]);
  dependsOn?: string[]; // e.g. ['entityId'] - re-evaluates when entityId changes
  disabled?: boolean | ((formData: Record<string, any>) => boolean);
}

export interface CustomAction<T> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  permissionKey?: string;
  onClick: (item: T) => void;
}

export interface MasterDataTableProps<T extends { id: string | number; [key: string]: any }> {
  title: string;
  description?: string;
  permissionPrefix: string; // e.g. "department_master", "entity_master"
  featureKey?: string;      // maps to config.features.masters[featureKey] (e.g. "department")

  // Granular Action Permissions (Dynamic Toggle)
  allowAdd?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowSearch?: boolean;

  // Custom permission key overrides (e.g. if backend uses 'dept.create')
  permissionKeys?: {
    view?: string;
    add?: string;
    edit?: string;
    delete?: string;
  };

  // Dynamic Column Customization
  columns?: Column<T>[];                // Overrides entire default columns
  extendColumns?: Column<T>[];          // Appends additional columns to defaults
  omitColumns?: string[];               // Hides specific columns by key

  // Dynamic Form Customization
  formFields?: FormField[];             // Overrides entire default form fields
  extendFormFields?: FormField[];       // Appends additional form fields
  omitFormFields?: string[];            // Removes specific form fields

  // Custom Row Actions
  customActions?: CustomAction<T>[];

  // Sorting Customization (Opt-in)
  defaultSortBy?: string;
  defaultSortOrder?: 'asc' | 'desc';

  // Bulk Selection & Batch Actions (Opt-in)
  selectable?: boolean;
  batchActions?: BatchAction<T>[];

  // URL Query Sync (Deep linking - Opt-in)
  syncWithUrl?: boolean;

  // Complete Style & ClassName Overrides
  classNames?: MasterDataTableClassNames;
  unstyled?: boolean;                   // Strips all default styling if true

  // Slot / Render Props Overrides (Optional custom UI replacement)
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
  renderTable?: (props: TableProps<T>) => React.ReactNode;

  // Hook provider
  useMasterHook: () => {
    items: T[];
    total: number;
    page: number;
    limit: number;
    isLoading: boolean;
    fetchItems: (params?: any) => Promise<any>;
    createItem: (payload: any) => Promise<any>;
    editItem: (id: string | number, payload: any) => Promise<any>;
    deleteItem: (id: string | number) => Promise<any>;
  };
}

export function MasterDataTable<T extends { id: string | number; [key: string]: any }>({
  title,
  description,
  permissionPrefix,
  featureKey,
  allowAdd: propAllowAdd,
  allowEdit: propAllowEdit,
  allowDelete: propAllowDelete,
  allowSearch = true,
  permissionKeys,
  columns: defaultOrCustomColumns,
  extendColumns = [],
  omitColumns = [],
  formFields: defaultOrCustomFields,
  extendFormFields = [],
  omitFormFields = [],
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
  useMasterHook,
}: MasterDataTableProps<T>) {
  const { config } = useRBACConfig();
  const i18n = RBAC_CONSTANTS.i18n;
  const { items, total, page, limit, isLoading, fetchItems, createItem, editItem, deleteItem } = useMasterHook();

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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  // Resolve whether Add, Edit, Delete are permitted based on props OR global config
  const effectiveModuleKey = featureKey || permissionPrefix;
  const masterConfig: FeatureToggle | undefined =
    featureKey && config.features.masters[featureKey] !== undefined
      ? config.features.masters[featureKey]
      : config.features.masters[permissionPrefix];

  const canAdd = propAllowAdd !== undefined ? propAllowAdd : isActionAllowed(masterConfig, 'add');
  const canEdit = propAllowEdit !== undefined ? propAllowEdit : isActionAllowed(masterConfig, 'edit');
  const canDelete = propAllowDelete !== undefined ? propAllowDelete : isActionAllowed(masterConfig, 'delete');

  // Compute active columns
  const computedColumns = useMemo<Column<T>[]>(() => {
    let baseCols = defaultOrCustomColumns || [];
    if (omitColumns.length > 0) {
      baseCols = baseCols.filter((col) => !omitColumns.includes(col.key));
    }
    const combined = [...baseCols, ...extendColumns];

    // Only append Actions column if at least one action is enabled
    const hasActions = canEdit || canDelete || customActions.length > 0;
    if (!hasActions) return combined;

    return [
      ...combined,
      {
        key: '_actions',
        header: i18n.actions || 'Actions',
        align: 'right',
        render: (item: T) => (
          <div className="flex items-center justify-end gap-1">
            {customActions.map((action) => {
              const btn = (
                <Button
                  key={action.key}
                  variant={action.variant || 'ghost'}
                  size="sm"
                  onClick={() => action.onClick(item)}
                >
                  {action.icon} {action.label}
                </Button>
              );
              return action.permissionKey ? (
                <Can key={action.key} do={action.permissionKey}>
                  {btn}
                </Can>
              ) : (
                btn
              );
            })}

            {canEdit && (
              <Can
                do={permissionKeys?.edit}
                module={!permissionKeys?.edit ? effectiveModuleKey : undefined}
                action={!permissionKeys?.edit ? 'edit' : undefined}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingItem(item);
                    setIsModalOpen(true);
                  }}
                >
                  {i18n.edit || 'Edit'}
                </Button>
              </Can>
            )}

            {canDelete && (
              <Can
                do={permissionKeys?.delete}
                module={!permissionKeys?.delete ? effectiveModuleKey : undefined}
                action={!permissionKeys?.delete ? 'delete' : undefined}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => setDeleteTarget(item)}
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
    defaultOrCustomColumns,
    omitColumns,
    extendColumns,
    canEdit,
    canDelete,
    customActions,
    permissionKeys,
    effectiveModuleKey,
    i18n,
  ]);

  // Compute active form fields
  const computedFormFields = useMemo<FormField[]>(() => {
    let baseFields = defaultOrCustomFields || [];
    if (omitFormFields.length > 0) {
      baseFields = baseFields.filter((f) => !omitFormFields.includes(f.name));
    }
    return [...baseFields, ...extendFormFields];
  }, [defaultOrCustomFields, omitFormFields, extendFormFields]);

  // Fetch trigger on search or sort change
  useEffect(() => {
    const fetchParams: Record<string, any> = {
      page: initialUrlParams.page || 1,
      limit: 10,
      search,
    };
    if (sortBy) fetchParams.sortBy = sortBy;
    if (sortOrder) fetchParams.sortOrder = sortOrder;

    fetchItems(fetchParams);
    updateUrlParams({
      search,
      sortBy,
      sortOrder,
      page: initialUrlParams.page || 1,
    });
  }, [fetchItems, search, sortBy, sortOrder, initialUrlParams.page, updateUrlParams]);

  // Reset form data & field errors when modal opens or closes
  useEffect(() => {
    if (editingItem) {
      const initial: Record<string, any> = {};
      computedFormFields.forEach((f) => {
        initial[f.name] = editingItem[f.name] ?? f.defaultValue ?? '';
      });
      setFormData(initial);
    } else {
      const initial: Record<string, any> = {};
      computedFormFields.forEach((f) => {
        initial[f.name] = f.defaultValue ?? (f.type === 'checkbox' ? true : '');
      });
      setFormData(initial);
    }
    setError(null);
    setFieldErrors({});
  }, [editingItem, computedFormFields, isModalOpen]);

  const handleFormFieldChange = (fieldName: string, val: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: val }));
    // Clear field-level error on edit
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      if (editingItem) {
        await editItem(editingItem.id, formData);
        if (config.onNotification) {
          config.onNotification({
            type: 'success',
            title: i18n.success || 'Success',
            message: `${title} updated successfully`,
          });
        }
      } else {
        await createItem(formData);
        if (config.onNotification) {
          config.onNotification({
            type: 'success',
            title: i18n.success || 'Success',
            message: `${title} created successfully`,
          });
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      const extracted = err.fieldErrors || extractFieldErrors(err.data);
      if (extracted) {
        setFieldErrors(extracted);
      }
      const msg = err.message || 'Operation failed';
      setError(msg);
      if (config.onNotification) {
        config.onNotification({
          type: 'error',
          title: i18n.error || 'Error',
          message: msg,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteItem(deleteTarget.id);
      if (config.onNotification) {
        config.onNotification({
          type: 'success',
          title: i18n.success || 'Success',
          message: `${title} deleted successfully`,
        });
      }
      setDeleteTarget(null);
      // Remove from selectedIds if selected
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
    } catch (err: any) {
      const msg = err.message || 'Delete failed';
      if (config.onNotification) {
        config.onNotification({
          type: 'error',
          title: i18n.error || 'Error',
          message: msg,
        });
      }
    }
  };

  const handleBatchDelete = async (ids: (string | number)[]) => {
    if (!window.confirm(`Are you sure you want to delete ${ids.length} items?`)) return;
    try {
      await Promise.all(ids.map((id) => deleteItem(id)));
      if (config.onNotification) {
        config.onNotification({
          type: 'success',
          title: i18n.success || 'Success',
          message: `${ids.length} items deleted successfully`,
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

  const effectiveBatchActions: BatchAction<T>[] = useMemo(() => {
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

  const tableProps: TableProps<T> = {
    columns: computedColumns,
    data: items,
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
      setSelectedIds(checked ? items.map((i) => i.id) : []);
    },
    batchActions: effectiveBatchActions,
    pagination: {
      page,
      limit,
      total,
      onPageChange: (newPage) => {
        fetchItems({ page: newPage, limit, search, sortBy, sortOrder });
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
            setEditingItem(null);
            setIsModalOpen(true);
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
            {description && (
              <p className={classNames?.header?.description || (unstyled ? '' : 'text-xs text-gray-500 mt-1')}>
                {description}
              </p>
            )}
          </div>

          {canAdd && (
            <Can
              do={permissionKeys?.add}
              module={!permissionKeys?.add ? effectiveModuleKey : undefined}
              action={!permissionKeys?.add ? 'add' : undefined}
            >
              <Button
                variant="primary"
                className={classNames?.header?.addButton}
                onClick={() => {
                  setEditingItem(null);
                  setIsModalOpen(true);
                }}
              >
                + {i18n.create || 'Add New'}
              </Button>
            </Can>
          )}
        </div>
      )}

      {/* Search Input */}
      {allowSearch &&
        (renderSearch ? (
          renderSearch({
            search,
            onSearchChange: setSearch,
            placeholder: `${i18n.search || 'Search'} ${title.toLowerCase()}...`,
          })
        ) : (
          <div className={classNames?.search?.container || (unstyled ? '' : 'flex items-center gap-3')}>
            <input
              type="text"
              placeholder={`${i18n.search || 'Search'} ${title.toLowerCase()}...`}
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
        ))}

      {/* Table: Slot or Default Table */}
      {renderTable ? renderTable(tableProps) : <Table {...tableProps} />}

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `${i18n.edit || 'Edit'} ${title}` : `${i18n.create || 'Create'} ${title}`}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs">{error}</div>}

          {computedFormFields.map((field) => {
            const isFieldDisabled =
              typeof field.disabled === 'function' ? field.disabled(formData) : Boolean(field.disabled);
            const fieldError = fieldErrors[field.name];

            if (field.type === 'select') {
              // Resolve static or dynamic cascading options
              const resolvedOptions =
                typeof field.options === 'function' ? field.options(formData) : field.options || [];

              return (
                <div key={field.name}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {field.label} {field.required && '*'}
                  </label>
                  <select
                    value={formData[field.name] || ''}
                    disabled={isFieldDisabled}
                    onChange={(e) => handleFormFieldChange(field.name, e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 disabled:opacity-50 ${
                      fieldError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#28518F]'
                    }`}
                    required={field.required}
                  >
                    <option value="">Select {field.label}</option>
                    {resolvedOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {fieldError && <p className="mt-1 text-xs text-red-600">{fieldError}</p>}
                </div>
              );
            }

            if (field.type === 'checkbox') {
              return (
                <div key={field.name} className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id={`field-${field.name}`}
                    disabled={isFieldDisabled}
                    checked={Boolean(formData[field.name])}
                    onChange={(e) => handleFormFieldChange(field.name, e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#28518F] focus:ring-[#28518F] disabled:opacity-50 cursor-pointer"
                  />
                  <label htmlFor={`field-${field.name}`} className="text-sm text-gray-700 cursor-pointer">
                    {field.label}
                  </label>
                </div>
              );
            }

            return (
              <Input
                key={field.name}
                label={`${field.label} ${field.required ? '*' : ''}`}
                type={field.type || 'text'}
                placeholder={field.placeholder}
                disabled={isFieldDisabled}
                value={formData[field.name] || ''}
                error={fieldError}
                onChange={(e) => handleFormFieldChange(field.name, e.target.value)}
                required={field.required}
              />
            );
          })}

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              {i18n.cancel || 'Cancel'}
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingItem ? i18n.saveChanges || 'Save Changes' : i18n.create || 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={`${i18n.delete || 'Delete'} ${title}`}
        maxWidth="sm"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            {i18n.confirmDelete || 'Are you sure you want to delete this record? This action cannot be undone.'}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {i18n.cancel || 'Cancel'}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              {i18n.confirm || 'Confirm Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
