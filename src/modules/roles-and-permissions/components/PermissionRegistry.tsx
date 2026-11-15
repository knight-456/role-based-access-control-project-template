import React, { useEffect, useState } from 'react';
import { usePermissions } from '../../../core/hooks/usePermissions';
import { Table, Column } from '../../../shared/components/Table';
import { Badge } from '../../../shared/components/Badge';
import { StandardModuleWithActions, StandardPermissionActionMapping } from '../../../core/types';

export const PermissionRegistry: React.FC = () => {
  const { registryModules, isLoading, fetchRegistry, fetchActions } = usePermissions();
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetchActions();
    fetchRegistry({ page: 1, limit: 50 });
  }, [fetchActions, fetchRegistry]);

  // Flatten modules tree for table view with level indicator
  const flattenModules = (modules: StandardModuleWithActions[], level = 0): Array<StandardModuleWithActions & { level: number }> => {
    const list: Array<StandardModuleWithActions & { level: number }> = [];
    modules.forEach((m) => {
      list.push({ ...m, level });
      if (m.children && m.children.length > 0) {
        list.push(...flattenModules(m.children, level + 1));
      }
    });
    return list;
  };

  const flatData = flattenModules(registryModules).filter((m) =>
    search ? m.name.toLowerCase().includes(search.toLowerCase()) || m.slug.toLowerCase().includes(search.toLowerCase()) : true
  );

  const columns: Column<StandardModuleWithActions & { level: number }>[] = [
    {
      key: 'name',
      header: 'Module Name',
      render: (item) => (
        <div style={{ paddingLeft: `${item.level * 20}px` }} className="flex items-center gap-2">
          {item.level > 0 && <span className="text-gray-300">↳</span>}
          <div>
            <span className="font-semibold text-gray-900">{item.name}</span>
            <div className="text-xs text-gray-400 font-mono">{item.slug}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'routePath',
      header: 'Frontend Route Path',
      render: (item) => (
        <span className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200">
          {item.routePath || '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Registered Actions',
      render: (item) => (
        <div className="flex flex-wrap gap-1.5">
          {item.actions.length > 0 ? (
            item.actions.map((act: StandardPermissionActionMapping) => (
              <Badge key={act.permissionActionId} variant="info">
                {act.actionDetails?.name || act.permissionKey}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-gray-400">No actions registered</span>
          )}
        </div>
      ),
    },
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Permission Registry</h2>
          <p className="text-xs text-gray-500 mt-1">
            System modules, sub-modules, routes, and active permission actions.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Filter modules or slugs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 px-3.5 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#28518F]"
        />
      </div>

      <Table columns={columns} data={flatData} isLoading={isLoading} />
    </div>
  );
};
