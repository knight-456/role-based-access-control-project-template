import React, { createContext, useContext, useMemo } from 'react';
import { RBACTheme } from './theme.types';
import { defaultRBACTheme, mergeThemes } from './defaultTheme';

interface ThemeContextValue {
  theme: RBACTheme;
  cssVariables: Record<string, string>;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultRBACTheme,
  cssVariables: {},
});

export interface ThemeProviderProps {
  theme?: Partial<RBACTheme>;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme: customTheme, children }) => {
  const mergedTheme = useMemo(() => {
    return mergeThemes(defaultRBACTheme, customTheme);
  }, [customTheme]);

  const cssVariables = useMemo(() => {
    const c = mergedTheme.colors;
    const r = mergedTheme.borderRadius;
    const t = mergedTheme.typography;

    return {
      '--rbac-color-primary': c.primary,
      '--rbac-color-primary-hover': c.primaryHover,
      '--rbac-color-primary-light': c.primaryLight,
      '--rbac-color-primary-text': c.primaryText,

      '--rbac-color-secondary': c.secondary,
      '--rbac-color-secondary-hover': c.secondaryHover,
      '--rbac-color-secondary-text': c.secondaryText,

      '--rbac-color-bg': c.background,
      '--rbac-color-surface': c.surface,
      '--rbac-color-border': c.border,

      '--rbac-color-text-primary': c.textPrimary,
      '--rbac-color-text-secondary': c.textSecondary,
      '--rbac-color-text-placeholder': c.textPlaceholder,

      '--rbac-radius-sm': r.sm,
      '--rbac-radius-md': r.md,
      '--rbac-radius-lg': r.lg,
      '--rbac-radius-xl': r.xl,

      '--rbac-font-family': t.fontFamily,
      '--rbac-table-header-bg': mergedTheme.table.headerBg,
      '--rbac-table-header-color': mergedTheme.table.headerTextColor,
      '--rbac-table-border-color': mergedTheme.table.borderColor,
      '--rbac-table-hover-bg': mergedTheme.table.rowHoverBg,
    };
  }, [mergedTheme]);

  const value = useMemo(() => ({ theme: mergedTheme, cssVariables }), [mergedTheme, cssVariables]);

  return (
    <ThemeContext.Provider value={value}>
      <div style={cssVariables as React.CSSProperties} className="rbac-theme-root">
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
