import React from 'react';
import { MasterDataTable, FormField, CustomAction } from './components/MasterDataTable';
import { useMaster } from '../../core/hooks/useMaster';
import { useRBACConfig } from '../../core/context/RBACConfigContext';
import { StandardEntityMaster } from '../../core/types';
import { Column } from '../../shared/components/Table';
import { Badge } from '../../shared/components/Badge';

export interface EntityMasterViewProps {
  allowAdd?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowSearch?: boolean;
  columns?: Column<StandardEntityMaster>[];
  extendColumns?: Column<StandardEntityMaster>[];
  omitColumns?: string[];
  formFields?: FormField[];
  extendFormFields?: FormField[];
  omitFormFields?: string[];
  customActions?: CustomAction<StandardEntityMaster>[];
  title?: string;
  description?: string;
}

export const EntityMasterView: React.FC<EntityMasterViewProps> = ({
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
  title = 'Entity Master',
  description = 'Manage business entities, branches, and regional distribution centers.',
}) => {
  const { config } = useRBACConfig();

  const useEntityHook = () =>
    useMaster<StandardEntityMaster>({
      listEndpoint: config.endpoints.ENTITY_LIST,
      createEndpoint: config.endpoints.ENTITY_CREATE,
      editEndpoint: config.endpoints.ENTITY_EDIT,
      deleteEndpoint: config.endpoints.ENTITY_DELETE,
      transformer: config.adapters.masters.transformEntityListResponse,
    });

  const defaultColumns: Column<StandardEntityMaster>[] = [
    {
      key: 'name',
      header: 'Entity Name',
      render: (item) => <span className="font-semibold text-gray-900">{item.name}</span>,
    },
    { key: 'code', header: 'Entity Code' },
    { key: 'city', header: 'City' },
    { key: 'state', header: 'State' },
    { key: 'pincode', header: 'Pincode' },
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
    { name: 'entity_name', label: 'Entity Name', required: true, placeholder: 'e.g. Eastern Distribution' },
    { name: 'entity_code', label: 'Entity Code', placeholder: 'e.g. ENT-EAST-01' },
    { name: 'state', label: 'State', placeholder: 'e.g. Delhi' },
    { name: 'city', label: 'City', placeholder: 'e.g. New Delhi' },
    { name: 'pincode', label: 'Pincode', placeholder: 'e.g. 110001' },
    { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
  ];

  return (
    <MasterDataTable
      title={title}
      description={description}
      permissionPrefix="entity_master"
      featureKey="entity"
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
      useMasterHook={useEntityHook}
    />
  );
};
