export interface StandardEntityMaster {
  id: string | number;
  name: string;
  code?: string;
  state?: string;
  city?: string;
  pincode?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface StandardDepartmentMaster {
  id: string | number;
  name: string;
  code?: string;
  entityId?: string | number | null;
  entityName?: string | null;
  isActive: boolean;
  createdAt?: string;
}

export interface StandardDesignationMaster {
  id: string | number;
  name: string;
  code?: string;
  departmentId?: string | number | null;
  departmentName?: string | null;
  isActive: boolean;
  createdAt?: string;
}

export interface StandardEmployeeMaster {
  id: string | number;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  entityId?: string | number | null;
  entityName?: string | null;
  departmentId?: string | number | null;
  departmentName?: string | null;
  designationId?: string | number | null;
  designationName?: string | null;
  reportingManagerId?: string | number | null;
  roleId?: string | number | null;
  roleName?: string | null;
  isActive: boolean;
  createdAt?: string;
}

export interface StandardModuleMasterItem {
  id: string | number;
  name: string;
  slug: string;
  routePath?: string | null;
  sortOrder: number;
  parentId: string | number;
  parentName?: string | null;
  isActive: boolean;
  createdAt?: string;
}
