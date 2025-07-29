import axios from 'axios';
import { logger } from '../utils/logger';

export interface ConversationContext {
  userId: string;
  sessionId: string;
  conversationId: string;
  userProfile: {
    name: string;
    role: string;
    company?: string;
    plan: string;
    onboardingCompleted: boolean;
    storesConnected: number;
    lastActivity: Date;
  };
  currentWorkflow?: string;
  preferences: {
    language: string;
    timezone: string;
    communicationStyle: 'formal' | 'casual' | 'technical';
  };
  conversationHistory: ConversationMessage[];
  activeTickets: any[];
  recentActions: UserAction[];
}

export interface ConversationMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  intent: string;
  entities: ExtractedEntity[];
  confidence: number;
  context: any;
  feedback?: 'helpful' | 'not_helpful';
  escalated?: boolean;
}

export interface ExtractedEntity {
  type: string;
  value: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export interface UserAction {
  action: string;
  timestamp: Date;
  page: string;
  details: any;
}

export interface IntentClassification {
  intent: string;
  confidence: number;
  entities: ExtractedEntity[];
  requiresEscalation: boolean;
  suggestedActions: string[];
  workflowStep?: string;
}

export interface KnowledgeBaseEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  searchableText: string;
  confidence: number;
  lastUpdated: Date;
  usage: number;
  rating: number;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: string[];
  category: 'onboarding' | 'support' | 'technical' | 'billing' | 'integration';
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'question' | 'action' | 'information' | 'decision';
  content: string;
  nextSteps: { [key: string]: string };
  requiresInput: boolean;
  validationRules?: any;
}

export class IntelligentChatbotService {
  private knowledgeBase: KnowledgeBaseEntry[] = [];
  private workflows: WorkflowDefinition[] = [];
  private conversationContexts: Map<string, ConversationContext> = new Map();
  private intentClassifier: IntentClassifier;
  private nlpProcessor: NLPProcessor;

  constructor() {
    this.intentClassifier = new IntentClassifier();
    this.nlpProcessor = new NLPProcessor();
    this.loadKnowledgeBase();
    this.loadWorkflows();
  }

  async processMessage(
    message: string,
    context: ConversationContext
  ): Promise<ConversationMessage> {
    try {
      // Extract entities and classify intent
      const classification = await this.classifyIntent(message, context);
      
      // Update conversation context
      this.updateContext(context, message, classification);
      
      // Generate intelligent response
      const response = await this.generateResponse(classification, context);
      
      // Log conversation for training
      await this.logConversation(context, message, response, classification);
      
      return response;
    } catch (error) {
      logger.error('Error processing chatbot message:', error);
      return this.generateErrorResponse(context);
    }
  }

  private async classifyIntent(
    message: string,
    context: ConversationContext
  ): Promise<IntentClassification> {
    // Advanced intent classification using multiple approaches
    const nlpAnalysis = await this.nlpProcessor.analyze(message);
    const contextualIntent = this.getContextualIntent(message, context);
    const workflowIntent = this.detectWorkflowIntent(message);
    
    // Combine classifications with confidence scoring
    const combinedClassification = this.combineClassifications([
      nlpAnalysis,
      contextualIntent,
      workflowIntent
    ]);

    return combinedClassification;
  }

  private async generateResponse(
    classification: IntentClassification,
    context: ConversationContext
  ): Promise<ConversationMessage> {
    const responseId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let responseContent = '';
    let workflowStep = null;

    // Handle different intent types
    switch (classification.intent) {
      case 'technical_support':
        responseContent = await this.handleTechnicalSupport(classification, context);
        break;
      
      case 'billing_inquiry':
        responseContent = await this.handleBillingInquiry(classification, context);
        break;
      
      case 'onboarding_help':
        const workflow = await this.initiateWorkflow('onboarding', context);
        responseContent = workflow.content;
        workflowStep = workflow.stepId;
        break;
      
      case 'integration_support':
        responseContent = await this.handleIntegrationSupport(classification, context);
        break;
      
      case 'feature_question':
        responseContent = await this.handleFeatureQuestion(classification, context);
        break;
      
      case 'workflow_continuation':
        const workflowResponse = await this.continueWorkflow(classification, context);
        responseContent = workflowResponse.content;
        workflowStep = workflowResponse.stepId;
        break;
      
      default:
        responseContent = await this.handleGeneralInquiry(classification, context);
    }

    // Add personalization and context awareness
    responseContent = this.personalizeResponse(responseContent, context);
    
    // Add quick actions if applicable
    const quickActions = this.generateQuickActions(classification, context);
    
    return {
      id: responseId,
      content: responseContent,
      sender: 'bot',
      timestamp: new Date(),
      intent: classification.intent,
      entities: classification.entities,
      confidence: classification.confidence,
      context: {
        workflowStep,
        quickActions,
        suggestedActions: classification.suggestedActions
      }
    };
  }

