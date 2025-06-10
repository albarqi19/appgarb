import { createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

declare module '@mui/material/styles' {
  interface Theme {
    customShadows: {
      card: string;
      cardHover: string;
      button: string;
      section: string;
    };
  }
  interface ThemeOptions {
    customShadows?: {
      card?: string;
      cardHover?: string;
      button?: string;
      section?: string;
    };
  }
}

// تعريف الألوان المشتركة
const primaryColor = {
  main: '#1e6f8e',
  light: '#4a9fbe',
  dark: '#004560',
  contrastText: '#ffffff',
};

const secondaryColor = {
  main: '#4caf50',
  light: '#80e27e',
  dark: '#087f23',
  contrastText: '#ffffff',
};

// إنشاء الثيم باعتماد على الوضع (فاتح/مظلم)
export const getDesignTokens = (mode: PaletteMode) => ({
  direction: 'rtl' as const,
  typography: {
    fontFamily: '"IBM Plex Sans Arabic", sans-serif',
    h1: { fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.3 },
    h2: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.3 },
    h3: { fontWeight: 600, fontSize: '1.75rem', lineHeight: 1.3 },
    h4: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.3 },
    h5: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.3 },
    h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.3 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    subtitle1: { fontSize: '1rem', lineHeight: 1.6, fontWeight: 500 },
    button: { fontWeight: 600, textTransform: 'none' as const },
  },
  palette: {
    mode,
    primary: primaryColor,
    secondary: secondaryColor,
    background: {
      default: mode === 'light' ? '#f5f9fc' : '#0a192f',
      paper: mode === 'light' ? '#ffffff' : '#112240',
    },
    text: {
      primary: mode === 'light' ? '#37474f' : '#e6f1ff',
      secondary: mode === 'light' ? '#546e7a' : '#a8b2d1',
    },
    success: {
      main: '#43a047',
      light: '#76d275',
      dark: '#00701a',
    },
    warning: {
      main: '#ff9800',
      light: '#ffc947',
      dark: '#c66900',
    },
    info: {
      main: '#039be5',
      light: '#63ccff',
      dark: '#006db3',
    },
    error: {
      main: '#e53935',
      light: '#ff6f60',
      dark: '#ab000d',
    },
  },
  customShadows: {
    card: mode === 'light' ? '0 4px 12px rgba(0,0,0,0.05)' : '0 4px 12px rgba(0,0,0,0.2)',
    cardHover: mode === 'light' ? '0 8px 24px rgba(0,0,0,0.1)' : '0 8px 24px rgba(0,0,0,0.3)',
    button: mode === 'light' ? '0 4px 8px rgba(0,0,0,0.1)' : '0 4px 8px rgba(0,0,0,0.3)',
    section: mode === 'light' ? '0 6px 20px rgba(0,0,0,0.07)' : '0 6px 20px rgba(0,0,0,0.25)',
  },  components: {
    MuiButton: {
      styleOverrides: {        root: {
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 16px',
          textTransform: 'none' as const,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: mode === 'light' ? '0 4px 8px rgba(0,0,0,0.1)' : '0 4px 8px rgba(0,0,0,0.3)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: mode === 'light' ? '0 6px 12px rgba(0,0,0,0.12)' : '0 6px 12px rgba(0,0,0,0.35)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {        root: {
          borderRadius: 12,
          boxShadow: mode === 'light' ? '0 4px 12px rgba(0,0,0,0.05)' : '0 4px 12px rgba(0,0,0,0.2)',
          overflow: 'visible' as const,
          position: 'relative' as const,
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          '&:hover': {
            boxShadow: mode === 'light' ? '0 8px 24px rgba(0,0,0,0.1)' : '0 8px 24px rgba(0,0,0,0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: mode === 'light' ? '0 2px 8px rgba(0,0,0,0.05)' : '0 2px 8px rgba(0,0,0,0.2)',
        },
        elevation2: {
          boxShadow: mode === 'light' ? '0 4px 12px rgba(0,0,0,0.05)' : '0 4px 12px rgba(0,0,0,0.2)',
        },
        elevation3: {
          boxShadow: mode === 'light' ? '0 6px 16px rgba(0,0,0,0.05)' : '0 6px 16px rgba(0,0,0,0.2)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light' ? '0 2px 12px rgba(0,0,0,0.08)' : '0 2px 12px rgba(0,0,0,0.15)',
          backgroundColor: mode === 'light' ? primaryColor.main : '#0e2d52',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: '2px solid rgba(255,255,255,0.2)',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {        root: {
          textTransform: 'none' as const,
          fontWeight: 500,
          fontSize: '0.95rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover': {
            backgroundColor: mode === 'light' ? 'rgba(30, 111, 142, 0.08)' : 'rgba(30, 111, 142, 0.15)',
          },
          '&.Mui-selected': {
            backgroundColor: mode === 'light' ? 'rgba(30, 111, 142, 0.12)' : 'rgba(30, 111, 142, 0.25)',
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(30, 111, 142, 0.15)' : 'rgba(30, 111, 142, 0.35)',
            },
          },
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 600,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: `
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: ${mode === 'light' ? '#f1f1f1' : '#1a3251'};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: ${mode === 'light' ? primaryColor.light : primaryColor.dark};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${mode === 'light' ? primaryColor.main : primaryColor.main};
        }
      `,
    },
  },
});

// إنشاء الثيم للاستخدام
export const lightTheme = createTheme(getDesignTokens('light'));
export const darkTheme = createTheme(getDesignTokens('dark'));

// الثيم الافتراضي هو الداكن
const defaultTheme = darkTheme;

export default defaultTheme;
