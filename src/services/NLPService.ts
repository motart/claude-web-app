import { logger } from '../utils/logger';

export interface NLPAnalysis {
  intent: string;
  confidence: number;
  entities: Entity[];
  sentiment: SentimentAnalysis;
  keywords: string[];
  language: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface Entity {
  type: string;
  value: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
  metadata?: any;
}

export interface SentimentAnalysis {
  polarity: 'positive' | 'negative' | 'neutral';
  confidence: number;
  score: number; // -1 to 1
}

export interface IntentPattern {
  intent: string;
  patterns: string[];
  keywords: string[];
  entities: string[];
  priority: number;
  examples: string[];
}

export class NLPService {
  private intentPatterns: IntentPattern[] = [];
  private stopWords: Set<string> = new Set();
  private entityPatterns: Map<string, RegExp[]> = new Map();

  constructor() {
    this.initializeNLP();
  }

  private initializeNLP() {
    this.loadStopWords();
    this.loadIntentPatterns();
    this.loadEntityPatterns();
  }

  async analyzeMessage(message: string, context?: any): Promise<NLPAnalysis> {
    try {
      const normalizedMessage = this.normalizeText(message);
      
      // Parallel analysis
      const [
        intentResult,
        entities,
        sentiment,
        keywords,
        language,
        urgency
      ] = await Promise.all([
        this.classifyIntent(normalizedMessage, context),
        this.extractEntities(message, normalizedMessage),
        this.analyzeSentiment(normalizedMessage),
        this.extractKeywords(normalizedMessage),
        this.detectLanguage(message),
        this.assessUrgency(normalizedMessage)
      ]);

      return {
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        entities,
        sentiment,
        keywords,
        language,
        urgency
      };
    } catch (error) {
      logger.error('NLP analysis failed:', error);
      return this.getDefaultAnalysis(message);
    }
  }

  private async classifyIntent(message: string, context?: any): Promise<{ intent: string; confidence: number }> {
    let bestMatch = { intent: 'general_inquiry', confidence: 0.3 };
    
    for (const pattern of this.intentPatterns) {
      let score = 0;
      let matches = 0;

      // Pattern matching
      for (const patternRegex of pattern.patterns) {
        const regex = new RegExp(patternRegex, 'i');
        if (regex.test(message)) {
          score += 0.4;
          matches++;
        }
      }

      // Keyword matching
      for (const keyword of pattern.keywords) {
        if (message.toLowerCase().includes(keyword.toLowerCase())) {
          score += 0.2;
          matches++;
        }
      }

      // Context boost
      if (context) {
        if (context.currentWorkflow && pattern.intent.includes('workflow')) {
          score += 0.3;
        }
        if (context.userProfile?.plan === 'enterprise' && pattern.intent.includes('support')) {
          score += 0.1;
        }
      }

      // Priority boost
      score += pattern.priority * 0.1;

      // Normalize by number of patterns + keywords
      if (matches > 0) {
        const normalizedScore = Math.min(
          score * (matches / (pattern.patterns.length + pattern.keywords.length)),
          1.0
        );

        if (normalizedScore > bestMatch.confidence) {
          bestMatch = {
            intent: pattern.intent,
            confidence: normalizedScore
          };
        }
      }
    }

    return bestMatch;
  }

  private async extractEntities(originalMessage: string, normalizedMessage: string): Promise<Entity[]> {
    const entities: Entity[] = [];

    for (const [entityType, patterns] of this.entityPatterns) {
      for (const pattern of patterns) {
        const matches = [...originalMessage.matchAll(new RegExp(pattern, 'gi'))];
        
        for (const match of matches) {
          if (match.index !== undefined) {
            entities.push({
              type: entityType,
              value: match[0],
              confidence: 0.9,
              startIndex: match.index,
              endIndex: match.index + match[0].length,
              metadata: {
                pattern: pattern.source,
                groups: match.slice(1)
              }
            });
          }
        }
      }
    }

    // Named entity recognition for common business terms
    entities.push(...this.extractBusinessEntities(originalMessage));
    
    // Remove duplicates and overlapping entities
    return this.deduplicateEntities(entities);
  }

  private extractBusinessEntities(message: string): Entity[] {
    const entities: Entity[] = [];
    const businessTerms = {
      'platform': ['shopify', 'amazon', 'bigcommerce', 'woocommerce', 'square', 'etsy'],
      'plan': ['starter', 'professional', 'enterprise', 'basic', 'premium'],
      'feature': ['forecasting', 'inventory', 'analytics', 'reporting', 'dashboard'],
      'metric': ['revenue', 'orders', 'customers', 'products', 'sales'],
      'time_period': ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'today', 'yesterday']
    };

