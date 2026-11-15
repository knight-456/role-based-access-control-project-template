import React from 'react';
import { MasterDataTable, FormField, CustomAction } from './components/MasterDataTable';
import { useMaster } from '../../core/hooks/useMaster';
import { useRBACConfig } from '../../core/context/RBACConfigContext';
import { StandardDepartmentMaster } from '../../core/types';
import { Column, TableProps } from '../../shared/components/Table';
import { Badge } from '../../shared/components/Badge';
import { MasterDataTableClassNames } from '../../core/types/style.types';

export interface DepartmentMasterViewProps {
  allowAdd?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowSearch?: boolean;
  columns?: Column<StandardDepartmentMaster>[];
  extendColumns?: Column<StandardDepartmentMaster>[];
  omitColumns?: string[];
  formFields?: FormField[];
  extendFormFields?: FormField[];
  omitFormFields?: string[];
  customActions?: CustomAction<StandardDepartmentMaster>[];
  title?: string;
  description?: string;

  // Complete Style Overrides
  classNames?: MasterDataTableClassNames;
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
  renderTable?: (props: TableProps<StandardDepartmentMaster>) => React.ReactNode;
}

export const DepartmentMasterView: React.FC<DepartmentMasterViewProps> = ({
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
  title = 'Department Master',
  description = 'Manage corporate and branch departments.',
  classNames,
  unstyled = false,
  renderHeader,
  renderSearch,
  renderTable,
}) => {
  const { config } = useRBACConfig();

  const useDeptHook = () =>
    useMaster<StandardDepartmentMaster>({
      listEndpoint: config.endpoints.DEPARTMENT_LIST,
      createEndpoint: config.endpoints.DEPARTMENT_CREATE,
      editEndpoint: config.endpoints.DEPARTMENT_EDIT,
      deleteEndpoint: config.endpoints.DEPARTMENT_DELETE,
      transformer: config.adapters.masters.transformDepartmentListResponse,
    });

  const defaultColumns: Column<StandardDepartmentMaster>[] = [
    {
      key: 'name',
      header: 'Department Name',
      render: (item) => <span className="font-semibold text-gray-900">{item.name}</span>,
    },
    { key: 'code', header: 'Department Code' },
    { key: 'entityName', header: 'Entity' },
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
    { name: 'department_name', label: 'Department Name', required: true, placeholder: 'e.g. Human Resource' },
    { name: 'department_code', label: 'Department Code', placeholder: 'e.g. HR-01' },
    { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
  ];

  return (
    <MasterDataTable
      title={title}
      description={description}
      permissionPrefix="department_master"
      featureKey="department"
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
      classNames={classNames}
      unstyled={unstyled}
      renderHeader={renderHeader}
      renderSearch={renderSearch}
      renderTable={renderTable}
      useMasterHook={useDeptHook}
    />
  );
};
