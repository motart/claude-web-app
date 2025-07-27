import MiniSearch from 'minisearch';
import Fuse from 'fuse.js';
import { debounce } from 'lodash';
import { SearchResult, SearchQuery, SearchFilter, SearchResultType } from '../types/search';

export interface SearchDocument {
  id: string;
  title: string;
  description: string;
  content: string;
  type: SearchResultType;
  category: string;
  url: string;
  tags: string[];
  metadata: Record<string, any>;
  timestamp?: Date;
  searchableText?: string;
}

export interface SearchEngineConfig {
  enableFuzzySearch: boolean;
  enableAnalytics: boolean;
  maxResults: number;
  fuzzyThreshold: number;
}

export interface SearchAnalytics {
  query: string;
  timestamp: Date;
  resultCount: number;
  clickThrough?: string;
  responseTime: number;
  filters?: SearchFilter;
}

export class EnterpriseSearchEngine {
  private miniSearch: MiniSearch;
  private fuse: Fuse<SearchDocument>;
  private documents: SearchDocument[] = [];
  private analytics: SearchAnalytics[] = [];
  private config: SearchEngineConfig;

  constructor(config: Partial<SearchEngineConfig> = {}) {
    this.config = {
      enableFuzzySearch: true,
      enableAnalytics: true,
      maxResults: 50,
      fuzzyThreshold: 0.6,
      ...config
    };

    // Initialize MiniSearch with advanced configuration
    this.miniSearch = new MiniSearch({
      fields: ['title', 'description', 'content', 'tags', 'searchableText'],
      storeFields: ['title', 'description', 'type', 'category', 'url', 'metadata', 'timestamp', 'tags'],
      searchOptions: {
        boost: {
          title: 3,
          description: 2,
          content: 1,
          tags: 2
        },
        fuzzy: 0.2,
        prefix: true,
        combineWith: 'AND'
      },
      idField: 'id'
    });

    // Initialize Fuse.js for fuzzy search
    this.fuse = new Fuse([], {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'content', weight: 0.2 },
        { name: 'tags', weight: 0.1 }
      ],
      threshold: this.config.fuzzyThreshold,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      shouldSort: true
    });
  }

  /**
   * Add documents to the search index
   */
  addDocuments(documents: SearchDocument[]): void {
    // Enhance documents with searchable text
    const enhancedDocs = documents.map(doc => ({
      ...doc,
      searchableText: this.createSearchableText(doc)
    }));

    this.documents = [...this.documents, ...enhancedDocs];
    
    // Add to MiniSearch
    this.miniSearch.addAll(enhancedDocs);
    
    // Update Fuse index
    this.fuse.setCollection(this.documents);
  }

  /**
   * Clear all documents and rebuild index
   */
  rebuildIndex(documents: SearchDocument[]): void {
    this.documents = [];
    this.miniSearch.removeAll();
    this.addDocuments(documents);
  }

  /**
   * Perform enterprise-grade search
   */
  async search(query: SearchQuery): Promise<{
    results: SearchResult[];
    analytics: SearchAnalytics;
    suggestions: string[];
    facets: Record<string, number>;
  }> {
    const startTime = performance.now();
    
    if (!query.query?.trim()) {
      return {
        results: [],
        analytics: this.createAnalytics('', 0, performance.now() - startTime, query.filters),
        suggestions: this.getPopularQueries(),
        facets: {}
      };
    }

    let searchResults: SearchResult[] = [];

    // Use MiniSearch for primary search
    const miniSearchResults = this.miniSearch.search(query.query, {
      boost: query.boost || {},
      fuzzy: query.fuzzy !== false ? 0.2 : false,
      prefix: query.prefix !== false,
      combineWith: query.combineWith || 'AND'
    });

    // Convert MiniSearch results to SearchResult format
    searchResults = miniSearchResults.map(result => ({
      id: result.id,
      title: result.title,
      description: result.description,
      type: result.type,
      category: result.category,
      url: result.url,
      score: result.score,
      metadata: result.metadata,
      timestamp: result.timestamp,
      tags: result.tags,
      matches: result.match ? Object.keys(result.match) : []
    }));

    // If MiniSearch doesn't return enough results and fuzzy search is enabled
    if (searchResults.length < 5 && this.config.enableFuzzySearch) {
      const fuseResults = this.fuse.search(query.query);
      
      // Add fuzzy results that aren't already included
      const existingIds = new Set(searchResults.map(r => r.id));
      const fuzzyResults = fuseResults
        .filter(result => !existingIds.has(result.item.id))
        .map(result => ({
          id: result.item.id,
          title: result.item.title,
          description: result.item.description,
          type: result.item.type,
          category: result.item.category,
          url: result.item.url,
          score: 1 - (result.score || 0),
          metadata: { ...result.item.metadata, fuzzyMatch: true },
          timestamp: result.item.timestamp,
          tags: result.item.tags,
          matches: result.matches?.map(m => m.key) || []
        }));

      searchResults = [...searchResults, ...fuzzyResults];
    }

    // Apply filters
    searchResults = this.applyFilters(searchResults, query.filters);

    // Apply sorting
    searchResults = this.applySorting(searchResults, query.sortBy, query.sortOrder);

    // Apply pagination
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, this.config.maxResults);
    const startIndex = (page - 1) * limit;
    const paginatedResults = searchResults.slice(startIndex, startIndex + limit);

    // Generate facets
    const facets = this.generateFacets(searchResults);

    // Generate suggestions
    const suggestions = this.generateSuggestions(query.query);

    const endTime = performance.now();
    const analytics = this.createAnalytics(
      query.query, 
      searchResults.length, 
      endTime - startTime,
      query.filters
    );

    if (this.config.enableAnalytics) {
      this.analytics.push(analytics);
    }

    return {
      results: paginatedResults,
      analytics,
      suggestions,
      facets
    };
  }

  /**
   * Get search suggestions based on query
   */
  getSuggestions(partialQuery: string): string[] {
    if (!partialQuery.trim()) {
      return this.getPopularQueries();
    }

    const suggestions = this.miniSearch.autoSuggest(partialQuery, {
      fuzzy: 0.2,
      prefix: true
    });

    return suggestions.slice(0, 10).map(suggestion => suggestion.suggestion);
  }

  /**
   * Get search analytics
   */
  getAnalytics(): SearchAnalytics[] {
    return this.analytics;
  }

  /**
   * Get popular search queries
   */
  getPopularQueries(limit: number = 10): string[] {
    const queryFrequency = new Map<string, number>();
    
    this.analytics.forEach(analytic => {
      const count = queryFrequency.get(analytic.query) || 0;
      queryFrequency.set(analytic.query, count + 1);
    });

    return Array.from(queryFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query]) => query);
  }

  /**
   * Track click-through
   */
  trackClickThrough(query: string, resultId: string): void {
    const recent = this.analytics
      .filter(a => a.query === query)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (recent) {
      recent.clickThrough = resultId;
    }
  }

  private createSearchableText(doc: SearchDocument): string {
    return [
      doc.title,
      doc.description,
      doc.content,
      ...doc.tags,
      Object.values(doc.metadata).join(' ')
    ].join(' ').toLowerCase();
  }

  private applyFilters(results: SearchResult[], filters?: SearchFilter): SearchResult[] {
    if (!filters) return results;

    let filtered = results;

    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter(result => filters.type!.includes(result.type));
    }

    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(result => filters.category!.includes(result.category));
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(result => 
        result.tags?.some(tag => filters.tags!.includes(tag))
      );
    }

    if (filters.dateRange) {
      filtered = filtered.filter(result => {
        if (!result.timestamp) return false;
        return result.timestamp >= filters.dateRange!.from && 
               result.timestamp <= filters.dateRange!.to;
      });
    }

    if (filters.metadata) {
      filtered = filtered.filter(result => {
        return Object.entries(filters.metadata!).every(([key, value]) => {
          return result.metadata?.[key] === value;
        });
      });
    }

    return filtered;
  }

  private applySorting(
    results: SearchResult[], 
    sortBy?: string, 
    sortOrder: 'asc' | 'desc' = 'desc'
  ): SearchResult[] {
    const multiplier = sortOrder === 'asc' ? 1 : -1;

    return results.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return multiplier * a.title.localeCompare(b.title);
        case 'date':
          const dateA = a.timestamp?.getTime() || 0;
          const dateB = b.timestamp?.getTime() || 0;
          return multiplier * (dateA - dateB);
        case 'type':
          return multiplier * a.type.localeCompare(b.type);
        case 'relevance':
        default:
          return multiplier * ((b.score || 0) - (a.score || 0));
      }
    });
  }

  private generateFacets(results: SearchResult[]): Record<string, number> {
    const facets: Record<string, number> = {};

    // Type facets
    results.forEach(result => {
      const key = `type:${result.type}`;
      facets[key] = (facets[key] || 0) + 1;
    });

    // Category facets
    results.forEach(result => {
      const key = `category:${result.category}`;
      facets[key] = (facets[key] || 0) + 1;
    });

    // Tag facets
    results.forEach(result => {
      result.tags?.forEach(tag => {
        const key = `tag:${tag}`;
        facets[key] = (facets[key] || 0) + 1;
      });
    });

    return facets;
  }

  private generateSuggestions(query: string): string[] {
    // Generate query suggestions based on common patterns
    const suggestions: string[] = [];
    
    if (query.length < 3) return suggestions;

    // Add auto-complete suggestions
    const autoComplete = this.getSuggestions(query);
    suggestions.push(...autoComplete);

    // Add semantic suggestions
    const semanticSuggestions = this.getSemanticSuggestions(query);
    suggestions.push(...semanticSuggestions);

    return Array.from(new Set(suggestions)).slice(0, 10);
  }

  private getSemanticSuggestions(query: string): string[] {
    const semanticMap: Record<string, string[]> = {
      'revenue': ['sales', 'income', 'earnings', 'profit'],
      'orders': ['purchases', 'transactions', 'sales'],
      'customers': ['users', 'clients', 'buyers'],
      'products': ['items', 'inventory', 'catalog'],
      'forecast': ['prediction', 'projection', 'trend'],
      'data': ['information', 'metrics', 'analytics']
    };

    const suggestions: string[] = [];
    const lowerQuery = query.toLowerCase();

    Object.entries(semanticMap).forEach(([key, synonyms]) => {
      if (lowerQuery.includes(key)) {
        synonyms.forEach(synonym => {
          suggestions.push(query.replace(new RegExp(key, 'gi'), synonym));
        });
      }
    });

    return suggestions;
  }

  private createAnalytics(
    query: string, 
    resultCount: number, 
    responseTime: number,
    filters?: SearchFilter
  ): SearchAnalytics {
    return {
      query,
      timestamp: new Date(),
      resultCount,
      responseTime,
      filters
    };
  }
}

// Debounced search function for performance
export const createDebouncedSearch = (searchEngine: EnterpriseSearchEngine, delay: number = 300) => {
  return debounce(async (query: SearchQuery) => {
    return await searchEngine.search(query);
  }, delay);
};