  private async handleTechnicalSupport(
    classification: IntentClassification,
    context: ConversationContext
  ): Promise<string> {
    // Extract technical issue details
    const issueType = this.extractIssueType(classification.entities);
    const severity = this.assessSeverity(classification, context);
    
    // Search knowledge base for solutions
    const solutions = await this.searchKnowledgeBase(
      `technical ${issueType}`,
      context.userProfile.plan
    );

    if (solutions.length > 0 && solutions[0].confidence > 0.8) {
      // High confidence solution found
      return `I found a solution for your ${issueType} issue:\n\n${solutions[0].content}\n\nWould you like me to walk you through the steps, or do you need additional help?`;
    } else if (severity === 'high' || classification.requiresEscalation) {
      // Escalate to human support
      await this.escalateToHuman(context, 'technical_support', classification);
      return `This looks like a complex technical issue that requires specialized attention. I've created a priority support ticket and our technical team will contact you within 30 minutes. Your ticket number is #${this.generateTicketNumber()}.`;
    } else {
      // Provide general guidance and collect more info
      return `I'd like to help you resolve this technical issue. Could you provide more details about:\n\n• What were you trying to do when this occurred?\n• What error message (if any) did you see?\n• Which browser/device are you using?\n\nThis will help me find the best solution for you.`;
    }
  }

  private async handleBillingInquiry(
    classification: IntentClassification,
    context: ConversationContext
  ): Promise<string> {
    const billingType = this.extractBillingType(classification.entities);
    
    switch (billingType) {
      case 'pricing':
        return this.generatePricingResponse(context);
      
      case 'invoice':
        return `I can help you with your invoice questions. You're currently on the ${context.userProfile.plan} plan. Would you like me to:\n\n• Show your current billing details\n• Explain recent charges\n• Send you a copy of your latest invoice\n• Connect you with our billing team`;
      
      case 'upgrade':
        return await this.handlePlanUpgrade(context);
      
      case 'cancellation':
        return `I understand you're considering changes to your account. Before we proceed, I'd like to understand what's prompting this decision - perhaps I can help address any concerns. What's the main reason you're looking to make changes?`;
      
      default:
        return `I'm here to help with your billing question. You're currently on the ${context.userProfile.plan} plan. Could you tell me more specifically what you'd like to know about your account or billing?`;
    }
  }

  private async handleIntegrationSupport(
    classification: IntentClassification,
    context: ConversationContext
  ): Promise<string> {
    const platform = this.extractPlatform(classification.entities);
    
    if (platform) {
      const integrationGuide = await this.getIntegrationGuide(platform);
      return `I'll help you connect your ${platform} store. Here's what we need to do:\n\n${integrationGuide}\n\nWould you like me to guide you through this step-by-step, or do you have specific questions about the integration?`;
    } else {
      return `I can help you connect your store to OrderNimbus. We support:\n\n• Shopify & Shopify Plus\n• Amazon Seller Central\n• BigCommerce\n• WooCommerce\n• CSV file imports\n• Custom API integrations\n\nWhich platform would you like to connect?`;
    }
  }

  private async handleFeatureQuestion(
    classification: IntentClassification,
    context: ConversationContext
  ): Promise<string> {
    const feature = this.extractFeature(classification.entities);
    const featureInfo = await this.getFeatureInformation(feature, context.userProfile.plan);
    
    if (featureInfo) {
      return `Here's what you need to know about ${feature}:\n\n${featureInfo.description}\n\n**How to use it:**\n${featureInfo.usage}\n\n**Available on your ${context.userProfile.plan} plan:** ${featureInfo.available ? '✅ Yes' : '❌ No'}\n\nWould you like me to show you how to get started with this feature?`;
    } else {
      return `I'd be happy to explain our features! Could you be more specific about which aspect of OrderNimbus you'd like to learn about? For example:\n\n• AI Forecasting\n• Inventory Management\n• Sales Analytics\n• Store Integrations\n• Reporting Tools`;
    }
  }

