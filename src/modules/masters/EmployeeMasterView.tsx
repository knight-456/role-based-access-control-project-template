import React from 'react';
import { MasterDataTable, FormField, CustomAction } from './components/MasterDataTable';
import { useMaster } from '../../core/hooks/useMaster';
import { useRBACConfig } from '../../core/context/RBACConfigContext';
import { StandardEmployeeMaster } from '../../core/types';
import { Column } from '../../shared/components/Table';
import { Badge } from '../../shared/components/Badge';

export interface EmployeeMasterViewProps {
  allowAdd?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowSearch?: boolean;
  columns?: Column<StandardEmployeeMaster>[];
  extendColumns?: Column<StandardEmployeeMaster>[];
  omitColumns?: string[];
  formFields?: FormField[];
  extendFormFields?: FormField[];
  omitFormFields?: string[];
  customActions?: CustomAction<StandardEmployeeMaster>[];
  title?: string;
  description?: string;
}

export const EmployeeMasterView: React.FC<EmployeeMasterViewProps> = ({
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
  title = 'Employee Master',
  description = 'Manage personnel records, roles, departments, and credentials.',
}) => {
  const { config } = useRBACConfig();

  const useEmpHook = () =>
    useMaster<StandardEmployeeMaster>({
      listEndpoint: config.endpoints.EMPLOYEE_LIST,
      createEndpoint: config.endpoints.EMPLOYEE_CREATE,
      editEndpoint: config.endpoints.EMPLOYEE_EDIT,
      deleteEndpoint: config.endpoints.EMPLOYEE_DELETE,
      transformer: config.adapters.masters.transformEmployeeListResponse,
    });

  const defaultColumns: Column<StandardEmployeeMaster>[] = [
    {
      key: 'fullName',
      header: 'Employee',
      render: (item) => (
        <div>
          <div className="font-semibold text-gray-900">{item.fullName}</div>
          <div className="text-xs text-gray-500">{item.email}</div>
        </div>
      ),
    },
    { key: 'employeeCode', header: 'Emp Code' },
    { key: 'departmentName', header: 'Department' },
    { key: 'designationName', header: 'Designation' },
    { key: 'roleName', header: 'Assigned Role' },
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
    { name: 'firstName', label: 'First Name', required: true, placeholder: 'e.g. Rahul' },
    { name: 'lastName', label: 'Last Name', required: true, placeholder: 'e.g. Verma' },
    { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'rahul@example.com' },
    { name: 'mobile_number', label: 'Mobile Number', placeholder: '9876543210' },
    { name: 'employee_code', label: 'Employee Code', placeholder: 'EMP-0102' },
    { name: 'is_active', label: 'Active', type: 'checkbox', defaultValue: true },
  ];

  return (
    <MasterDataTable
      title={title}
      description={description}
      permissionPrefix="employee_master"
      featureKey="employee"
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
      useMasterHook={useEmpHook}
    />
  );
};
