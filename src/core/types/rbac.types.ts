export interface StandardAction {
  id: string | number;
  name: string;
  key: string;
  isActive: boolean;
  sortOrder?: number;
}

export interface StandardRole {
  id: string | number;
  name: string;
  key: string;
  description?: string | null;
  isActive: boolean;
  entityId?: string | number | null;
  entityName?: string | null;
  departmentId?: string | number | null;
  departmentName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StandardPermissionActionMapping {
  permissionActionId: string | number;
  moduleId: string | number;
  actionId: string | number;
  permissionKey: string;
  routePath?: string | null;
  description?: string | null;
  sortOrder?: number;
  actionDetails: StandardAction;
}

export interface StandardModuleWithActions {
  id: string | number;
  name: string;
  slug: string;
  routePath?: string | null;
  sortOrder: number;
  parentId: string | number;
  isActive: boolean;
  actions: StandardPermissionActionMapping[];
  children?: StandardModuleWithActions[];
}

export interface RolePermissionMatrixRow {
  moduleId: string | number;
  moduleName: string;
  slug: string;
  parentId: string | number;
  level: number;
  actions: {
    actionKey: string;
    actionName: string;
    actionId: string | number;
    permissionActionId: string | number;
    permissionKey: string;
    isAssigned: boolean;
  }[];
}

export interface RoleFormData {
  role_name: string;
  role_key: string;
  description?: string;
  entityId?: string | number | null;
  departmentId?: string | number | null;
  is_active?: boolean;
}
