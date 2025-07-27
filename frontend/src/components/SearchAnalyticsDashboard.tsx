import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useSearch } from '../contexts/SearchContext';

interface SearchAnalyticsDashboardProps {
  open: boolean;
  onClose: () => void;
}

export const SearchAnalyticsDashboard: React.FC<SearchAnalyticsDashboardProps> = ({
  open,
  onClose
}) => {
  const { searchEngine } = useSearch() as any; // Type assertion for demo
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [popularQueries, setPopularQueries] = useState<string[]>([]);

  useEffect(() => {
    if (open && searchEngine) {
      const searchAnalytics = searchEngine.getAnalytics();
      const popular = searchEngine.getPopularQueries(10);
      
      setAnalytics(searchAnalytics);
      setPopularQueries(popular);
    }
  }, [open, searchEngine]);

  const calculateMetrics = () => {
    if (analytics.length === 0) return null;

    const totalSearches = analytics.length;
    const avgResponseTime = analytics.reduce((sum, a) => sum + a.responseTime, 0) / totalSearches;
    const avgResultCount = analytics.reduce((sum, a) => sum + a.resultCount, 0) / totalSearches;
    const clickThroughRate = analytics.filter(a => a.clickThrough).length / totalSearches * 100;

    // Zero result queries
    const zeroResultQueries = analytics.filter(a => a.resultCount === 0);
    const zeroResultRate = zeroResultQueries.length / totalSearches * 100;

    // Recent searches
    const recentSearches = analytics
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    // Query frequency
    const queryFrequency = new Map<string, number>();
    analytics.forEach(a => {
      queryFrequency.set(a.query, (queryFrequency.get(a.query) || 0) + 1);
    });

    const topQueries = Array.from(queryFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      totalSearches,
      avgResponseTime,
      avgResultCount,
      clickThroughRate,
      zeroResultRate,
      recentSearches,
      topQueries,
      zeroResultQueries: zeroResultQueries.slice(0, 10)
    };
  };

  const metrics = calculateMetrics();

  if (!metrics) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>Search Analytics</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No search data available yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start searching to see analytics
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchIcon />
          Search Analytics Dashboard
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Overview Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SearchIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Searches</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {metrics.totalSearches.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ScheduleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Avg Response Time</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {metrics.avgResponseTime.toFixed(1)}ms
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ViewIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Avg Results</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {metrics.avgResultCount.toFixed(1)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Click-Through Rate</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {metrics.clickThroughRate.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Top Queries */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Most Popular Queries
              </Typography>
              <List dense>
                {metrics.topQueries.map(([query, count], index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">{query || '(empty query)'}</Typography>
                          <Chip label={`${count} searches`} size="small" />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Zero Result Queries */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Zero Result Queries ({metrics.zeroResultRate.toFixed(1)}%)
              </Typography>
              <List dense>
                {metrics.zeroResultQueries.map((analytic, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">{analytic.query}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(analytic.timestamp).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Recent Searches */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Recent Search Activity
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Query</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Results</TableCell>
                      <TableCell>Response Time</TableCell>
                      <TableCell>Click-Through</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metrics.recentSearches.map((analytic, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2">
                            {analytic.query || '(empty query)'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(analytic.timestamp).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={analytic.resultCount}
                            size="small"
                            color={analytic.resultCount === 0 ? 'error' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {analytic.responseTime.toFixed(1)}ms
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={analytic.clickThrough ? 'Yes' : 'No'}
                            size="small"
                            color={analytic.clickThrough ? 'success' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Performance Insights */}
        <Box sx={{ mt: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Performance Insights
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Search Performance
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, (1000 - metrics.avgResponseTime) / 10)}
                    color={metrics.avgResponseTime < 500 ? 'success' : metrics.avgResponseTime < 1000 ? 'warning' : 'error'}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Average response time: {metrics.avgResponseTime.toFixed(1)}ms
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Result Quality
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={100 - metrics.zeroResultRate}
                    color={metrics.zeroResultRate < 10 ? 'success' : metrics.zeroResultRate < 25 ? 'warning' : 'error'}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {metrics.zeroResultRate.toFixed(1)}% queries with zero results
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    User Engagement
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={metrics.clickThroughRate}
                    color={metrics.clickThroughRate > 20 ? 'success' : metrics.clickThroughRate > 10 ? 'warning' : 'error'}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {metrics.clickThroughRate.toFixed(1)}% click-through rate
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};