    for (const [type, terms] of Object.entries(businessTerms)) {
      for (const term of terms) {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        const matches = [...message.matchAll(regex)];
        
        for (const match of matches) {
          if (match.index !== undefined) {
            entities.push({
              type,
              value: match[0],
              confidence: 0.8,
              startIndex: match.index,
              endIndex: match.index + match[0].length
            });
          }
        }
      }
    }

    return entities;
  }

  private async analyzeSentiment(message: string): Promise<SentimentAnalysis> {
    const positiveWords = ['good', 'great', 'excellent', 'love', 'amazing', 'perfect', 'happy', 'satisfied', 'thanks', 'helpful'];
    const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'horrible', 'frustrated', 'angry', 'disappointed', 'broken', 'useless'];
    const urgentWords = ['urgent', 'critical', 'emergency', 'asap', 'immediately', 'help', 'stuck', 'broken', 'not working'];

    let positiveScore = 0;
    let negativeScore = 0;
    let urgentScore = 0;

    const words = message.toLowerCase().split(/\s+/);

    for (const word of words) {
      if (positiveWords.includes(word)) positiveScore++;
      if (negativeWords.includes(word)) negativeScore++;
      if (urgentWords.includes(word)) urgentScore++;
    }

    const totalEmotionalWords = positiveScore + negativeScore;
    if (totalEmotionalWords === 0) {
      return { polarity: 'neutral', confidence: 0.5, score: 0 };
    }

    const score = (positiveScore - negativeScore) / totalEmotionalWords;
    const confidence = Math.min(totalEmotionalWords / words.length * 10, 1.0);

    let polarity: 'positive' | 'negative' | 'neutral';
    if (score > 0.2) polarity = 'positive';
    else if (score < -0.2) polarity = 'negative';
    else polarity = 'neutral';

