import { useState, useCallback } from 'react';
import { useRBACConfig } from '../context/RBACConfigContext';
import { PaginatedResult } from '../types';
import { buildPaginationQueryParams } from '../types/pagination.types';

export interface UseMasterOptions<T> {
  listEndpoint: string;
  createEndpoint?: string;
  editEndpoint?: string;
  deleteEndpoint?: string;
  transformer: (raw: any) => PaginatedResult<T>;
  defaultLimit?: number;
}

export function useMaster<T extends { id: string | number }>(options: UseMasterOptions<T>) {
  const { config, http } = useRBACConfig();
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(options.defaultLimit ?? 10);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(
    async (params?: { page?: number; limit?: number; search?: string; [key: string]: any }) => {
      setIsLoading(true);
      setError(null);
      try {
        const targetPage = params?.page ?? page;
        const targetLimit = params?.limit ?? limit;

        const pagParams = buildPaginationQueryParams(targetPage, targetLimit, config.pagination);
        const query = {
          ...pagParams,
          ...(params || {}),
        };
        const raw = await http.get(options.listEndpoint, query);
        const result = options.transformer(raw);

        setItems(result.items);
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
    [config.pagination, http, limit, options, page]
  );

  const createItem = useCallback(
    async (payload: any) => {
      if (!options.createEndpoint) throw new Error('Create endpoint not configured for this master');
      const raw = await http.post(options.createEndpoint, payload);
      await fetchItems();
      return raw;
    },
    [fetchItems, http, options.createEndpoint]
  );

  const editItem = useCallback(
    async (id: string | number, payload: any) => {
      if (!options.editEndpoint) throw new Error('Edit endpoint not configured for this master');
      const url = options.editEndpoint.replace(':id', String(id));
      const raw = await http.patch(url, payload);
      await fetchItems();
      return raw;
    },
    [fetchItems, http, options.editEndpoint]
  );

  const deleteItem = useCallback(
    async (id: string | number) => {
      if (!options.deleteEndpoint) throw new Error('Delete endpoint not configured for this master');
      const url = options.deleteEndpoint.replace(':id', String(id));
      const raw = await http.delete(url);
      await fetchItems();
      return raw;
    },
    [fetchItems, http, options.deleteEndpoint]
  );

  return {
    items,
    total,
    page,
    limit,
    isLoading,
    error,
    fetchItems,
    createItem,
    editItem,
    deleteItem,
  };
}
