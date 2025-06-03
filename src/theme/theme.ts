import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';

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

// ثيم منصة غرب
const appTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: '"IBM Plex Sans Arabic", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.3,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.3,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.3,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.3,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    subtitle1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      fontWeight: 500,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  palette: {
    primary: {
      // لون أزرق يميل للبتراولي، يعكس الهدوء والرزانة المناسبة للقرآن
      main: '#1e6f8e',
      light: '#4a9fbe',
      dark: '#004560',
      contrastText: '#ffffff',
    },
    secondary: {
      // لون أخضر يمثل السلام والتأمل
      main: '#4caf50',
      light: '#80e27e',
      dark: '#087f23',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f9fc', // خلفية فاتحة مع لمسة زرقاء خفيفة
      paper: '#ffffff',
    },
    text: {
      primary: '#37474f',
      secondary: '#546e7a',
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
  // إضافة الظلال الخاصة
  customShadows: {
    card: '0 4px 12px rgba(0,0,0,0.05)',
    cardHover: '0 8px 24px rgba(0,0,0,0.1)',
    button: '0 4px 8px rgba(0,0,0,0.1)',
    section: '0 6px 20px rgba(0,0,0,0.07)',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 16px',
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          overflow: 'visible',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
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
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
        elevation3: {
          boxShadow: '0 6px 16px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
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
      styleOverrides: {
        root: {
          textTransform: 'none',
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
            backgroundColor: 'rgba(30, 111, 142, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(30, 111, 142, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(30, 111, 142, 0.15)',
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
  },
});

export default appTheme;
