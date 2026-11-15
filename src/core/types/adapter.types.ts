import { StandardAuthMeData, StandardUser, LoginCredentials } from './auth.types';
import { StandardRole, StandardModuleWithActions, StandardAction, RoleFormData } from './rbac.types';
import {
  StandardEntityMaster,
  StandardDepartmentMaster,
  StandardDesignationMaster,
  StandardEmployeeMaster,
  StandardModuleMasterItem,
} from './masters.types';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface AuthAdapter {
  transformLoginPayload: (credentials: LoginCredentials) => Record<string, any>;
  transformLoginResponse: (raw: any) => { success: boolean; user?: Partial<StandardUser>; token?: string; message?: string };
  transformAuthMeResponse: (raw: any) => StandardAuthMeData;
}

export interface RolesAdapter {
  transformRoleListResponse: (raw: any) => PaginatedResult<StandardRole>;
  transformRoleDetailsResponse: (raw: any) => StandardRole;
  transformCreateRolePayload: (data: RoleFormData) => Record<string, any>;
  transformEditRolePayload: (data: Partial<RoleFormData>) => Record<string, any>;
  transformRolePermissionsResponse: (raw: any) => (string | number)[];
  transformAssignPermissionsPayload: (roleId: string | number, permissionActionIds: (string | number)[]) => Record<string, any>;
}

export interface PermissionsAdapter {
  transformActionsListResponse: (raw: any) => StandardAction[];
  transformRegistryResponse: (raw: any) => PaginatedResult<StandardModuleWithActions>;
  transformModuleParentsResponse: (raw: any) => PaginatedResult<StandardModuleWithActions>;
  transformModuleSubmodulesResponse: (raw: any) => PaginatedResult<StandardModuleWithActions>;
}

export interface MastersAdapter {
  transformEntityListResponse: (raw: any) => PaginatedResult<StandardEntityMaster>;
  transformDepartmentListResponse: (raw: any) => PaginatedResult<StandardDepartmentMaster>;
  transformDesignationListResponse: (raw: any) => PaginatedResult<StandardDesignationMaster>;
  transformEmployeeListResponse: (raw: any) => PaginatedResult<StandardEmployeeMaster>;
  transformModuleMasterListResponse: (raw: any) => PaginatedResult<StandardModuleMasterItem>;
}

export interface RBACAdapters {
  auth: AuthAdapter;
  roles: RolesAdapter;
  permissions: PermissionsAdapter;
  masters: MastersAdapter;
}
