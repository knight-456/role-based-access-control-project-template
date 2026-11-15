import React from 'react';
import { MasterDataTable, FormField, CustomAction } from './components/MasterDataTable';
import { useMaster } from '../../core/hooks/useMaster';
import { useRBACConfig } from '../../core/context/RBACConfigContext';
import { StandardModuleMasterItem } from '../../core/types';
import { Column } from '../../shared/components/Table';
import { Badge } from '../../shared/components/Badge';

export interface ModuleMasterViewProps {
  allowAdd?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowSearch?: boolean;
  columns?: Column<StandardModuleMasterItem>[];
  extendColumns?: Column<StandardModuleMasterItem>[];
  omitColumns?: string[];
  formFields?: FormField[];
  extendFormFields?: FormField[];
  omitFormFields?: string[];
  customActions?: CustomAction<StandardModuleMasterItem>[];
  title?: string;
  description?: string;
}

export const ModuleMasterView: React.FC<ModuleMasterViewProps> = ({
  allowAdd,
  allowEdit,
  allowDelete,
  allowSearch,
  columns: customColumns,
  extendColumns,
  omitColumns,
  formFields: customFormFields,
  extendFormFields,
  omitFormFields,
  customActions,
  title = 'Module Master',
  description = 'Manage top-level navigation and system modules.',
}) => {
  const { config } = useRBACConfig();

  const useModHook = () =>
    useMaster<StandardModuleMasterItem>({
      listEndpoint: config.endpoints.PERMISSIONS_MODULES_PARENTS,
      createEndpoint: config.endpoints.PERMISSIONS_MODULE_CREATE,
      editEndpoint: config.endpoints.PERMISSIONS_MODULE_EDIT,
      deleteEndpoint: config.endpoints.PERMISSIONS_MODULE_DELETE,
      transformer: config.adapters.masters.transformModuleMasterListResponse,
    });

  const defaultColumns: Column<StandardModuleMasterItem>[] = [
    {
      key: 'name',
      header: 'Module Name',
      render: (item) => (
        <div>
          <span className="font-semibold text-gray-900">{item.name}</span>
          <div className="text-xs text-gray-400 font-mono">{item.slug}</div>
        </div>
      ),
    },
    { key: 'routePath', header: 'Route Path' },
    { key: 'sortOrder', header: 'Sort Order', align: 'center' },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (item) => (
        <Badge variant={item.isActive ? 'success' : 'neutral'}>
          {item.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const defaultFormFields: FormField[] = [
    { name: 'name', label: 'Module Name', required: true, placeholder: 'e.g. Sales Management' },
    { name: 'slug_name', label: 'Slug Key', required: true, placeholder: 'e.g. sales_management' },
    { name: 'route_path', label: 'Route Path', placeholder: '/sales' },
    { name: 'sort_order', label: 'Sort Order', type: 'number', defaultValue: 0 },
    { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
  ];

  return (
    <MasterDataTable
      title={title}
      description={description}
      permissionPrefix="module_master"
      featureKey="moduleMaster"
      allowAdd={allowAdd}
      allowEdit={allowEdit}
      allowDelete={allowDelete}
      allowSearch={allowSearch}
      columns={customColumns || defaultColumns}
      extendColumns={extendColumns}
      omitColumns={omitColumns}
      formFields={customFormFields || defaultFormFields}
      extendFormFields={extendFormFields}
      omitFormFields={omitFormFields}
      customActions={customActions}
      useMasterHook={useModHook}
    />
  );
};
