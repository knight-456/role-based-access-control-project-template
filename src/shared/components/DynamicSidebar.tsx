import React, { useState } from 'react';
import { usePermission } from '../../core/context/PermissionContext';
import { useRBACConfig } from '../../core/context/RBACConfigContext';
import { useTheme } from '../../theme/ThemeContext';
import { StandardNavigationItem } from '../../core/types';

export interface DynamicSidebarProps {
  currentPath?: string;
  onNavigate?: (route: string) => void;
  renderLink?: (item: StandardNavigationItem, children: React.ReactNode) => React.ReactNode;
  brandTitle?: string;
  className?: string;
}

export const DynamicSidebar: React.FC<DynamicSidebarProps> = ({
  currentPath: propCurrentPath,
  onNavigate: propOnNavigate,
  renderLink: propRenderLink,
  brandTitle = 'Admin Portal',
  className = '',
}) => {
  const { navigation, user, logout } = usePermission();
  const { config } = useRBACConfig();
  const { theme } = useTheme();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const currentPath = propCurrentPath ?? config.router?.currentPath ?? '';
  const onNavigate = propOnNavigate ?? config.router?.navigate;

  const toggleSubmenu = (id: string | number) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [String(id)]: !prev[String(id)],
    }));
  };

  const defaultRenderLink = (item: StandardNavigationItem, content: React.ReactNode) => {
    if (item.routePath) {
      if (config.router?.renderLink) {
        return config.router.renderLink({
          href: item.routePath,
          className: 'flex-1',
          children: content,
        });
      }

      return (
        <a
          href={item.routePath}
          onClick={(e) => {
            if (onNavigate) {
              e.preventDefault();
              onNavigate(item.routePath!);
            }
          }}
          className="flex-1"
        >
          {content}
        </a>
      );
    }
    return <div className="flex-1">{content}</div>;
  };

  const linkRenderer = propRenderLink || defaultRenderLink;

  const renderNavItem = (item: StandardNavigationItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = Boolean(openSubmenus[String(item.id)]);
    const isActive = item.routePath ? currentPath.startsWith(item.routePath) : false;

    const activeStyle: React.CSSProperties = isActive
      ? {
          backgroundColor: theme.colors.primary,
          color: theme.colors.primaryText,
          borderRadius: theme.borderRadius.lg,
        }
      : {
          borderRadius: theme.borderRadius.lg,
        };

    return (
      <li key={item.id} className="space-y-1">
        <div
          style={activeStyle}
          className={`flex items-center justify-between px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
            isActive
              ? 'shadow-sm'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}
          onClick={() => {
            if (hasChildren) {
              toggleSubmenu(item.id);
            } else if (item.routePath && onNavigate) {
              onNavigate(item.routePath);
            }
          }}
        >
          {linkRenderer(
            item,
            <div className="flex items-center gap-2.5">
              <span>{item.name}</span>
            </div>
          )}

          {hasChildren && (
            <button
              type="button"
              className="text-xs p-1 opacity-70 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                toggleSubmenu(item.id);
              }}
            >
              {isExpanded ? '▾' : '▸'}
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <ul className="pl-4 pr-1 space-y-1 border-l-2 border-gray-100 ml-4 mt-1">
            {item.children.map((child: StandardNavigationItem) => renderNavItem(child))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <aside
      className={`w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col justify-between p-4 shadow-sm ${
        theme.classNames?.sidebar?.container || ''
      } ${className}`}
    >
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: theme.borderRadius.md,
            }}
            className="w-8 h-8 flex items-center justify-center text-white font-bold text-sm"
          >
            AP
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">{brandTitle}</h1>
            <p className="text-[10px] text-gray-400">Enterprise RBAC</p>
          </div>
        </div>

        {/* Dynamic Navigation Tree */}
        <nav>
          <ul className="space-y-1">
            {navigation.map((item) => renderNavItem(item))}
          </ul>
        </nav>
      </div>

      {/* User Footer */}
      {user && (
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-900 truncate">{user.fullName || user.email}</p>
              <p className="text-[10px] text-gray-400 truncate">{user.role?.name}</p>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
