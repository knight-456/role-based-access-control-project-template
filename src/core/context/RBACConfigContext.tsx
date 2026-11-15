import React, { createContext, useContext, useMemo } from 'react';
import { RBACConfig, defaultRBACConfig } from '../../config/rbac.config';
import { HttpClient } from '../api/httpClient';
import { ThemeProvider } from '../../theme/ThemeContext';

interface RBACConfigContextValue {
  config: RBACConfig;
  http: HttpClient;
}

const RBACConfigContext = createContext<RBACConfigContextValue | null>(null);

export interface RBACConfigProviderProps {
  config?: RBACConfig;
  children: React.ReactNode;
}

export const RBACConfigProvider: React.FC<RBACConfigProviderProps> = ({ config = defaultRBACConfig, children }) => {
  const http = useMemo(() => {
    return new HttpClient({
      baseUrl: config.apiBaseUrl,
      getToken: config.getToken,
      getTenantId: config.getTenantId,
      getCustomHeaders: config.getCustomHeaders,
      refreshToken: config.refreshToken,
      onUnauthorized: config.onUnauthorized,
    });
  }, [
    config.apiBaseUrl,
    config.getToken,
    config.getTenantId,
    config.getCustomHeaders,
    config.refreshToken,
    config.onUnauthorized,
  ]);

  const value = useMemo(() => ({ config, http }), [config, http]);

  return (
    <RBACConfigContext.Provider value={value}>
      <ThemeProvider theme={config.theme}>{children}</ThemeProvider>
    </RBACConfigContext.Provider>
  );
};

export function useRBACConfig(): RBACConfigContextValue {
  const context = useContext(RBACConfigContext);
  if (!context) {
    throw new Error('useRBACConfig must be used within an RBACConfigProvider');
  }
  return context;
}
