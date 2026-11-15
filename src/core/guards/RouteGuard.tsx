import React from 'react';
import { usePermission } from '../context/PermissionContext';

export interface RouteGuardProps {
  routePath: string;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  routePath,
  fallback = (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="w-12 h-12 mb-4 text-red-500 rounded-full bg-red-50 flex items-center justify-center font-bold text-xl">
        ✕
      </div>
      <h3 className="text-lg font-semibold text-gray-900">Access Denied</h3>
      <p className="mt-1 text-sm text-gray-500 max-w-sm">
        You do not have permission to access the route <code>{routePath}</code>.
      </p>
    </div>
  ),
  loadingFallback = (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="text-sm text-gray-500 animate-pulse">Checking permissions...</div>
    </div>
  ),
  children,
}) => {
  const { canNavigate, isLoading } = usePermission();

  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  if (!canNavigate(routePath)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
