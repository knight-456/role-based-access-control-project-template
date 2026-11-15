export interface ThemeColors {
  primary: string;           // e.g. '#28518F'
  primaryHover: string;      // e.g. '#1e3f70'
  primaryLight: string;      // e.g. '#ebf1f8'
  primaryText: string;       // text color on primary button e.g. '#ffffff'

  secondary: string;         // e.g. '#f3f4f6'
  secondaryHover: string;    // e.g. '#e5e7eb'
  secondaryText: string;     // e.g. '#374151'

  background: string;        // app body background e.g. '#FAFAFC'
  surface: string;           // card/table/modal background e.g. '#ffffff'
  border: string;            // border color e.g. '#E5E7EB'

  textPrimary: string;       // headings / main text e.g. '#111827'
  textSecondary: string;     // muted text e.g. '#6B7280'
  textPlaceholder: string;   // placeholder text e.g. '#9CA3AF'

  success: string;           // e.g. '#10B981'
  successLight: string;      // e.g. '#ECFDF5'
  danger: string;            // e.g. '#EF4444'
  dangerLight: string;       // e.g. '#FEF2F2'
  warning: string;           // e.g. '#F59E0B'
  warningLight: string;      // e.g. '#FFFBEB'
  info: string;              // e.g. '#3B82F6'
  infoLight: string;         // e.g. '#EFF6FF'
}

export interface ThemeBorderRadius {
  none: string;              // '0px'
  sm: string;                // '4px'
  md: string;                // '8px'
  lg: string;                // '12px'
  xl: string;                // '16px'
  full: string;              // '9999px'
}

export interface ThemeTypography {
  fontFamily: string;        // 'Inter, sans-serif'
  fontSizeXs: string;        // '12px'
  fontSizeSm: string;        // '14px'
  fontSizeBase: string;      // '16px'
  fontSizeLg: string;        // '18px'
  fontSizeXl: string;        // '20px'
  fontSizeTitle: string;     // '24px'
}

export interface ThemeTableConfig {
  headerBg: string;          // e.g. '#FAFAFC'
  headerTextColor: string;   // e.g. '#4B5563'
  borderColor: string;       // e.g. '#E5E7EB'
  rowHoverBg: string;        // e.g. 'rgba(249, 250, 251, 0.75)'
  striped: boolean;
  compact: boolean;
}

export interface ThemeClassOverrides {
  button?: {
    base?: string;
    primary?: string;
    secondary?: string;
    danger?: string;
    outline?: string;
    ghost?: string;
  };
  table?: {
    container?: string;
    table?: string;
    thead?: string;
    th?: string;
    tbody?: string;
    tr?: string;
    td?: string;
    pagination?: string;
  };
  input?: {
    container?: string;
    label?: string;
    input?: string;
    error?: string;
  };
  modal?: {
    backdrop?: string;
    container?: string;
    header?: string;
    body?: string;
  };
  sidebar?: {
    container?: string;
    navItem?: string;
    navItemActive?: string;
    brand?: string;
  };
  badge?: {
    base?: string;
  };
}

export interface RBACTheme {
  name: string;
  colors: ThemeColors;
  borderRadius: ThemeBorderRadius;
  typography: ThemeTypography;
  table: ThemeTableConfig;
  classNames?: ThemeClassOverrides;
}