    return { polarity, confidence, score };
  }

  private async extractKeywords(message: string): Promise<string[]> {
    const words = message.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && 
        !this.stopWords.has(word) &&
        !word.match(/^\d+$/)
      );

    // Simple frequency-based keyword extraction
    const wordFreq = new Map<string, number>();
    for (const word of words) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private async detectLanguage(message: string): Promise<string> {
    // Simple language detection based on common words
    const englishWords = ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'that', 'it', 'with'];
    const words = message.toLowerCase().split(/\s+/);
    
    let englishScore = 0;
    for (const word of words) {
      if (englishWords.includes(word)) englishScore++;
    }

    return englishScore / words.length > 0.1 ? 'en' : 'unknown';
  }

  private async assessUrgency(message: string): Promise<'low' | 'medium' | 'high'> {
    const highUrgencyWords = ['urgent', 'critical', 'emergency', 'asap', 'immediately', 'broken', 'down', 'not working'];
    const mediumUrgencyWords = ['help', 'issue', 'problem', 'error', 'stuck', 'need', 'important'];
    
    const lowerMessage = message.toLowerCase();
    
    for (const word of highUrgencyWords) {
      if (lowerMessage.includes(word)) return 'high';
    }
    
    for (const word of mediumUrgencyWords) {
      if (lowerMessage.includes(word)) return 'medium';
    }
    
    return 'low';
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private deduplicateEntities(entities: Entity[]): Entity[] {
    const deduplicated: Entity[] = [];
    const seen = new Set<string>();

    entities.sort((a, b) => b.confidence - a.confidence);

    for (const entity of entities) {
      const key = `${entity.type}:${entity.value.toLowerCase()}:${entity.startIndex}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(entity);
      }
    }

    return deduplicated;
  }

  private getDefaultAnalysis(message: string): NLPAnalysis {
    return {
      intent: 'general_inquiry',
      confidence: 0.5,
      entities: [],
      sentiment: { polarity: 'neutral', confidence: 0.5, score: 0 },
      keywords: message.split(/\s+/).slice(0, 5),
      language: 'en',
      urgency: 'medium'
    };
  }

  private loadStopWords() {
    const stopWords = [
      'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
      'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
      'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
      'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
      'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
      'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
      'while', 'of', 'at', 'by', 'for', 'with', 'through', 'during', 'before', 'after',
      'above', 'below', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
      'further', 'then', 'once'
    ];
    
    this.stopWords = new Set(stopWords);
  }

  private loadIntentPatterns() {
    this.intentPatterns = [
      {
        intent: 'pricing_inquiry',
        patterns: [
          'how much.*cost',
          'what.*price',
          'pricing.*plan',
          'how expensive',
          'cost.*subscription'
        ],
        keywords: ['price', 'cost', 'expensive', 'cheap', 'plan', 'billing', 'payment', 'subscription', 'fee'],
        entities: ['plan', 'currency'],
        priority: 8,
        examples: [
          'How much does the professional plan cost?',
          'What are your pricing options?',
          'Is OrderNimbus expensive?'
        ]
      },
      {
        intent: 'technical_support',
        patterns: [
          'not working',
          'error.*occurred',
          'broken.*feature',
          'bug.*found',
          'having.*trouble'
        ],
        keywords: ['error', 'bug', 'broken', 'issue', 'problem', 'trouble', 'help', 'fix', 'support'],
        entities: ['feature', 'error_code'],
        priority: 9,
        examples: [
          'I\'m getting an error when trying to sync data',
          'The dashboard is not loading properly',
          'There seems to be a bug in the forecasting'
        ]
      },
      {
        intent: 'integration_support',
        patterns: [
          'connect.*store',
          'integrate.*platform',
          'sync.*data',
          'setup.*connection',
          'link.*account'
        ],
        keywords: ['connect', 'integration', 'sync', 'setup', 'configure', 'shopify', 'amazon', 'platform'],
        entities: ['platform', 'store_name'],
        priority: 8,
        examples: [
          'How do I connect my Shopify store?',
          'I need help setting up Amazon integration',
          'My data is not syncing properly'
        ]
      },
      {
        intent: 'onboarding_help',
        patterns: [
          'getting started',
          'new.*user',
          'first.*time',
          'setup.*account',
          'tutorial.*guide'
        ],
        keywords: ['getting started', 'new', 'first time', 'onboarding', 'setup', 'tutorial', 'guide', 'help'],
        entities: ['user_type'],
        priority: 7,
        examples: [
          'I\'m new to OrderNimbus, how do I get started?',
          'Can you help me set up my account?',
          'I need a tutorial on using the platform'
        ]
      },
      {
        intent: 'feature_question',
        patterns: [
          'how.*work',
          'what.*does',
          'can.*do',
          'feature.*about',
          'functionality.*of'
        ],
        keywords: ['how', 'what', 'feature', 'functionality', 'capability', 'forecasting', 'analytics', 'reporting'],
        entities: ['feature'],
        priority: 6,
        examples: [
          'How does AI forecasting work?',
          'What features are included in my plan?',
          'Can OrderNimbus do inventory optimization?'
        ]
      },
      {
        intent: 'billing_inquiry',
        patterns: [
          'invoice.*question',
          'billing.*issue',
          'payment.*problem',
          'charge.*account',
          'subscription.*change'
        ],
        keywords: ['invoice', 'billing', 'payment', 'charge', 'subscription', 'upgrade', 'downgrade', 'cancel'],
        entities: ['plan', 'amount'],
        priority: 8,
        examples: [
          'I have a question about my invoice',
          'Why was my card charged twice?',
          'I want to upgrade my plan'
        ]
      },
      {
        intent: 'data_question',
        patterns: [
          'import.*data',
          'export.*information',
          'upload.*file',
          'data.*format',
          'csv.*excel'
        ],
        keywords: ['data', 'import', 'export', 'upload', 'download', 'csv', 'excel', 'format', 'file'],
        entities: ['file_type', 'data_type'],
        priority: 6,
        examples: [
          'How do I import my historical sales data?',
          'What file formats do you support?',
          'Can I export my forecasting data?'
        ]
      },
      {
        intent: 'account_management',
        patterns: [
          'change.*password',
          'update.*profile',
          'team.*member',
          'user.*permission',
          'account.*setting'
        ],
        keywords: ['account', 'password', 'profile', 'team', 'user', 'permission', 'settings', 'security'],
        entities: ['user_action', 'setting_type'],
        priority: 5,
        examples: [
          'How do I change my password?',
          'I need to add a team member',
          'Where are my account settings?'
        ]
      }
    ];
  }

  private loadEntityPatterns() {
    this.entityPatterns.set('email', [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    ]);

    this.entityPatterns.set('phone', [
      /\b(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g
    ]);

    this.entityPatterns.set('url', [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g
    ]);

    this.entityPatterns.set('currency', [
      /\$\d+(?:,\d{3})*(?:\.\d{2})?/g,
      /\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:dollars?|USD)/gi
    ]);

    this.entityPatterns.set('date', [
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g,
      /\b\d{4}-\d{2}-\d{2}\b/g,
      /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi
    ]);

    this.entityPatterns.set('number', [
      /\b\d+(?:,\d{3})*(?:\.\d+)?\b/g
    ]);
  }

  // Public methods for extending the NLP service
  public addIntentPattern(pattern: IntentPattern) {
    this.intentPatterns.push(pattern);
    this.intentPatterns.sort((a, b) => b.priority - a.priority);
  }

  public addEntityPattern(entityType: string, patterns: RegExp[]) {
    const existing = this.entityPatterns.get(entityType) || [];
    this.entityPatterns.set(entityType, [...existing, ...patterns]);
  }

  public updateStopWords(words: string[]) {
    words.forEach(word => this.stopWords.add(word.toLowerCase()));
  }
}