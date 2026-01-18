// アプリ全体のテーマ・カラー定義

export const Colors = {
  // プライマリカラー（コーヒーブラウン系）
  primary: {
    50: '#fdf8f6',
    100: '#f2e8e5',
    200: '#eaddd7',
    300: '#e0cec7',
    400: '#d2bab0',
    500: '#bfa094',
    600: '#a18072',
    700: '#977669',
    800: '#846358',
    900: '#43302b',
  },

  // アクセントカラー（ウォームオレンジ）
  accent: {
    light: '#ffb74d',
    main: '#ff9800',
    dark: '#f57c00',
  },

  // ニュートラル
  neutral: {
    white: '#ffffff',
    gray50: '#fafafa',
    gray100: '#f5f5f5',
    gray200: '#eeeeee',
    gray300: '#e0e0e0',
    gray400: '#bdbdbd',
    gray500: '#9e9e9e',
    gray600: '#757575',
    gray700: '#616161',
    gray800: '#424242',
    gray900: '#212121',
    black: '#000000',
  },

  // セマンティックカラー
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',

  // 焙煎度カラー
  roastLevel: {
    LIGHT: '#d4a574',
    MEDIUM_LIGHT: '#b8956e',
    MEDIUM: '#8b6914',
    MEDIUM_DARK: '#5d4037',
    DARK: '#3e2723',
  },
};

export const Typography = {
  fontSizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 30,
    '5xl': 36,
  },
  fontWeights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// ダークモード対応テーマ
export const LightTheme = {
  background: Colors.neutral.white,
  surface: Colors.neutral.gray50,
  text: Colors.neutral.gray900,
  textSecondary: Colors.neutral.gray600,
  border: Colors.neutral.gray200,
  primary: Colors.primary[700],
  accent: Colors.accent.main,
};

export const DarkTheme = {
  background: Colors.neutral.gray900,
  surface: Colors.neutral.gray800,
  text: Colors.neutral.white,
  textSecondary: Colors.neutral.gray400,
  border: Colors.neutral.gray700,
  primary: Colors.primary[400],
  accent: Colors.accent.light,
};
