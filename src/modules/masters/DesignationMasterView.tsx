import React from 'react';
import { MasterDataTable, FormField, CustomAction } from './components/MasterDataTable';
import { useMaster } from '../../core/hooks/useMaster';
import { useRBACConfig } from '../../core/context/RBACConfigContext';
import { StandardDesignationMaster } from '../../core/types';
import { Column } from '../../shared/components/Table';
import { Badge } from '../../shared/components/Badge';

export interface DesignationMasterViewProps {
  allowAdd?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowSearch?: boolean;
  columns?: Column<StandardDesignationMaster>[];
  extendColumns?: Column<StandardDesignationMaster>[];
  omitColumns?: string[];
  formFields?: FormField[];
  extendFormFields?: FormField[];
  omitFormFields?: string[];
  customActions?: CustomAction<StandardDesignationMaster>[];
  title?: string;
  description?: string;
}

export const DesignationMasterView: React.FC<DesignationMasterViewProps> = ({
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
  title = 'Designation Master',
  description = 'Manage organizational job titles and designations.',
}) => {
  const { config } = useRBACConfig();

  const useDesigHook = () =>
    useMaster<StandardDesignationMaster>({
      listEndpoint: config.endpoints.DESIGNATION_LIST,
      createEndpoint: config.endpoints.DESIGNATION_CREATE,
      editEndpoint: config.endpoints.DESIGNATION_EDIT,
      deleteEndpoint: config.endpoints.DESIGNATION_DELETE,
      transformer: config.adapters.masters.transformDesignationListResponse,
    });

  const defaultColumns: Column<StandardDesignationMaster>[] = [
    {
      key: 'name',
      header: 'Designation Name',
      render: (item) => <span className="font-semibold text-gray-900">{item.name}</span>,
    },
    { key: 'code', header: 'Designation Code' },
    { key: 'departmentName', header: 'Department' },
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
    { name: 'designation_name', label: 'Designation Name', required: true, placeholder: 'e.g. Senior Software Engineer' },
    { name: 'designation_code', label: 'Designation Code', placeholder: 'e.g. DES-SE-02' },
    { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
  ];

  return (
    <MasterDataTable
      title={title}
      description={description}
      permissionPrefix="designation_master"
      featureKey="designation"
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
      useMasterHook={useDesigHook}
    />
  );
};
