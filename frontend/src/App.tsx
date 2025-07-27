import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { DataIngestion } from './pages/DataIngestion';
import { Forecasting } from './pages/Forecasting';
import { Connectors } from './pages/Connectors';
import { ProfileSettings } from './pages/ProfileSettings';
import { Onboarding } from './pages/Onboarding';
import { CustomerService } from './pages/CustomerService';
import { ProtectedRoute } from './components/ProtectedRoute';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c3aed',
      light: '#8b5cf6',
      dark: '#6d28d9',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
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
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          border: '1px solid #e2e8f0',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="data" element={<DataIngestion />} />
              <Route path="forecasting" element={<Forecasting />} />
              <Route path="connectors" element={<Connectors />} />
              <Route path="customer-service" element={<CustomerService />} />
              <Route path="settings" element={<ProfileSettings />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;