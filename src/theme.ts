import { createTheme, alpha } from '@mui/material/styles'

// Brand color scheme derived from #8351a8 (purple)
const BRAND = '#8351a8'

export const chartPalette = [
  '#8351a8', // brand purple
  '#b083d6', // light purple
  '#5a2d80', // deep purple
  '#d1a7e8', // lilac
  '#e0765f', // warm accent
  '#3f9e8f', // teal accent
]

export const theme = createTheme({
  palette: {
    primary: {
      main: BRAND,
      light: '#a476c4',
      dark: '#5a2d80',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#e0765f',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f6f3fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2a1f36',
      secondary: '#6b6178',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily:
      '"Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${alpha(BRAND, 0.08)}`,
          boxShadow: '0 2px 12px rgba(90, 45, 128, 0.06)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          marginInline: 8,
          '&.Mui-selected': {
            backgroundColor: alpha(BRAND, 0.14),
            '&:hover': {
              backgroundColor: alpha(BRAND, 0.2),
            },
          },
        },
      },
    },
  },
})