  private personalizeResponse(response: string, context: ConversationContext): string {
    // Add user's name if appropriate
    const userName = context.userProfile.name.split(' ')[0];
    
    // Adjust tone based on preferences
    if (context.preferences.communicationStyle === 'formal') {
      response = this.makeFormal(response);
    } else if (context.preferences.communicationStyle === 'casual') {
      response = this.makeCasual(response, userName);
    }
    
    // Add contextual information
    if (context.userProfile.storesConnected === 0) {
      response += '\n\n💡 **Quick tip:** Connect your first store to start seeing the full power of OrderNimbus!';
    }
    
    return response;
  }

  private generateQuickActions(
    classification: IntentClassification,
    context: ConversationContext
  ): string[] {
    const actions: string[] = [];
    
    switch (classification.intent) {
      case 'technical_support':
        actions.push('View Help Documentation', 'Schedule Screen Share', 'Contact Support Team');
        break;
      case 'billing_inquiry':
        actions.push('View Billing Details', 'Download Invoice', 'Upgrade Plan');
        break;
      case 'integration_support':
        actions.push('Connect Store', 'View Integration Guide', 'Test Connection');
        break;
      case 'onboarding_help':
        actions.push('Continue Setup', 'Watch Tutorial', 'Skip to Dashboard');
        break;
    }
    
    return actions;
  }

  private async initiateWorkflow(
    workflowType: string,
    context: ConversationContext
  ): Promise<{ content: string; stepId: string }> {
    const workflow = this.workflows.find(w => w.category === workflowType);
    if (!workflow) {
      return { content: 'Workflow not found', stepId: '' };
    }

    const firstStep = workflow.steps[0];
    context.currentWorkflow = workflow.id;
    
    return {
      content: `${workflow.description}\n\n**Step 1:** ${firstStep.name}\n${firstStep.content}`,
      stepId: firstStep.id
    };
  }

  private async continueWorkflow(
    classification: IntentClassification,
    context: ConversationContext
  ): Promise<{ content: string; stepId: string }> {
    const workflow = this.workflows.find(w => w.id === context.currentWorkflow);
    if (!workflow) {
      return { content: 'Workflow not found', stepId: '' };
    }

    // Logic to determine next step based on user input
    const currentStep = workflow.steps.find(s => s.id === classification.workflowStep);
    const nextStepId = this.determineNextStep(currentStep, classification);
    const nextStep = workflow.steps.find(s => s.id === nextStepId);

    if (!nextStep) {
      // Workflow completed
      context.currentWorkflow = undefined;
      return {
        content: '🎉 Great! You\'ve completed the workflow. Is there anything else I can help you with?',
        stepId: ''
      };
    }

    return {
      content: `**${nextStep.name}**\n${nextStep.content}`,
      stepId: nextStep.id
    };
  }

  private async escalateToHuman(
    context: ConversationContext,
    reason: string,
    classification: IntentClassification
  ): Promise<void> {
    const ticket = {
      ticketNumber: this.generateTicketNumber(),
      userId: context.userId,
      priority: this.determinePriority(classification, context),
      category: reason,
      description: `Auto-escalated from chatbot conversation`,
      conversationHistory: context.conversationHistory,
      userProfile: context.userProfile,
      createdAt: new Date()
    };

    // In a real implementation, this would integrate with your ticketing system
    logger.info('Escalating to human support:', ticket);
    
    // Update context to mark escalation
    context.activeTickets.push(ticket);
  }

  private async loadKnowledgeBase(): Promise<void> {
    // In a real implementation, this would load from a database or external service
    this.knowledgeBase = [
      {
        id: 'kb_shopify_connection',
        title: 'How to Connect Shopify Store',
        content: '1. Go to Connectors page\n2. Click "Connect Shopify"\n3. Enter your store URL\n4. Authorize the connection\n5. Your data will sync automatically',
        category: 'integrations',
        tags: ['shopify', 'connection', 'setup'],
        searchableText: 'shopify connect store integration setup authorization',
        confidence: 0.95,
        lastUpdated: new Date(),
        usage: 150,
        rating: 4.8
      },
      {
        id: 'kb_pricing_plans',
        title: 'OrderNimbus Pricing Plans Comparison',
        content: 'Starter ($29/month): 1K orders, 1 store, basic forecasting\nProfessional ($79/month): 10K orders, 5 stores, advanced AI\nEnterprise ($199/month): Unlimited orders, unlimited stores, custom features',
        category: 'billing',
        tags: ['pricing', 'plans', 'features'],
        searchableText: 'pricing plans cost billing features comparison starter professional enterprise',
        confidence: 0.98,
        lastUpdated: new Date(),
        usage: 200,
        rating: 4.9
      },
      // More knowledge base entries...
    ];
  }

