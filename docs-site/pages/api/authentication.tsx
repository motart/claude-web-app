import React from 'react'
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material'

const Authentication = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h1" component="h1" sx={{ mb: 2 }}>
          Authentication
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Secure access to the OrderNimbus API using API keys and Bearer tokens.
        </Typography>
      </Box>

      {/* Overview */}
      <Typography variant="h3" component="h2" sx={{ mb: 3 }}>
        Overview
      </Typography>
      <Typography variant="body1" paragraph>
        OrderNimbus API uses API keys for authentication. All API requests must include a valid API key in the Authorization header.
      </Typography>
      
      <Alert severity="warning" sx={{ mb: 4 }}>
        <strong>Keep your API keys secure!</strong> Never share them in publicly accessible areas such as GitHub, client-side code, or anywhere else.
      </Alert>

      {/* Getting API Keys */}
      <Typography variant="h3" component="h2" sx={{ mb: 3 }}>
        Getting API Keys
      </Typography>
      <Typography variant="body1" paragraph>
        To get your API keys:
      </Typography>
      <List sx={{ mb: 4 }}>
        <ListItem sx={{ pl: 0 }}>
          <ListItemText primary="1. Log in to your OrderNimbus dashboard" />
        </ListItem>
        <ListItem sx={{ pl: 0 }}>
          <ListItemText primary="2. Navigate to Settings > API Keys" />
        </ListItem>
        <ListItem sx={{ pl: 0 }}>
          <ListItemText primary="3. Click 'Generate New API Key'" />
        </ListItem>
        <ListItem sx={{ pl: 0 }}>
          <ListItemText primary="4. Copy and securely store your API key" />
        </ListItem>
      </List>

      {/* Authentication Methods */}
      <Typography variant="h3" component="h2" sx={{ mb: 3 }}>
        Authentication Methods
      </Typography>

      <Typography variant="h4" component="h3" sx={{ mb: 2 }}>
        API Key Authentication
      </Typography>
      <Typography variant="body1" paragraph>
        Include your API key in the Authorization header of every request:
      </Typography>

      <Paper sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
        <Box component="pre" sx={{ 
          bgcolor: '#1e293b', 
          color: 'white', 
          p: 2, 
          borderRadius: 1, 
          overflow: 'auto',
          fontSize: '0.875rem'
        }}>
{`curl -X GET "https://api.ordernimbus.com/v1/data/sales" \\
  -H "Authorization: Bearer your-api-key-here" \\
  -H "Content-Type: application/json"`}
        </Box>
      </Paper>

      <Typography variant="h4" component="h3" sx={{ mb: 2 }}>
        JavaScript/Node.js Example
      </Typography>
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
        <Box component="pre" sx={{ 
          bgcolor: '#1e293b', 
          color: 'white', 
          p: 2, 
          borderRadius: 1, 
          overflow: 'auto',
          fontSize: '0.875rem'
        }}>
{`const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'https://api.ordernimbus.com/v1',
  headers: {
    'Authorization': 'Bearer your-api-key-here',
    'Content-Type': 'application/json'
  }
});

// Example API call
const response = await apiClient.get('/data/sales');
console.log(response.data);`}
        </Box>
      </Paper>

      <Typography variant="h4" component="h3" sx={{ mb: 2 }}>
        Python Example
      </Typography>
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
        <Box component="pre" sx={{ 
          bgcolor: '#1e293b', 
          color: 'white', 
          p: 2, 
          borderRadius: 1, 
          overflow: 'auto',
          fontSize: '0.875rem'
        }}>
{`import requests

headers = {
    'Authorization': 'Bearer your-api-key-here',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.ordernimbus.com/v1/data/sales',
    headers=headers
)

data = response.json()
print(data)`}
        </Box>
      </Paper>

      {/* API Key Types */}
      <Typography variant="h3" component="h2" sx={{ mb: 3 }}>
        API Key Types
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Key Type</strong></TableCell>
              <TableCell><strong>Environment</strong></TableCell>
              <TableCell><strong>Permissions</strong></TableCell>
              <TableCell><strong>Rate Limit</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Chip label="Test Key" color="warning" size="small" />
              </TableCell>
              <TableCell>Sandbox</TableCell>
              <TableCell>Full access to test data</TableCell>
              <TableCell>1,000 req/hour</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Chip label="Live Key" color="success" size="small" />
              </TableCell>
              <TableCell>Production</TableCell>
              <TableCell>Full access to live data</TableCell>
              <TableCell>10,000 req/hour</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Chip label="Read-Only" color="info" size="small" />
              </TableCell>
              <TableCell>Production</TableCell>
              <TableCell>Read access only</TableCell>
              <TableCell>5,000 req/hour</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Environment URLs */}
      <Typography variant="h3" component="h2" sx={{ mb: 3 }}>
        Environment URLs
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Environment</strong></TableCell>
              <TableCell><strong>Base URL</strong></TableCell>
              <TableCell><strong>Purpose</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Chip label="Sandbox" color="warning" variant="outlined" />
              </TableCell>
              <TableCell>
                <Box component="code" sx={{ bgcolor: 'grey.100', px: 1, py: 0.5, borderRadius: 1 }}>
                  https://sandbox-api.ordernimbus.com/v1
                </Box>
              </TableCell>
              <TableCell>Testing and development</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Chip label="Production" color="success" variant="outlined" />
              </TableCell>
              <TableCell>
                <Box component="code" sx={{ bgcolor: 'grey.100', px: 1, py: 0.5, borderRadius: 1 }}>
                  https://api.ordernimbus.com/v1
                </Box>
              </TableCell>
              <TableCell>Live production data</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Error Responses */}
      <Typography variant="h3" component="h2" sx={{ mb: 3 }}>
        Authentication Errors
      </Typography>

      <Paper sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Missing API Key (401 Unauthorized)
        </Typography>
        <Box component="pre" sx={{ 
          bgcolor: '#1e293b', 
          color: 'white', 
          p: 2, 
          borderRadius: 1, 
          overflow: 'auto',
          fontSize: '0.875rem'
        }}>
{`{
  "error": {
    "type": "authentication_error",
    "code": "missing_api_key",
    "message": "API key is required. Include it in the Authorization header.",
    "docs": "https://docs.ordernimbus.com/api/authentication"
  }
}`}
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Invalid API Key (401 Unauthorized)
        </Typography>
        <Box component="pre" sx={{ 
          bgcolor: '#1e293b', 
          color: 'white', 
          p: 2, 
          borderRadius: 1, 
          overflow: 'auto',
          fontSize: '0.875rem'
        }}>
{`{
  "error": {
    "type": "authentication_error",
    "code": "invalid_api_key",
    "message": "The provided API key is invalid or has been revoked.",
    "docs": "https://docs.ordernimbus.com/api/authentication"
  }
}`}
        </Box>
      </Paper>

      {/* Best Practices */}
      <Typography variant="h3" component="h2" sx={{ mb: 3 }}>
        Security Best Practices
      </Typography>

      <List sx={{ mb: 4 }}>
        <ListItem sx={{ pl: 0 }}>
          <ListItemText 
            primary="Rotate API keys regularly"
            secondary="Generate new API keys every 90 days and revoke old ones"
          />
        </ListItem>
        <ListItem sx={{ pl: 0 }}>
          <ListItemText 
            primary="Use environment variables"
            secondary="Store API keys in environment variables, never in source code"
          />
        </ListItem>
        <ListItem sx={{ pl: 0 }}>
          <ListItemText 
            primary="Implement proper error handling"
            secondary="Handle authentication errors gracefully in your application"
          />
        </ListItem>
        <ListItem sx={{ pl: 0 }}>
          <ListItemText 
            primary="Monitor API key usage"
            secondary="Regularly review API key usage patterns for suspicious activity"
          />
        </ListItem>
        <ListItem sx={{ pl: 0 }}>
          <ListItemText 
            primary="Use different keys for different environments"
            secondary="Separate API keys for development, staging, and production"
          />
        </ListItem>
      </List>

      <Alert severity="info">
        <strong>Need help?</strong> If you're having trouble with authentication, check our{' '}
        <a href="/support/troubleshooting" style={{ color: 'inherit' }}>troubleshooting guide</a> or{' '}
        <a href="/support/contact" style={{ color: 'inherit' }}>contact support</a>.
      </Alert>
    </Container>
  )
}

export default Authentication