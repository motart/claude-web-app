import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  InputAdornment,
  Divider,
  Paper,
  CircularProgress,
  Avatar,
  useTheme,
  alpha,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Collapse
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  History as HistoryIcon,
  TrendingUp as TrendingIcon,
  Dashboard as DashboardIcon,
  DataObject as DataIcon,
  Chat as ChatIcon,
  Insights as InsightsIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../contexts/SearchContext';
import { SearchResultType } from '../types/search';
import { SearchResultHighlight } from './SearchResultHighlight';
import { SearchAnalyticsDashboard } from './SearchAnalyticsDashboard';

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

const resultTypeIcons: Record<SearchResultType, React.ReactElement> = {
  dashboard_metric: <DashboardIcon />,
  forecast: <TrendingIcon />,
  data_source: <DataIcon />,
  connector: <DataIcon />,
  conversation: <ChatIcon />,
  customer: <ChatIcon />,
  product: <DataIcon />,
  order: <DataIcon />,
  insight: <InsightsIcon />,
  setting: <DashboardIcon />,
  help_article: <InsightsIcon />
};

const resultTypeColors: Record<SearchResultType, string> = {
  dashboard_metric: '#2563eb',
  forecast: '#7c3aed',
  data_source: '#059669',
  connector: '#059669',
  conversation: '#dc2626',
  customer: '#dc2626',
  product: '#d97706',
  order: '#d97706',
  insight: '#0891b2',
  setting: '#64748b',
  help_article: '#64748b'
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [localQuery, setLocalQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<SearchResultType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showAnalytics, setShowAnalytics] = useState(false);

  const {
    results,
    isLoading,
    error,
    search,
    clearSearch,
    recentSearches,
    suggestions
  } = useSearch();

  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  useEffect(() => {
    if (localQuery.trim()) {
      const timeoutId = setTimeout(() => {
        search({
          query: localQuery,
          filters: {
            type: selectedTypes.length > 0 ? selectedTypes : undefined,
            category: selectedCategory ? [selectedCategory] : undefined
          }
        });
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      clearSearch();
    }
  }, [localQuery, selectedTypes, selectedCategory, search, clearSearch]);

  const handleResultClick = (result: any) => {
    navigate(result.url);
    onClose();
  };

  const handleRecentSearchClick = (query: string) => {
    setLocalQuery(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setLocalQuery(suggestion);
  };

  const handleClose = () => {
    setLocalQuery('');
    clearSearch();
    setShowFilters(false);
    setSelectedTypes([]);
    setSelectedCategory('');
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedCategory('');
  };

  const categories = ['Dashboard', 'Forecasting', 'Data', 'Customer Service', 'Insights'];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '80vh',
          m: 2
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <TextField
            ref={searchInputRef}
            fullWidth
            placeholder="Search across OrderNimbus..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => setShowFilters(!showFilters)}
                      color={showFilters ? 'primary' : 'default'}
                    >
                      <FilterIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setShowAnalytics(true)}
                      title="Search Analytics"
                    >
                      <TrendingIcon />
                    </IconButton>
                    <IconButton size="small" onClick={handleClose}>
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </InputAdornment>
              )
            }}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '1.1rem',
                '& fieldset': {
                  borderColor: 'transparent'
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main
                }
              }
            }}
          />

          <Collapse in={showFilters}>
            <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    multiple
                    size="small"
                    options={Object.keys(resultTypeIcons) as SearchResultType[]}
                    value={selectedTypes}
                    onChange={(_, newValue) => setSelectedTypes(newValue)}
                    getOptionLabel={(option) => option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    renderInput={(params) => (
                      <TextField {...params} label="Content Types" placeholder="Select types..." />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={option}
                          label={option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          size="small"
                          sx={{ bgcolor: alpha(resultTypeColors[option], 0.1) }}
                        />
                      ))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      label="Category"
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {categories.map(category => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={clearFilters}
                    startIcon={<ClearIcon />}
                  >
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </Box>

        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}

          {!localQuery && !isLoading && (
            <Box sx={{ p: 3 }}>
              {recentSearches.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Recent Searches
                  </Typography>
                  <List dense>
                    {recentSearches.map((search, index) => (
                      <ListItem
                        key={index}
                        onClick={() => handleRecentSearchClick(search)}
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 1,
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <HistoryIcon fontSize="small" color="action" />
                        </ListItemIcon>
                        <ListItemText primary={search} />
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                Suggestions
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {suggestions.map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    clickable
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          {localQuery && !isLoading && results.length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No results found for "{localQuery}"
              </Typography>
            </Box>
          )}

          {results.length > 0 && (
            <List>
              {results.map((result, index) => (
                <ListItem
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  sx={{
                    cursor: 'pointer',
                    borderBottom: index < results.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                    py: 2
                  }}
                >
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: alpha(resultTypeColors[result.type], 0.1),
                        color: resultTypeColors[result.type]
                      }}
                    >
                      {resultTypeIcons[result.type]}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {result.title}
                        </Typography>
                        <Chip
                          label={result.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            bgcolor: alpha(resultTypeColors[result.type], 0.1),
                            color: resultTypeColors[result.type]
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Box sx={{ mb: 1 }}>
                          <SearchResultHighlight 
                            text={result.description} 
                            searchQuery={localQuery}
                            maxLength={200}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Chip label={result.category} size="small" variant="outlined" />
                          {result.tags?.slice(0, 2).map(tag => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                          ))}
                          {result.metadata?.fuzzyMatch && (
                            <Chip label="Fuzzy Match" size="small" color="secondary" />
                          )}
                          {result.score && (
                            <Chip 
                              label={`${Math.round(result.score * 100)}% match`} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                          )}
                          {result.timestamp && (
                            <Typography variant="caption" color="text.secondary">
                              {result.timestamp.toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {results.length > 5 && (
          <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
            <Button variant="outlined" onClick={() => navigate('/search')}>
              View All {results.length} Results
            </Button>
          </Box>
        )}
      </DialogContent>

      {/* Search Analytics Dashboard */}
      <SearchAnalyticsDashboard 
        open={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />
    </Dialog>
  );
};