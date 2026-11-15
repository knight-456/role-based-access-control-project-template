import React, { useMemo } from 'react';
import { Button } from './Button';
import { useTheme } from '../../theme/ThemeContext';
import { TableClassNames } from '../../core/types/style.types';
import { RBAC_CONSTANTS } from '../../constants';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  hidden?: boolean;
  sortable?: boolean;
  sortKey?: string;
}

export interface BatchAction<T> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  onClick: (selectedIds: (string | number)[], selectedItems: T[]) => void | Promise<void>;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyText?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (newPage: number) => void;
  };
  // Sorting (Opt-in)
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void;

  // Bulk Row Selection (Opt-in)
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectRow?: (id: string | number, item: T) => void;
  onSelectAll?: (selectAll: boolean) => void;
  batchActions?: BatchAction<T>[];

  // Styling
  className?: string;
  classNames?: TableClassNames;
  unstyled?: boolean;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyText,
  pagination,
  sortBy,
  sortOrder,
  onSortChange,
  selectable = false,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  batchActions,
  className = '',
  classNames,
  unstyled = false,
}: TableProps<T>) {
  const { theme } = useTheme();
  const i18n = RBAC_CONSTANTS.i18n;

  // Filter out columns explicitly marked as hidden
  const visibleColumns = columns.filter((c) => !c.hidden);
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) || 1 : 1;

  // Defaults vs Unstyled
  const defaultContainer = unstyled
    ? ''
    : 'w-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm';
  const defaultThead = unstyled ? '' : 'bg-[#FAFAFC] text-gray-600 font-medium';
  const defaultTh = unstyled ? '' : 'px-4 py-3.5';
  const defaultTbody = unstyled ? '' : 'divide-y divide-gray-200 bg-white';
  const defaultTr = unstyled ? '' : 'hover:bg-gray-50/75 transition-colors';
  const defaultTd = unstyled ? '' : 'px-4 py-3 text-gray-700';
  const defaultPaginationContainer = unstyled
    ? ''
    : 'flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-[#FAFAFC] text-xs text-gray-500';

  const containerClass =
    classNames?.container || theme.classNames?.table?.container || defaultContainer;
  const tableClass =
    classNames?.table ||
    theme.classNames?.table?.table ||
    'min-w-full divide-y divide-gray-200 text-sm text-left';
  const theadClass = classNames?.thead || theme.classNames?.table?.thead || defaultThead;
  const thClass = classNames?.th || theme.classNames?.table?.th || defaultTh;
  const tbodyClass = classNames?.tbody || theme.classNames?.table?.tbody || defaultTbody;
  const trClass = classNames?.tr || theme.classNames?.table?.tr || defaultTr;
  const tdClass = classNames?.td || theme.classNames?.table?.td || defaultTd;

  // Bulk Selection calculations
  const allIdsOnPage = useMemo(() => data.map((d) => d.id).filter(Boolean), [data]);
  const isAllSelected =
    allIdsOnPage.length > 0 && allIdsOnPage.every((id) => selectedIds.includes(id));
  const isPartiallySelected =
    !isAllSelected && allIdsOnPage.some((id) => selectedIds.includes(id));

  const selectedItems = useMemo(
    () => data.filter((item) => selectedIds.includes(item.id)),
    [data, selectedIds]
  );

  const handleHeaderSort = (col: Column<T>) => {
    if (!col.sortable) return;
    const key = col.sortKey || col.key;
    const nextOrder: 'asc' | 'desc' = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
    if (onSortChange) {
      onSortChange(key, nextOrder);
    }
  };

  return (
    <div
      className={`${containerClass} ${className}`.trim()}
      style={
        unstyled
          ? undefined
          : {
              borderRadius: theme.borderRadius.lg,
              borderColor: theme.table.borderColor,
            }
      }
    >
      {/* Batch Actions Toolbar (Shown only when selectable & items are selected) */}
      {selectable && selectedIds.length > 0 && (
        <div
          className="px-4 py-2.5 bg-blue-50/80 border-b border-blue-100 flex items-center justify-between gap-4 text-xs animate-fadeIn"
          style={unstyled ? undefined : { borderColor: theme.table.borderColor }}
        >
          <div className="flex items-center gap-2 text-blue-900 font-medium">
            <span>{i18n.itemsSelected ? i18n.itemsSelected(selectedIds.length) : `${selectedIds.length} items selected`}</span>
          </div>

          <div className="flex items-center gap-2">
            {batchActions?.map((action) => (
              <Button
                key={action.key}
                size="sm"
                variant={action.variant || 'outline'}
                onClick={() => action.onClick(selectedIds, selectedItems)}
              >
                {action.icon && <span className="mr-1">{action.icon}</span>}
                {action.label}
              </Button>
            ))}

            {onSelectAll && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onSelectAll(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                {i18n.clearSelection || 'Clear'}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className={tableClass}>
          <thead
            className={theadClass}
            style={
              unstyled
                ? undefined
                : {
                    backgroundColor: theme.table.headerBg,
                    color: theme.table.headerTextColor,
                  }
            }
          >
            <tr>
              {/* Select All Checkbox */}
              {selectable && (
                <th scope="col" className="w-10 px-4 py-3.5 text-center">
                  <input
                    type="checkbox"
                    aria-label={i18n.selectAll || 'Select All'}
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isPartiallySelected;
                    }}
                    onChange={(e) => onSelectAll && onSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#28518F] focus:ring-[#28518F] cursor-pointer"
                  />
                </th>
              )}

              {visibleColumns.map((col) => {
                const isCurrentSort = (col.sortKey || col.key) === sortBy;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={{ width: col.width }}
                    onClick={() => handleHeaderSort(col)}
                    className={`${thClass} ${
                      col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                    } ${col.sortable ? 'cursor-pointer select-none group hover:text-gray-900' : ''}`.trim()}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-[10px] text-gray-400 group-hover:text-gray-600 transition-colors">
                          {isCurrentSort ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className={tbodyClass}>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {selectable && (
                    <td className="w-10 px-4 py-3 text-center">
                      <div className="h-4 w-4 bg-gray-100 rounded mx-auto" />
                    </td>
                  )}
                  {visibleColumns.map((col, cIdx) => (
                    <td key={cIdx} className={tdClass} style={{ width: col.width }}>
                      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + (selectable ? 1 : 0)}
                  className={classNames?.empty || (unstyled ? '' : 'px-4 py-12 text-center text-gray-400')}
                >
                  {emptyText || i18n.noData}
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <tr
                    key={item.id ?? rowIdx}
                    className={`${trClass} ${isSelected ? 'bg-blue-50/40' : ''}`.trim()}
                  >
                    {/* Row Select Checkbox */}
                    {selectable && (
                      <td className="w-10 px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectRow && onSelectRow(item.id, item)}
                          className="h-4 w-4 rounded border-gray-300 text-[#28518F] focus:ring-[#28518F] cursor-pointer"
                        />
                      </td>
                    )}

                    {visibleColumns.map((col) => (
                      <td
                        key={col.key}
                        style={{ width: col.width }}
                        className={`${tdClass} ${
                          col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                        }`.trim()}
                      >
                        {col.render ? col.render(item, rowIdx) : item[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div
          className={`${
            classNames?.pagination?.container ||
            theme.classNames?.table?.pagination ||
            defaultPaginationContainer
          }`.trim()}
          style={unstyled ? undefined : { backgroundColor: theme.table.headerBg }}
        >
          <div className={classNames?.pagination?.info}>
            {i18n.showingEntries
              ? i18n.showingEntries(
                  (pagination.page - 1) * pagination.limit + (data.length > 0 ? 1 : 0),
                  Math.min(pagination.page * pagination.limit, pagination.total),
                  pagination.total
                )
              : `Showing ${(pagination.page - 1) * pagination.limit + (data.length > 0 ? 1 : 0)} to ${Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )} of ${pagination.total} entries`}
          </div>
          <div className={`flex items-center gap-1.5 ${classNames?.pagination?.buttons || ''}`}>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || isLoading}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              {i18n.previous || 'Previous'}
            </Button>
            <span className={`px-2 font-medium text-gray-700 ${classNames?.pagination?.pageText || ''}`}>
              {i18n.pageOf ? i18n.pageOf(pagination.page, totalPages) : `Page ${pagination.page} of ${totalPages}`}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= totalPages || isLoading}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              {i18n.next || 'Next'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
