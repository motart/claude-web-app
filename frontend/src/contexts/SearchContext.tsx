import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  SearchContext as ISearchContext,
  SearchQuery,
  SearchResult,
  SearchFilter,
  SearchHistory,
  SearchResultType
} from '../types/search';
import { EnterpriseSearchEngine, createDebouncedSearch } from '../services/searchEngine';
import { SearchDataService } from '../services/searchDataService';

const SearchContext = createContext<ISearchContext | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilter>({});
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [isGlobalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [searchEngine] = useState(() => new EnterpriseSearchEngine({
    enableFuzzySearch: true,
    enableAnalytics: true,
    maxResults: 100,
    fuzzyThreshold: 0.6
  }));
  const [searchDataService] = useState(() => new SearchDataService(searchEngine));
  const [debouncedSearch] = useState(() => createDebouncedSearch(searchEngine, 300));

  // Initialize search engine with business data
  useEffect(() => {
    const initializeSearch = async () => {
      try {
        await searchDataService.indexAllData();
        console.log('🔍 Enterprise search engine initialized with business data');
      } catch (error) {
        console.error('Failed to initialize search engine:', error);
        setError('Failed to initialize search engine');
      }
    };

    initializeSearch();
  }, [searchDataService]);

  const search = useCallback(async (searchQuery: SearchQuery) => {
    setIsLoading(true);
    setError(null);

    try {
      const searchResult = await searchEngine.search(searchQuery);
      
      setResults(searchResult.results);

      // Add to history if query is not empty
      if (searchQuery.query.trim()) {
        addToHistory(searchQuery.query, searchResult.results.length, searchQuery.filters);
      }

      // Log analytics
      console.log('🔍 Search Analytics:', {
        query: searchQuery.query,
        resultCount: searchResult.results.length,
        responseTime: searchResult.analytics.responseTime,
        suggestions: searchResult.suggestions,
        facets: searchResult.facets
      });

    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchEngine]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setFilters({});
    setError(null);
  }, []);

  const addToHistory = useCallback((searchQuery: string, resultCount: number, searchFilters?: SearchFilter) => {
    const historyItem: SearchHistory = {
      id: `search_${Date.now()}`,
      query: searchQuery,
      timestamp: new Date(),
      resultCount,
      filters: searchFilters
    };

    setHistory(prev => {
      const filtered = prev.filter(item => item.query !== searchQuery);
      return [historyItem, ...filtered].slice(0, 10); // Keep last 10 searches
    });
  }, []);

  // Load search history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('orderNimbus_searchHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    }
  }, []);

  // Save search history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('orderNimbus_searchHistory', JSON.stringify(history));
    }
  }, [history]);

  // Derived values
  const recentSearches = history.slice(0, 5).map(item => item.query);
  const suggestions = searchEngine.getPopularQueries(6);

  const value: ISearchContext = {
    query,
    setQuery,
    results,
    isLoading,
    error,
    filters,
    setFilters,
    search,
    clearSearch,
    history,
    addToHistory,
    recentSearches,
    suggestions,
    isGlobalSearchOpen,
    setGlobalSearchOpen
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};