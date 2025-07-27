import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Chat as ChatIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Analytics as AnalyticsIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Sentiment as SentimentIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cs-tabpanel-${index}`}
      aria-labelledby={`cs-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const CustomerService: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversationDialogOpen, setConversationDialogOpen] = useState(false);

  // Mock data for demonstration
  const analyticsData = {
    overview: {
      totalConversations: 1247,
      totalMessages: 8934,
      avgSatisfaction: 4.2,
      resolutionRate: 87.5,
      avgResponseTime: 1.3,
      escalationRate: 12.5
    },
    trends: [
      { date: '2024-01-20', conversations: 45, satisfaction: 4.1, resolution: 85 },
      { date: '2024-01-21', conversations: 52, satisfaction: 4.3, resolution: 88 },
      { date: '2024-01-22', conversations: 38, satisfaction: 4.0, resolution: 82 },
      { date: '2024-01-23', conversations: 67, satisfaction: 4.4, resolution: 91 },
      { date: '2024-01-24', conversations: 71, satisfaction: 4.2, resolution: 86 },
      { date: '2024-01-25', conversations: 59, satisfaction: 4.5, resolution: 93 },
      { date: '2024-01-26', conversations: 48, satisfaction: 4.1, resolution: 84 }
    ],
    intentDistribution: [
      { name: 'Pricing Inquiry', value: 32, color: theme.palette.primary.main },
      { name: 'Help Request', value: 28, color: theme.palette.secondary.main },
      { name: 'Order Inquiry', value: 18, color: theme.palette.success.main },
      { name: 'Forecasting Question', value: 12, color: theme.palette.warning.main },
      { name: 'Data Question', value: 7, color: theme.palette.error.main },
      { name: 'General Inquiry', value: 3, color: theme.palette.info.main }
    ],
    sentimentData: [
      { time: '00:00', positive: 65, neutral: 25, negative: 10 },
      { time: '06:00', positive: 70, neutral: 22, negative: 8 },
      { time: '12:00', positive: 68, neutral: 24, negative: 8 },
      { time: '18:00', positive: 72, neutral: 20, negative: 8 },
    ],
    recentConversations: [
      {
        id: 'conv_1',
        userId: 'user_123',
        userName: 'John Doe',
        startTime: new Date('2024-01-26T10:30:00'),
        status: 'completed',
        satisfaction: 5,
        messages: 12,
        intent: 'pricing_inquiry',
        resolution: 'resolved'
      },
      {
        id: 'conv_2',
        userId: 'user_456',
        userName: 'Jane Smith',
        startTime: new Date('2024-01-26T09:15:00'),
        status: 'completed',
        satisfaction: 4,
        messages: 8,
        intent: 'help_request',
        resolution: 'resolved'
      },
      {
        id: 'conv_3',
        userId: 'user_789',
        userName: 'Mike Johnson',
        startTime: new Date('2024-01-26T08:45:00'),
        status: 'escalated',
        satisfaction: 2,
        messages: 15,
        intent: 'order_inquiry',
        resolution: 'escalated'
      }
    ],
    mlInsights: [
      {
        category: 'Pain Points',
        insights: [
          'Users frequently ask about pricing transparency - suggest adding pricing FAQ',
          'Integration setup is confusing for 23% of users - improve onboarding',
          'Export functionality is hard to find - consider UI improvements'
        ]
      },
      {
        category: 'Feature Requests',
        insights: [
          'Mobile app requested by 15% of users',
          'Slack integration mentioned 12 times this week',
          'Real-time notifications requested frequently'
        ]
      },
      {
        category: 'Conversation Quality',
        insights: [
          'Bot confidence drops to 45% for technical questions',
          'Users prefer step-by-step guides over generic responses',
          'Response time under 2 seconds increases satisfaction by 18%'
        ]
      }
    ]
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleViewConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setConversationDialogOpen(true);
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return theme.palette.success.main;
      case 'negative': return theme.palette.error.main;
      default: return theme.palette.warning.main;
    }
  };

  const renderOverview = () => (
    <Grid container spacing={3}>
      {/* Key Metrics */}
      <Grid item xs={12} md={8}>
        <Grid container spacing={3}>
          {[
            { 
              title: 'Total Conversations', 
              value: analyticsData.overview.totalConversations, 
              change: '+12%',
              positive: true,
              icon: <ChatIcon />
            },
            { 
              title: 'Avg Satisfaction', 
              value: analyticsData.overview.avgSatisfaction, 
              change: '+0.3',
              positive: true,
              icon: <ThumbUpIcon />,
              suffix: '/5'
            },
            { 
              title: 'Resolution Rate', 
              value: analyticsData.overview.resolutionRate, 
              change: '+2.1%',
              positive: true,
              icon: <TrendingUpIcon />,
              suffix: '%'
            },
            { 
              title: 'Avg Response Time', 
              value: analyticsData.overview.avgResponseTime, 
              change: '-0.2s',
              positive: true,
              icon: <ScheduleIcon />,
              suffix: 's'
            }
          ].map((metric, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 2, 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      mr: 2
                    }}>
                      {metric.icon}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {metric.title}
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    {metric.value}{metric.suffix}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {metric.positive ? <TrendingUpIcon color="success" fontSize="small" /> : <TrendingDownIcon color="error" fontSize="small" />}
                    <Typography 
                      variant="body2" 
                      color={metric.positive ? 'success.main' : 'error.main'}
                      sx={{ ml: 0.5 }}
                    >
                      {metric.change}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button variant="outlined" startIcon={<DownloadIcon />} fullWidth>
                Export Conversations
              </Button>
              <Button variant="outlined" startIcon={<AnalyticsIcon />} fullWidth>
                Generate Report
              </Button>
              <Button variant="contained" startIcon={<BotIcon />} fullWidth>
                Train AI Model
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Conversation Trends */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Conversation Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="conversations" 
                  stroke={theme.palette.primary.main} 
                  strokeWidth={2}
                  name="Conversations"
                />
                <Line 
                  type="monotone" 
                  dataKey="satisfaction" 
                  stroke={theme.palette.secondary.main} 
                  strokeWidth={2}
                  name="Satisfaction"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Intent Distribution */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Intent Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.intentDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData.intentDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Sentiment Analysis */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Sentiment Analysis Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.sentimentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="positive" 
                  stackId="1" 
                  stroke={theme.palette.success.main} 
                  fill={theme.palette.success.main}
                  name="Positive"
                />
                <Area 
                  type="monotone" 
                  dataKey="neutral" 
                  stackId="1" 
                  stroke={theme.palette.warning.main} 
                  fill={theme.palette.warning.main}
                  name="Neutral"
                />
                <Area 
                  type="monotone" 
                  dataKey="negative" 
                  stackId="1" 
                  stroke={theme.palette.error.main} 
                  fill={theme.palette.error.main}
                  name="Negative"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderConversations = () => (
    <Box>
      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search conversations..."
          size="small"
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ flexGrow: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status">
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="escalated">Escalated</MenuItem>
            <MenuItem value="active">Active</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Intent</InputLabel>
          <Select label="Intent">
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pricing">Pricing</MenuItem>
            <MenuItem value="help">Help</MenuItem>
            <MenuItem value="order">Order</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Conversations Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>Messages</TableCell>
              <TableCell>Intent</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Satisfaction</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {analyticsData.recentConversations.map((conversation) => (
              <TableRow key={conversation.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {conversation.userName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {conversation.userName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {conversation.userId}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {conversation.startTime.toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {conversation.startTime.toLocaleTimeString()}
                  </Typography>
                </TableCell>
                <TableCell>{conversation.messages}</TableCell>
                <TableCell>
                  <Chip 
                    label={conversation.intent.replace('_', ' ')} 
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={conversation.status} 
                    size="small"
                    color={conversation.status === 'completed' ? 'success' : conversation.status === 'escalated' ? 'error' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">{conversation.satisfaction}/5</Typography>
                    {conversation.satisfaction >= 4 ? 
                      <ThumbUpIcon color="success" fontSize="small" /> : 
                      <ThumbDownIcon color="error" fontSize="small" />
                    }
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => handleViewConversation(conversation.id)}
                  >
                    <ViewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderMLInsights = () => (
    <Grid container spacing={3}>
      {analyticsData.mlInsights.map((section, sectionIndex) => (
        <Grid item xs={12} md={4} key={sectionIndex}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                {section.category}
              </Typography>
              <List dense>
                {section.insights.map((insight, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemAvatar sx={{ minWidth: 'auto', mr: 2 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: theme.palette.primary.main
                        }}
                      />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={insight}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Training Data Quality */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              ML Training Data Quality
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                    8,934
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Training Examples
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    92.4%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Model Accuracy
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                    1,247
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Feedback Entries
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                    6
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Intent Categories
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Recommendation:</strong> Your model accuracy is excellent! Consider retraining weekly with new conversation data to maintain performance.
            </Alert>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" startIcon={<BotIcon />}>
                Retrain Model
              </Button>
              <Button variant="outlined" startIcon={<DownloadIcon />}>
                Export Training Data
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const tabs = [
    { label: 'Overview', icon: <AnalyticsIcon /> },
    { label: 'Conversations', icon: <ChatIcon /> },
    { label: 'ML Insights', icon: <SentimentIcon /> }
  ];

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Customer Service Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor chatbot performance and gain insights from customer conversations
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 72,
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                }
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={index}
                label={tab.label} 
                icon={tab.icon}
                iconPosition="start"
                sx={{ gap: 1 }}
              />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ px: 3 }}>
          <TabPanel value={activeTab} index={0}>
            {renderOverview()}
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            {renderConversations()}
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            {renderMLInsights()}
          </TabPanel>
        </Box>
      </Paper>

      {/* Conversation Detail Dialog */}
      <Dialog 
        open={conversationDialogOpen} 
        onClose={() => setConversationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Conversation Details</DialogTitle>
        <DialogContent>
          <Typography>Conversation details would be displayed here...</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConversationDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};