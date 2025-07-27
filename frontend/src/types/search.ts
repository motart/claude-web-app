export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: SearchResultType;
  category: string;
  url: string;
  metadata?: Record<string, any>;
  score: number;
  timestamp?: Date;
  tags?: string[];
}

export type SearchResultType = 
  | 'dashboard_metric'
  | 'forecast'
  | 'data_source'
  | 'connector'
  | 'conversation'
  | 'customer'
  | 'product'
  | 'order'
  | 'insight'
  | 'setting'
  | 'help_article';

export interface SearchFilter {
  type?: SearchResultType[];
  category?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface SearchQuery {
  query: string;
  filters?: SearchFilter;
  sortBy?: 'relevance' | 'date' | 'title' | 'type';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  boost?: Record<string, number>;
  fuzzy?: boolean;
  prefix?: boolean;
  combineWith?: 'AND' | 'OR';
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  page: number;
  totalPages: number;
  filters: {
    types: Array<{ type: SearchResultType; count: number }>;
    categories: Array<{ category: string; count: number }>;
    tags: Array<{ tag: string; count: number }>;
  };
  suggestions?: string[];
  queryTime: number;
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: Date;
  resultCount: number;
  filters?: SearchFilter;
}

export interface SearchContext {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  filters: SearchFilter;
  setFilters: (filters: SearchFilter) => void;
  search: (query: SearchQuery) => Promise<void>;
  clearSearch: () => void;
  history: SearchHistory[];
  addToHistory: (query: string, resultCount: number, filters?: SearchFilter) => void;
  recentSearches: string[];
  suggestions: string[];
  isGlobalSearchOpen: boolean;
  setGlobalSearchOpen: (open: boolean) => void;
}

// Mock data interfaces for different search contexts
export interface DashboardSearchData {
  metrics: Array<{
    id: string;
    name: string;
    value: number;
    category: string;
    description: string;
  }>;
  charts: Array<{
    id: string;
    title: string;
    type: string;
    description: string;
  }>;
}

export interface DataSearchData {
  datasets: Array<{
    id: string;
    name: string;
    source: string;
    recordCount: number;
    lastUpdated: Date;
    tags: string[];
  }>;
  uploads: Array<{
    id: string;
    filename: string;
    uploadDate: Date;
    status: string;
    recordCount: number;
  }>;
}

export interface ForecastSearchData {
  forecasts: Array<{
    id: string;
    name: string;
    type: string;
    accuracy: number;
    createdDate: Date;
    description: string;
  }>;
  models: Array<{
    id: string;
    name: string;
    algorithm: string;
    accuracy: number;
    status: string;
  }>;
}

export interface CustomerServiceSearchData {
  conversations: Array<{
    id: string;
    userId: string;
    userName: string;
    subject: string;
    status: string;
    satisfaction: number;
    startTime: Date;
    messages: number;
    intent: string;
  }>;
  insights: Array<{
    id: string;
    category: string;
    insight: string;
    confidence: number;
    actionRequired: boolean;
  }>;
}