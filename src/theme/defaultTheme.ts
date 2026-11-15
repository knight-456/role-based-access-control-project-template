import { RBACTheme } from './theme.types';

export const defaultRBACTheme: RBACTheme = {
  name: 'default',
  colors: {
    primary: '#28518F',
    primaryHover: '#1f4073',
    primaryLight: '#edf3fc',
    primaryText: '#ffffff',

    secondary: '#f3f4f6',
    secondaryHover: '#e5e7eb',
    secondaryText: '#374151',

    background: '#FAFAFC',
    surface: '#ffffff',
    border: '#E5E7EB',

    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textPlaceholder: '#9CA3AF',

    success: '#10B981',
    successLight: '#ECFDF5',
    danger: '#EF4444',
    dangerLight: '#FEF2F2',
    warning: '#F59E0B',
    warningLight: '#FFFBEB',
    info: '#3B82F6',
    infoLight: '#EFF6FF',
  },
  borderRadius: {
    none: '0px',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSizeXs: '0.75rem',
    fontSizeSm: '0.875rem',
    fontSizeBase: '1rem',
    fontSizeLg: '1.125rem',
    fontSizeXl: '1.25rem',
    fontSizeTitle: '1.5rem',
  },
  table: {
    headerBg: '#FAFAFC',
    headerTextColor: '#4B5563',
    borderColor: '#E5E7EB',
    rowHoverBg: 'rgba(249, 250, 251, 0.75)',
    striped: false,
    compact: false,
  },
  classNames: {},
};

export function mergeThemes(base: RBACTheme, override?: Partial<RBACTheme>): RBACTheme {
  if (!override) return base;

  return {
    ...base,
    ...override,
    colors: { ...base.colors, ...(override.colors || {}) },
    borderRadius: { ...base.borderRadius, ...(override.borderRadius || {}) },
    typography: { ...base.typography, ...(override.typography || {}) },
    table: { ...base.table, ...(override.table || {}) },
    classNames: {
      ...base.classNames,
      ...(override.classNames || {}),
      button: { ...base.classNames?.button, ...(override.classNames?.button || {}) },
      table: { ...base.classNames?.table, ...(override.classNames?.table || {}) },
      input: { ...base.classNames?.input, ...(override.classNames?.input || {}) },
      modal: { ...base.classNames?.modal, ...(override.classNames?.modal || {}) },
      sidebar: { ...base.classNames?.sidebar, ...(override.classNames?.sidebar || {}) },
      badge: { ...base.classNames?.badge, ...(override.classNames?.badge || {}) },
    },
  };
}
