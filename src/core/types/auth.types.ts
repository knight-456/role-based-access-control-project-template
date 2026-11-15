export interface StandardUser {
  id: string | number;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  mobileNumber?: string;
  entityId?: string | number | null;
  departmentId?: string | number | null;
  role: {
    id: string | number;
    name: string;
    key: string;
  };
}

export interface StandardPermissionItem {
  permissionKey: string;
  routePath?: string;
}

export interface StandardNavigationItem {
  id: string | number;
  name: string;
  slug: string;
  routePath?: string;
  sortOrder: number;
  parentId: string | number;
  children: StandardNavigationItem[];
}

export interface StandardAuthMeData {
  user: StandardUser;
  permissions: StandardPermissionItem[];
  navigation: StandardNavigationItem[];
}

export interface LoginCredentials {
  email: string;
  password?: string;
  mobileNumber?: string;
  otp?: string;
  [key: string]: any;
}
