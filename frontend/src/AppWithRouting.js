import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';

// Simple components to test routing
const SimpleLogin = () => (
  <div style={{ padding: '40px', textAlign: 'center', background: '#667eea', color: 'white', minHeight: '100vh' }}>
    <h1>🔑 Simple Login Page</h1>
    <p>Login component is working!</p>
  </div>
);

const SimpleDashboard = () => (
  <div style={{ padding: '40px', textAlign: 'center', background: '#2563eb', color: 'white', minHeight: '100vh' }}>
    <h1>📊 Simple Dashboard</h1>
    <p>Dashboard component is working!</p>
  </div>
);

const SimpleProtectedRoute = ({ children }) => {
  return children; // Skip authentication for testing
};

const theme = createTheme({
  palette: {
    primary: { main: '#2563eb' },
    secondary: { main: '#7c3aed' },
  },
});

function AppWithRouting() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<SimpleLogin />} />
            <Route path="/dashboard" element={<SimpleProtectedRoute><SimpleDashboard /></SimpleProtectedRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default AppWithRouting;