import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  InputAdornment,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  useTheme,
  alpha,
  Collapse,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Sort as SortIcon,
  KeyboardArrowDown as ExpandIcon
} from '@mui/icons-material';
import { SearchResult, SearchResultType } from '../types/search';

interface PageSearchProps {
  placeholder?: string;
  onSearch: (query: string, filters: any) => void;
  results?: SearchResult[];
  isLoading?: boolean;
  availableFilters?: {
    types?: SearchResultType[];
    categories?: string[];
    tags?: string[];
    customFilters?: Array<{
      key: string;
      label: string;
      options: Array<{ value: string; label: string }>;
    }>;
  };
  onResultClick?: (result: SearchResult) => void;
  showResults?: boolean;
  compact?: boolean;
}

export const PageSearch: React.FC<PageSearchProps> = ({
  placeholder = "Search...",
  onSearch,
  results = [],
  isLoading = false,
  availableFilters,
  onResultClick,
  showResults = true,
  compact = false
}) => {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [sortBy, setSortBy] = useState<string>('relevance');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(query, { ...filters, sortBy });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, filters, sortBy, onSearch]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSortBy('relevance');
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key] && (Array.isArray(filters[key]) ? filters[key].length > 0 : true)
  );

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setSortAnchorEl(null);
  };

  const getResultIcon = (type: SearchResultType) => {
    const icons: Record<SearchResultType, string> = {
      dashboard_metric: '📊',
      forecast: '📈',
      data_source: '💾',
      connector: '🔗',
      conversation: '💬',
      customer: '👤',
      product: '📦',
      order: '🛒',
      insight: '💡',
      setting: '⚙️',
      help_article: '📖'
    };
    return icons[type] || '📄';
  };

  return (
    <Box>
      <Paper 
        elevation={0} 
        sx={{ 
          p: compact ? 1 : 2, 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            size={compact ? "small" : "medium"}
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: query && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setQuery('')}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'transparent'
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.divider
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main
                }
              }
            }}
          />

          {availableFilters && (
            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              color={showFilters || hasActiveFilters ? 'primary' : 'default'}
              size={compact ? "small" : "medium"}
            >
              <FilterIcon />
            </IconButton>
          )}

          <IconButton
            onClick={(e) => setSortAnchorEl(e.currentTarget)}
            size={compact ? "small" : "medium"}
          >
            <SortIcon />
          </IconButton>
        </Box>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              Filters:
            </Typography>
            {Object.entries(filters).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null;
              const displayValue = Array.isArray(value) ? value.join(', ') : value;
              return (
                <Chip
                  key={key}
                  label={`${key}: ${displayValue}`}
                  size="small"
                  onDelete={() => handleFilterChange(key, Array.isArray(value) ? [] : '')}
                  variant="outlined"
                />
              );
            })}
            <Button size="small" onClick={clearFilters} startIcon={<ClearIcon />}>
              Clear All
            </Button>
          </Box>
        )}

        {/* Filter Panel */}
        {availableFilters && (
          <Collapse in={showFilters}>
            <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {/* Content Types Filter */}
                {availableFilters.types && (
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Content Type</InputLabel>
                    <Select
                      multiple
                      value={filters.types || []}
                      onChange={(e) => handleFilterChange('types', e.target.value)}
                      label="Content Type"
                      renderValue={(selected) => 
                        (selected as string[]).map(s => s.replace('_', ' ')).join(', ')
                      }
                    >
                      {availableFilters.types.map(type => (
                        <MenuItem key={type} value={type}>
                          {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Categories Filter */}
                {availableFilters.categories && (
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filters.category || ''}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      label="Category"
                    >
                      <MenuItem value="">All</MenuItem>
                      {availableFilters.categories.map(category => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Custom Filters */}
                {availableFilters.customFilters?.map(filter => (
                  <FormControl key={filter.key} size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>{filter.label}</InputLabel>
                    <Select
                      value={filters[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      label={filter.label}
                    >
                      <MenuItem value="">All</MenuItem>
                      {filter.options.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ))}
              </Box>
            </Box>
          </Collapse>
        )}
      </Paper>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={() => setSortAnchorEl(null)}
      >
        <MenuItem onClick={() => handleSortChange('relevance')} selected={sortBy === 'relevance'}>
          Relevance
        </MenuItem>
        <MenuItem onClick={() => handleSortChange('date')} selected={sortBy === 'date'}>
          Date
        </MenuItem>
        <MenuItem onClick={() => handleSortChange('title')} selected={sortBy === 'title'}>
          Title
        </MenuItem>
        <MenuItem onClick={() => handleSortChange('type')} selected={sortBy === 'type'}>
          Type
        </MenuItem>
      </Menu>

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <Paper elevation={0} sx={{ mt: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
          <List>
            {results.map((result, index) => (
              <ListItem
                key={result.id}
                onClick={() => onResultClick?.(result)}
                sx={{
                  cursor: onResultClick ? 'pointer' : 'default',
                  borderBottom: index < results.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                  '&:hover': onResultClick ? { bgcolor: alpha(theme.palette.primary.main, 0.05) } : {}
                }}
              >
                <ListItemIcon>
                  <Avatar sx={{ width: 32, height: 32, fontSize: '1rem' }}>
                    {getResultIcon(result.type)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">{result.title}</Typography>
                      <Chip
                        label={result.type.replace('_', ' ')}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {result.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {result.tags?.slice(0, 3).map(tag => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* No Results */}
      {showResults && query && results.length === 0 && !isLoading && (
        <Paper elevation={0} sx={{ mt: 2, p: 3, textAlign: 'center', border: `1px solid ${theme.palette.divider}` }}>
          <Typography color="text.secondary">
            No results found for "{query}"
          </Typography>
        </Paper>
      )}
    </Box>
  );
};