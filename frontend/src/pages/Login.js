import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Tab,
  Tabs
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const Login = () => {
  const [tab, setTab] = useState(0);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    name: '',
    company: ''
  });
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(loginData.email, loginData.password);
    navigate('/dashboard');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    await register(registerData);
    navigate('/dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper 
          elevation={24} 
          sx={{ 
            width: '100%',
            borderRadius: 4,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <Box sx={{ 
            p: 4, 
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}
            >
              RF
            </Box>
            <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Retail Forecast
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              AI-Powered Sales Analytics Platform
            </Typography>
          </Box>
          
          <Tabs value={tab} onChange={handleTabChange} centered>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          <TabPanel value={tab} index={0}>
            <Box component="form" onSubmit={handleLogin}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                autoFocus
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <Box component="form" onSubmit={handleRegister}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Full Name"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Company"
                value={registerData.company}
                onChange={(e) => setRegisterData({ ...registerData, company: e.target.value })}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Create Account
              </Button>
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
};