  private async loadWorkflows(): Promise<void> {
    this.workflows = [
      {
        id: 'onboarding_flow',
        name: 'New User Onboarding',
        description: 'Let me help you get started with OrderNimbus!',
        category: 'onboarding',
        triggers: ['onboarding', 'getting started', 'setup'],
        steps: [
          {
            id: 'step_1',
            name: 'Welcome & Goals',
            description: 'Understand user goals',
            type: 'question',
            content: 'Welcome to OrderNimbus! What\'s your main goal with our platform?\n\nA) Improve inventory forecasting\nB) Connect multiple sales channels\nC) Better understand sales trends\nD) All of the above',
            nextSteps: { 'A': 'step_2a', 'B': 'step_2b', 'C': 'step_2c', 'D': 'step_2d' },
            requiresInput: true
          },
          // More workflow steps...
        ]
      }
    ];
  }

  private async searchKnowledgeBase(
    query: string,
    userPlan: string
  ): Promise<KnowledgeBaseEntry[]> {
    const searchTerms = query.toLowerCase().split(' ');
    const results = this.knowledgeBase
      .map(entry => ({
        ...entry,
        relevanceScore: this.calculateRelevance(entry, searchTerms, userPlan)
      }))
      .filter(entry => entry.relevanceScore > 0.3)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);

