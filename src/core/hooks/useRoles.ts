import { useState, useCallback } from 'react';
import { useRBACConfig } from '../context/RBACConfigContext';
import { StandardRole, PaginatedResult, RoleFormData } from '../types';
import { buildPaginationQueryParams } from '../types/pagination.types';

export function useRoles() {
  const { config, http } = useRBACConfig();
  const [roles, setRoles] = useState<StandardRole[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoles = useCallback(
    async (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; [key: string]: any }) => {
      setIsLoading(true);
      setError(null);
      try {
        const targetPage = params?.page ?? page;
        const targetLimit = params?.limit ?? limit;

        const pagParams = buildPaginationQueryParams(targetPage, targetLimit, config.pagination);
        const queryParams = {
          ...pagParams,
          ...(params || {}),
        };

        const raw = await http.get(config.endpoints.ROLES_LIST, queryParams);
        const result: PaginatedResult<StandardRole> = config.adapters.roles.transformRoleListResponse(raw);

        setRoles(result.items);
        setTotal(result.total);
        setPage(result.page);
        setLimit(result.limit);
        return result;
      } catch (err: any) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [config.adapters.roles, config.endpoints.ROLES_LIST, config.pagination, http, limit, page]
  );

  const fetchRoleDetails = useCallback(
    async (id: string | number) => {
      const endpoint = config.endpoints.ROLES_DETAILS.replace(':id', String(id));
      const raw = await http.get(endpoint);
      return config.adapters.roles.transformRoleDetailsResponse(raw);
    },
    [config.adapters.roles, config.endpoints.ROLES_DETAILS, http]
  );

  const createRole = useCallback(
    async (formData: RoleFormData) => {
      const payload = config.adapters.roles.transformCreateRolePayload(formData);
      const raw = await http.post(config.endpoints.ROLES_CREATE, payload);
      await fetchRoles();
      return raw;
    },
    [config.adapters.roles, config.endpoints.ROLES_CREATE, fetchRoles, http]
  );

  const editRole = useCallback(
    async (id: string | number, formData: Partial<RoleFormData>) => {
      const endpoint = config.endpoints.ROLES_EDIT.replace(':id', String(id));
      const payload = config.adapters.roles.transformEditRolePayload(formData);
      const raw = await http.patch(endpoint, payload);
      await fetchRoles();
      return raw;
    },
    [config.adapters.roles, config.endpoints.ROLES_EDIT, fetchRoles, http]
  );

  const deleteRole = useCallback(
    async (id: string | number) => {
      const endpoint = config.endpoints.ROLES_DELETE.replace(':id', String(id));
      const raw = await http.delete(endpoint);
      await fetchRoles();
      return raw;
    },
    [config.endpoints.ROLES_DELETE, fetchRoles, http]
  );

  const fetchRolePermissions = useCallback(
    async (roleId: string | number): Promise<(string | number)[]> => {
      const endpoint = config.endpoints.ROLES_GET_PERMISSIONS.replace(':id', String(roleId));
      const raw = await http.get(endpoint);
      return config.adapters.roles.transformRolePermissionsResponse(raw);
    },
    [config.adapters.roles, config.endpoints.ROLES_GET_PERMISSIONS, http]
  );

  const assignPermissions = useCallback(
    async (roleId: string | number, permissionActionIds: (string | number)[]) => {
      const endpoint = config.endpoints.ROLES_ASSIGN_PERMISSIONS.replace(':id', String(roleId));
      const payload = config.adapters.roles.transformAssignPermissionsPayload(roleId, permissionActionIds);
      return http.post(endpoint, payload);
    },
    [config.adapters.roles, config.endpoints.ROLES_ASSIGN_PERMISSIONS, http]
  );

  return {
    roles,
    total,
    page,
    limit,
    isLoading,
    error,
    fetchRoles,
    fetchRoleDetails,
    createRole,
    editRole,
    deleteRole,
    fetchRolePermissions,
    assignPermissions,
  };
}