    return results;
  }

  private calculateRelevance(
    entry: KnowledgeBaseEntry,
    searchTerms: string[],
    userPlan: string
  ): number {
    let score = 0;
    const searchableText = entry.searchableText.toLowerCase();
    
    searchTerms.forEach(term => {
      if (searchableText.includes(term)) {
        score += 0.3;
      }
      if (entry.tags.some(tag => tag.toLowerCase().includes(term))) {
        score += 0.2;
      }
    });
    
    // Boost score based on usage and rating
    score += (entry.usage / 1000) * 0.1;
    score += (entry.rating / 5) * 0.1;
    
    return Math.min(score, 1.0);
  }

  // Additional helper methods...
  private generateTicketNumber(): string {
    return `TK${Date.now().toString().slice(-6)}`;
  }

  private extractIssueType(entities: ExtractedEntity[]): string {
    const issueEntity = entities.find(e => e.type === 'issue_type');
    return issueEntity?.value || 'general';
  }

  private assessSeverity(
    classification: IntentClassification,
    context: ConversationContext
  ): 'low' | 'medium' | 'high' {
    if (classification.confidence < 0.5) return 'high'; // Uncertain cases need human attention
    if (context.userProfile.plan === 'enterprise') return 'high'; // Enterprise gets priority
    if (classification.entities.some(e => e.value.includes('urgent') || e.value.includes('critical'))) return 'high';
    return 'medium';
  }

  // More helper methods would be implemented here...

  private generateErrorResponse(context: ConversationContext): ConversationMessage {
    return {
      id: `error_${Date.now()}`,
      content: 'I apologize, but I\'m having trouble processing your request right now. Let me connect you with our support team who can assist you directly.',
      sender: 'bot',
      timestamp: new Date(),
      intent: 'error',
      entities: [],
      confidence: 1.0,
      context: {}
    };
  }

  private async logConversation(
    context: ConversationContext,
    userMessage: string,
    botResponse: ConversationMessage,
    classification: IntentClassification
  ): Promise<void> {
    // Implementation for logging conversations for training and analytics
  }

  // Additional helper methods implementation
  private async handleGeneralInquiry(classification: IntentClassification, context: ConversationContext): Promise<string> {
    return "I'd be happy to help! Could you provide more details about what you're looking for?";
  }

  private extractBillingType(entities: ExtractedEntity[]): string {
    const billingEntity = entities.find(e => e.type === 'billing_type');
    return billingEntity?.value || 'general';
  }

  private generatePricingResponse(context: ConversationContext): string {
    return `Our plans are designed for different business needs:\n\n• Starter: $29/month\n• Professional: $79/month\n• Enterprise: $199/month\n\nYou're currently on the ${context.userProfile.plan} plan.`;
  }

  private async handlePlanUpgrade(context: ConversationContext): Promise<string> {
    const currentPlan = context.userProfile.plan;
    const suggestions = {
      'starter': 'Professional plan ($79/month) would give you advanced forecasting and 5 store connections.',
      'professional': 'Enterprise plan ($199/month) offers unlimited stores and custom features.',
      'enterprise': 'You\'re already on our top-tier plan! Need additional features?'
    };
    return suggestions[currentPlan as keyof typeof suggestions] || 'Let me help you find the right plan upgrade.';
  }

  private extractPlatform(entities: ExtractedEntity[]): string | undefined {
    const platformEntity = entities.find(e => e.type === 'platform');
    return platformEntity?.value;
  }

  private async getIntegrationGuide(platform: string): Promise<string> {
    const guides = {
      'shopify': '1. Go to Connectors page\n2. Click "Connect Shopify"\n3. Enter store URL\n4. Authorize connection',
      'amazon': '1. Access Seller Central\n2. Generate MWS credentials\n3. Enter details in OrderNimbus\n4. Test connection'
    };
    return guides[platform as keyof typeof guides] || 'Standard integration process available.';
  }

  private extractFeature(entities: ExtractedEntity[]): string {
    const featureEntity = entities.find(e => e.type === 'feature');
    return featureEntity?.value || 'general';
  }

  private async getFeatureInformation(feature: string, plan: string): Promise<any> {
    const features = {
      'forecasting': {
        description: 'AI-powered demand forecasting using machine learning',
        usage: 'Access via Dashboard → Forecasting tab',
        available: true
      },
      'analytics': {
        description: 'Comprehensive business analytics and reporting',
        usage: 'Available in Reports section',
        available: plan !== 'starter'
      }
    };
    return features[feature as keyof typeof features];
  }

  private makeFormal(response: string): string {
    return response.replace(/Hey|Hi/g, 'Hello').replace(/!/g, '.');
  }

  private makeCasual(response: string, userName: string): string {
    return response.replace(/Hello/g, `Hey ${userName}`);
  }

  private determineNextStep(currentStep: any, classification: IntentClassification): string {
    return currentStep?.next_steps?.default || 'complete';
  }

  private determinePriority(classification: IntentClassification, context: ConversationContext): string {
    if (context.userProfile.plan === 'enterprise') return 'high';
    if (classification.requiresEscalation) return 'high';
    return 'medium';
  }

  private updateContext(context: ConversationContext, message: string, classification: IntentClassification): void {
    // Implementation for updating conversation context
    context.conversationHistory.push({
      id: `ctx_${Date.now()}`,
      content: message,
      sender: 'user',
      timestamp: new Date(),
      intent: classification.intent,
      entities: classification.entities,
      confidence: classification.confidence,
      context: {}
    });
  }

  private getContextualIntent(message: string, context: ConversationContext): IntentClassification {
    // Implementation for contextual intent detection
    return { intent: 'general', confidence: 0.5, entities: [], requiresEscalation: false, suggestedActions: [] };
  }

  private detectWorkflowIntent(message: string): IntentClassification {
    // Implementation for workflow-specific intent detection
    return { intent: 'general', confidence: 0.5, entities: [], requiresEscalation: false, suggestedActions: [] };
  }

  private combineClassifications(classifications: IntentClassification[]): IntentClassification {
    // Implementation for combining multiple classification results
    return classifications[0] || { intent: 'general', confidence: 0.5, entities: [], requiresEscalation: false, suggestedActions: [] };
  }

  public async reloadKnowledgeBase(): Promise<void> {
    // Reload knowledge base from file or database
    await this.loadKnowledgeBase();
  }
}

// Supporting classes
class IntentClassifier {
  async classify(message: string, context: any): Promise<IntentClassification> {
    // Advanced intent classification logic
    return { intent: 'general', confidence: 0.5, entities: [], requiresEscalation: false, suggestedActions: [] };
  }
}

class NLPProcessor {
  async analyze(message: string): Promise<IntentClassification> {
    // NLP analysis using libraries like natural, compromise, or external APIs
    return { intent: 'general', confidence: 0.5, entities: [], requiresEscalation: false, suggestedActions: [] };
  }
}