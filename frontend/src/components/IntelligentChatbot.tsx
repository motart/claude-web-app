import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Fab,
  Collapse,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  useTheme,
  alpha,
  CircularProgress,
  Tooltip,
  ButtonGroup,
  Card,
  CardContent,
  Divider,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Psychology as PsychologyIcon,
  Support as SupportIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface ConversationMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  intent?: string;
  entities?: any[];
  confidence?: number;
  feedback?: 'helpful' | 'not_helpful';
  quickActions?: QuickAction[];
  workflowStep?: string;
  escalated?: boolean;
  typing?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  action: string;
  data?: any;
  icon?: React.ReactNode;
}

interface ConversationContext {
  userId: string;
  sessionId: string;
  conversationId: string;
  currentWorkflow?: string;
  workflowStep?: string;
  userProfile: any;
  preferences: any;
  conversationHistory: ConversationMessage[];
}

interface KnowledgeBase {
  knowledgeBase: any[];
  commonIntents: any[];
  workflows: any[];
  quickResponses: any;
}

export const IntelligentChatbot: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState<ConversationContext | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [unreadCount, setUnreadCount] = useState(0);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [isLoadingKB, setIsLoadingKB] = useState(false);
  const [escalationDialog, setEscalationDialog] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<any>(null);
  const [workflowProgress, setWorkflowProgress] = useState(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !conversationContext) {
      initializeConversation();
    }
  }, [isOpen]);

  useEffect(() => {
    loadKnowledgeBase();
  }, []);

  const loadKnowledgeBase = async () => {
    setIsLoadingKB(true);
    try {
      // In a real implementation, this would fetch from your API
      const response = await fetch('/api/chatbot/knowledge-base');
      if (response.ok) {
        const kb = await response.json();
        setKnowledgeBase(kb);
      } else {
        // Fallback to mock data
        setKnowledgeBase(mockKnowledgeBase);
      }
    } catch (error) {
      console.error('Failed to load knowledge base:', error);
      setKnowledgeBase(mockKnowledgeBase);
    } finally {
      setIsLoadingKB(false);
    }
  };

  const initializeConversation = async () => {
    const newConversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const context: ConversationContext = {
      userId: user?.id || 'anonymous',
      sessionId,
      conversationId: newConversationId,
      userProfile: {
        name: user?.name || 'there',
        role: user?.role || 'user',
        plan: user?.plan || 'starter',
        onboardingCompleted: user?.onboardingCompleted || false,
        storesConnected: user?.connectedStores?.length || 0
      },
      preferences: {
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        communicationStyle: 'casual'
      },
      conversationHistory: []
    };
    
    setConversationContext(context);
    
    const welcomeMessage = await generateWelcomeMessage(context);
    setMessages([welcomeMessage]);
    
    await logConversationEvent('conversation_started', context);
  };

  const generateWelcomeMessage = async (context: ConversationContext): Promise<ConversationMessage> => {
    const userName = context.userProfile.name.split(' ')[0];
    let welcomeContent = `Hi ${userName}! 👋 I'm your intelligent OrderNimbus assistant.`;
    
    // Personalize based on user status
    if (!context.userProfile.onboardingCompleted) {
      welcomeContent += ` I see you're new here. Would you like me to help you get started?`;
    } else if (context.userProfile.storesConnected === 0) {
      welcomeContent += ` I notice you haven't connected any stores yet. Shall we set up your first integration?`;
    } else {
      welcomeContent += ` How can I help you today?`;
    }
    
    const quickActions: QuickAction[] = [
      { id: 'getting_started', label: '🚀 Getting Started', action: 'start_onboarding' },
      { id: 'connect_store', label: '🔗 Connect Store', action: 'start_integration' },
      { id: 'ask_question', label: '❓ Ask Question', action: 'general_help' },
      { id: 'contact_support', label: '👨‍💼 Contact Support', action: 'escalate_human' }
    ];
    
    return {
      id: `msg_${Date.now()}`,
      content: welcomeContent,
      sender: 'bot',
      timestamp: new Date(),
      intent: 'greeting',
      confidence: 1.0,
      quickActions
    };
  };

  const processMessage = async (userMessage: string): Promise<ConversationMessage> => {
    if (!conversationContext || !knowledgeBase) {
      return generateErrorMessage();
    }

    setIsTyping(true);

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Advanced intent classification
      const classification = await classifyIntent(userMessage, conversationContext);
      
      // Generate intelligent response
      const response = await generateIntelligentResponse(classification, conversationContext);
      
      // Update context
      updateConversationContext(userMessage, response, classification);
      
      return response;
    } catch (error) {
      console.error('Error processing message:', error);
      return generateErrorMessage();
    } finally {
      setIsTyping(false);
    }
  };

  const classifyIntent = async (message: string, context: ConversationContext) => {
    const lowerMessage = message.toLowerCase();
    
    // Check for workflow continuation
    if (context.currentWorkflow) {
      return {
        intent: 'workflow_continuation',
        confidence: 0.9,
        entities: [],
        workflowStep: context.workflowStep,
        userInput: message
      };
    }
    
    // Multi-layer intent classification
    const intents = knowledgeBase!.commonIntents;
    let bestMatch = { intent: 'general_inquiry', confidence: 0.3, entities: [] };
    
    for (const intentDef of intents) {
      let confidence = 0;
      let matchedKeywords = 0;
      
      for (const keyword of intentDef.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          confidence += 0.1;
          matchedKeywords++;
        }
      }
      
      // Boost confidence based on keyword density
      if (matchedKeywords > 0) {
        confidence = Math.min(confidence + (matchedKeywords / intentDef.keywords.length) * 0.5, 1.0);
      }
      
      // Check for escalation triggers
      const requiresEscalation = intentDef.escalation_triggers?.some((trigger: string) => 
        lowerMessage.includes(trigger.toLowerCase())
      );
      
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          intent: intentDef.intent,
          confidence,
          entities: extractEntities(message, intentDef.intent),
          requiresEscalation
        };
      }
    }
    
    return bestMatch;
  };

  const generateIntelligentResponse = async (classification: any, context: ConversationContext): Promise<ConversationMessage> => {
    const responseId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let content = '';
    let quickActions: QuickAction[] = [];
    let workflowStep = null;

    switch (classification.intent) {
      case 'pricing_inquiry':
        content = await handlePricingInquiry(classification, context);
        quickActions = [
          { id: 'view_plans', label: '📋 View All Plans', action: 'show_pricing' },
          { id: 'upgrade', label: '⬆️ Upgrade Now', action: 'upgrade_plan' },
          { id: 'contact_sales', label: '💬 Contact Sales', action: 'escalate_sales' }
        ];
        break;
        
      case 'technical_support':
        const supportResponse = await handleTechnicalSupport(classification, context);
        content = supportResponse.content;
        if (supportResponse.escalate) {
          quickActions = [
            { id: 'escalate', label: '🆘 Get Human Help', action: 'escalate_technical' },
            { id: 'try_again', label: '🔄 Try Again', action: 'retry_solution' }
          ];
        } else {
          quickActions = [
            { id: 'helpful', label: '👍 This Helped', action: 'mark_helpful' },
            { id: 'need_more', label: '❓ Need More Help', action: 'escalate_technical' }
          ];
        }
        break;
        
      case 'integration_support':
        content = await handleIntegrationSupport(classification, context);
        quickActions = [
          { id: 'start_integration', label: '🔗 Start Setup', action: 'start_integration_flow' },
          { id: 'view_guide', label: '📖 View Guide', action: 'show_integration_guide' },
          { id: 'test_connection', label: '🧪 Test Connection', action: 'test_integration' }
        ];
        break;
        
      case 'onboarding_help':
        const onboardingResponse = await startOnboardingWorkflow(context);
        content = onboardingResponse.content;
        workflowStep = onboardingResponse.stepId;
        setCurrentWorkflow(onboardingResponse.workflow);
        break;
        
      case 'workflow_continuation':
        const workflowResponse = await continueWorkflow(classification, context);
        content = workflowResponse.content;
        workflowStep = workflowResponse.stepId;
        if (workflowResponse.completed) {
          setCurrentWorkflow(null);
          setWorkflowProgress(100);
        }
        break;
        
      default:
        content = await searchKnowledgeBase(classification.userInput || '', context);
        quickActions = [
          { id: 'search_more', label: '🔍 Search More', action: 'search_knowledge' },
          { id: 'contact_human', label: '👨‍💼 Talk to Human', action: 'escalate_human' }
        ];
    }

    // Add personalization
    content = personalizeResponse(content, context);

    return {
      id: responseId,
      content,
      sender: 'bot',
      timestamp: new Date(),
      intent: classification.intent,
      entities: classification.entities,
      confidence: classification.confidence,
      quickActions,
      workflowStep
    };
  };

  const handlePricingInquiry = async (classification: any, context: ConversationContext): Promise<string> => {
    const pricingKB = knowledgeBase!.knowledgeBase.find(kb => kb.id === 'kb_pricing_plans');
    if (pricingKB) {
      let response = pricingKB.content;
      
      // Add current plan context
      response += `\n\n💡 **Your Current Plan:** ${context.userProfile.plan.charAt(0).toUpperCase() + context.userProfile.plan.slice(1)}`;
      
      if (context.userProfile.plan !== 'enterprise') {
        response += `\n\nWould you like to see how upgrading could benefit your business?`;
      }
      
      return response;
    }
    
    return "I'd be happy to help with pricing information! Let me get that for you...";
  };

  const handleTechnicalSupport = async (classification: any, context: ConversationContext): Promise<{ content: string; escalate: boolean }> => {
    // Search knowledge base for solutions
    const solutions = await searchKnowledgeBaseForSolutions(classification, context);
    
    if (solutions.length > 0 && solutions[0].confidence > 0.8) {
      return {
        content: `I found a solution that might help:\n\n${solutions[0].content}\n\nDoes this resolve your issue?`,
        escalate: false
      };
    } else if (classification.requiresEscalation || context.userProfile.plan === 'enterprise') {
      return {
        content: `This looks like a complex issue that needs specialized attention. I'm connecting you with our technical team who can provide hands-on assistance.\n\n**Priority Level:** ${context.userProfile.plan === 'enterprise' ? 'High' : 'Standard'}\n**Expected Response:** ${context.userProfile.plan === 'enterprise' ? '15 minutes' : '2 hours'}`,
        escalate: true
      };
    } else {
      return {
        content: `I'd like to help resolve this technical issue. To provide the best solution, could you tell me:\n\n• What specifically were you trying to do?\n• What error message did you see?\n• Which page or feature was involved?\n\nThis will help me find the most relevant solution for you.`,
        escalate: false
      };
    }
  };

  const handleIntegrationSupport = async (classification: any, context: ConversationContext): Promise<string> => {
    const platform = extractPlatform(classification.entities);
    
    if (platform) {
      const integrationKB = knowledgeBase!.knowledgeBase.find(kb => 
        kb.category === 'integrations' && kb.title.toLowerCase().includes(platform.toLowerCase())
      );
      
      if (integrationKB) {
        return `Great! I'll help you connect your ${platform} store. Here's the step-by-step process:\n\n${integrationKB.content}\n\nWould you like me to guide you through each step, or do you have specific questions?`;
      }
    }
    
    return `I can help you connect your store to OrderNimbus. We support many platforms including:\n\n• Shopify & Shopify Plus\n• Amazon Seller Central\n• BigCommerce\n• WooCommerce\n• CSV file imports\n• Custom API integrations\n\nWhich platform would you like to connect?`;
  };

  const startOnboardingWorkflow = async (context: ConversationContext) => {
    const workflow = knowledgeBase!.workflows.find(w => w.id === 'onboarding_flow');
    if (!workflow) {
      return { content: 'Onboarding workflow not available', stepId: null, workflow: null };
    }
    
    const firstStep = workflow.steps[0];
    setWorkflowProgress(10);
    
    return {
      content: `${workflow.description}\n\n**${firstStep.name}**\n\n${firstStep.content}`,
      stepId: firstStep.id,
      workflow
    };
  };

  const continueWorkflow = async (classification: any, context: ConversationContext) => {
    if (!currentWorkflow) {
      return { content: 'No active workflow found', stepId: null, completed: true };
    }
    
    const currentStep = currentWorkflow.steps.find((s: any) => s.id === context.workflowStep);
    if (!currentStep) {
      return { content: 'Workflow step not found', stepId: null, completed: true };
    }
    
    // Process user input and determine next step
    const nextStepId = determineNextWorkflowStep(currentStep, classification.userInput);
    const nextStep = currentWorkflow.steps.find((s: any) => s.id === nextStepId);
    
    if (!nextStep) {
      return {
        content: '🎉 Excellent! You\'ve completed the onboarding workflow. You\'re all set up and ready to start using OrderNimbus effectively!\n\nIs there anything specific you\'d like to explore first?',
        stepId: null,
        completed: true
      };
    }
    
    // Update progress
    const stepIndex = currentWorkflow.steps.findIndex((s: any) => s.id === nextStepId);
    const progress = ((stepIndex + 1) / currentWorkflow.steps.length) * 100;
    setWorkflowProgress(progress);
    
    return {
      content: `**${nextStep.name}**\n\n${nextStep.content}`,
      stepId: nextStep.id,
      completed: false
    };
  };

  const searchKnowledgeBase = async (query: string, context: ConversationContext): Promise<string> => {
    if (!knowledgeBase) return "I'm still learning. Let me connect you with our support team.";
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    let bestMatch = null;
    let bestScore = 0;
    
    for (const kb of knowledgeBase.knowledgeBase) {
      let score = 0;
      const searchableText = `${kb.title} ${kb.content} ${kb.searchTerms}`.toLowerCase();
      
      for (const term of searchTerms) {
        if (searchableText.includes(term)) {
          score += 1;
        }
      }
      
      // Boost score for exact matches in title
      if (kb.title.toLowerCase().includes(query.toLowerCase())) {
        score += 3;
      }
      
      // Normalize score
      score = score / searchTerms.length;
      
      if (score > bestScore && score > 0.3) {
        bestScore = score;
        bestMatch = kb;
      }
    }
    
    if (bestMatch) {
      return `Here's what I found:\n\n**${bestMatch.title}**\n\n${bestMatch.content}\n\nDoes this answer your question?`;
    } else {
      return "I couldn't find a specific answer to your question in my knowledge base. Let me connect you with a human expert who can provide personalized assistance.";
    }
  };

  const personalizeResponse = (response: string, context: ConversationContext): string => {
    const userName = context.userProfile.name.split(' ')[0];
    
    // Add contextual tips based on user profile
    if (context.userProfile.storesConnected === 0 && !response.includes('connect')) {
      response += '\n\n💡 **Pro tip**: Once you connect your first store, you\'ll unlock powerful forecasting features!';
    }
    
    return response;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ConversationMessage = {
      id: `msg_${Date.now()}`,
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');

    // Add typing indicator
    const typingMessage: ConversationMessage = {
      id: `typing_${Date.now()}`,
      content: '',
      sender: 'bot',
      timestamp: new Date(),
      typing: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const botResponse = await processMessage(currentInput);
      
      // Remove typing indicator and add actual response
      setMessages(prev => prev.filter(msg => !msg.typing).concat(botResponse));
      
      // Update unread count if chat is not focused
      if (!document.hasFocus()) {
        setUnreadCount(prev => prev + 1);
      }
      
      await logConversationEvent('message_exchange', { userMessage, botResponse });
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => prev.filter(msg => !msg.typing).concat(generateErrorMessage()));
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    switch (action.action) {
      case 'start_onboarding':
        const onboardingMsg = await generateWelcomeMessage(conversationContext!);
        onboardingMsg.content = "Perfect! Let's get you set up with OrderNimbus. I'll guide you through everything step by step.";
        setMessages(prev => [...prev, onboardingMsg]);
        break;
        
      case 'escalate_human':
        setEscalationDialog(true);
        break;
        
      case 'show_pricing':
        handleSendMessage(); // This will trigger the pricing flow
        break;
        
      default:
        console.log('Quick action:', action);
    }
  };

  const handleEscalation = async (reason: string) => {
    const escalationMessage: ConversationMessage = {
      id: `escalation_${Date.now()}`,
      content: `I've created a support ticket for you. Our team will respond within ${conversationContext?.userProfile.plan === 'enterprise' ? '15 minutes' : '2 hours'}.\n\n**Ticket #**: ${generateTicketNumber()}\n**Priority**: ${conversationContext?.userProfile.plan === 'enterprise' ? 'High' : 'Standard'}\n\nIs there anything else I can help you with while you wait?`,
      sender: 'bot',
      timestamp: new Date(),
      escalated: true
    };
    
    setMessages(prev => [...prev, escalationMessage]);
    setEscalationDialog(false);
    
    await logConversationEvent('escalated_to_human', { reason, ticket: generateTicketNumber() });
  };

  const generateErrorMessage = (): ConversationMessage => ({
    id: `error_${Date.now()}`,
    content: "I apologize, but I'm having trouble processing your request right now. Let me connect you with our support team who can assist you directly.",
    sender: 'bot',
    timestamp: new Date(),
    intent: 'error',
    confidence: 1.0,
    quickActions: [
      { id: 'contact_support', label: '🆘 Contact Support', action: 'escalate_human' },
      { id: 'try_again', label: '🔄 Try Again', action: 'retry' }
    ]
  });

  const logConversationEvent = async (event: string, data?: any) => {
    // In production, this would send to your analytics/logging service
    console.log('Chatbot Event:', { event, data, timestamp: new Date() });
  };

  // Helper functions
  const extractEntities = (message: string, intent: string) => {
    // Simple entity extraction - in production, use NLP libraries
    const entities = [];
    if (intent === 'integration_support') {
      const platforms = ['shopify', 'amazon', 'bigcommerce', 'woocommerce'];
      const found = platforms.find(p => message.toLowerCase().includes(p));
      if (found) {
        entities.push({ type: 'platform', value: found, confidence: 0.9 });
      }
    }
    return entities;
  };

  const extractPlatform = (entities: any[]) => {
    const platformEntity = entities?.find(e => e.type === 'platform');
    return platformEntity?.value;
  };

  const searchKnowledgeBaseForSolutions = async (classification: any, context: ConversationContext) => {
    // Mock implementation - in production, this would use vector search or similar
    return knowledgeBase?.knowledgeBase.filter(kb => 
      kb.category === 'technical_support' && 
      kb.searchTerms.includes(classification.intent)
    ).slice(0, 3) || [];
  };

  const determineNextWorkflowStep = (currentStep: any, userInput: string) => {
    if (currentStep.type === 'choice') {
      const choice = userInput.toUpperCase();
      return currentStep.next_steps[choice] || currentStep.next_steps.default;
    }
    return currentStep.next_steps?.default;
  };

  const updateConversationContext = (userMessage: string, botResponse: ConversationMessage, classification: any) => {
    if (conversationContext) {
      conversationContext.conversationHistory.push(
        { 
          id: `user_${Date.now()}`, 
          content: userMessage, 
          sender: 'user', 
          timestamp: new Date(),
          intent: classification.intent,
          entities: classification.entities,
          confidence: classification.confidence
        },
        botResponse
      );
      
      if (botResponse.workflowStep) {
        conversationContext.workflowStep = botResponse.workflowStep;
      }
    }
  };

  const generateTicketNumber = () => `TK${Date.now().toString().slice(-6)}`;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  return (
    <>
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
          boxShadow: theme.shadows[8],
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
        onClick={toggleChat}
      >
        <Badge badgeContent={unreadCount} color="error" max={9}>
          {isOpen ? <CloseIcon /> : <ChatIcon />}
        </Badge>
      </Fab>

      <Collapse in={isOpen}>
        <Paper
          elevation={24}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            width: 420,
            height: 600,
            zIndex: 1299,
            borderRadius: 4,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Enhanced Header */}
          <Box
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 36, height: 36 }}>
                <PsychologyIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  Intelligent Assistant
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: 12 }} />
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    {isTyping ? 'Thinking...' : 'Online • AI-Powered'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title="Knowledge Base Status">
                <IconButton size="small" sx={{ color: 'white' }}>
                  {isLoadingKB ? <CircularProgress size={16} color="inherit" /> : 
                   <SchoolIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
              <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Workflow Progress */}
          {currentWorkflow && workflowProgress > 0 && (
            <Box sx={{ px: 2, py: 1, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                  {currentWorkflow.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.round(workflowProgress)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={workflowProgress} 
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          )}

          {/* Messages Area */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto', 
            p: 1,
            bgcolor: alpha(theme.palette.background.default, 0.3)
          }}>
            <List dense>
              {messages.map((message) => (
                <ListItem
                  key={message.id}
                  sx={{
                    display: 'flex',
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: 1,
                    mb: 1.5,
                    px: 1
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 'auto' }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32,
                        bgcolor: message.sender === 'user' 
                          ? theme.palette.primary.main 
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: theme.shadows[2]
                      }}
                    >
                      {message.sender === 'user' ? <PersonIcon fontSize="small" /> : <PsychologyIcon fontSize="small" />}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <Box sx={{ 
                    maxWidth: '80%',
                    textAlign: message.sender === 'user' ? 'right' : 'left'
                  }}>
                    {message.typing ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
                        <CircularProgress size={16} />
                        <Typography variant="body2" color="text.secondary">
                          Analyzing your request...
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <Paper
                          elevation={message.escalated ? 4 : 1}
                          sx={{
                            p: 2,
                            bgcolor: message.sender === 'user' 
                              ? theme.palette.primary.main 
                              : message.escalated 
                                ? alpha(theme.palette.warning.main, 0.1)
                                : theme.palette.background.paper,
                            color: message.sender === 'user' ? 'white' : 'text.primary',
                            borderRadius: 3,
                            borderTopLeftRadius: message.sender === 'bot' ? 1 : 3,
                            borderTopRightRadius: message.sender === 'user' ? 1 : 3,
                            border: message.escalated ? `2px solid ${theme.palette.warning.main}` : 'none'
                          }}
                        >
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {message.content}
                          </Typography>
                          
                          {message.sender === 'bot' && message.intent && (
                            <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Chip 
                                label={message.intent.replace('_', ' ')} 
                                size="small" 
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 22 }}
                              />
                              {message.confidence && (
                                <Chip
                                  label={`${Math.round(message.confidence * 100)}% confident`}
                                  size="small"
                                  color={message.confidence > 0.8 ? 'success' : message.confidence > 0.6 ? 'warning' : 'error'}
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: 22 }}
                                />
                              )}
                              {message.escalated && (
                                <Chip
                                  icon={<SupportIcon fontSize="small" />}
                                  label="Escalated"
                                  size="small"
                                  color="warning"
                                  sx={{ fontSize: '0.7rem', height: 22 }}
                                />
                              )}
                            </Box>
                          )}
                        </Paper>
                        
                        {/* Quick Actions */}
                        {message.quickActions && message.quickActions.length > 0 && (
                          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {message.quickActions.map((action) => (
                              <Button
                                key={action.id}
                                size="small"
                                variant="outlined"
                                onClick={() => handleQuickAction(action)}
                                sx={{ 
                                  fontSize: '0.75rem',
                                  py: 0.5,
                                  px: 1,
                                  minWidth: 'auto',
                                  borderRadius: 2
                                }}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </Box>
                        )}
                        
                        <Typography variant="caption" color="text.secondary" sx={{ 
                          mt: 0.5, 
                          display: 'block',
                          textAlign: message.sender === 'user' ? 'right' : 'left'
                        }}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </>
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
            <div ref={messagesEndRef} />
          </Box>

          {/* Enhanced Input Area */}
          <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Ask me anything about OrderNimbus..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                multiline
                maxRows={3}
                disabled={isTyping}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
              />
              <IconButton 
                color="primary" 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                  },
                  '&:disabled': {
                    bgcolor: theme.palette.action.disabledBackground,
                  }
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
            
            {/* Status Indicators */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {knowledgeBase ? `Powered by ${knowledgeBase.knowledgeBase.length} knowledge articles` : 'Loading knowledge base...'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CheckCircleIcon sx={{ fontSize: 12, color: 'success.main' }} />
                <Typography variant="caption" color="success.main">
                  Secure & Private
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Collapse>

      {/* Escalation Dialog */}
      <Dialog open={escalationDialog} onClose={() => setEscalationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SupportIcon color="primary" />
          Connect with Human Support
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            I'll connect you with our support team for personalized assistance.
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Your plan: {conversationContext?.userProfile.plan}</strong><br />
            Expected response time: {conversationContext?.userProfile.plan === 'enterprise' ? '15 minutes' : '2 hours'}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            What type of help do you need?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEscalationDialog(false)}>Cancel</Button>
          <Button onClick={() => handleEscalation('technical')} variant="contained">
            Technical Support
          </Button>
          <Button onClick={() => handleEscalation('billing')} variant="outlined">
            Billing Help
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Mock knowledge base for fallback
const mockKnowledgeBase = {
  knowledgeBase: [
    {
      id: 'kb_getting_started',
      title: 'Getting Started with OrderNimbus',
      category: 'onboarding',
      content: 'Welcome to OrderNimbus! Here are the key steps to get started...',
      searchTerms: 'getting started onboarding setup'
    }
  ],
  commonIntents: [
    {
      intent: 'pricing_inquiry',
      keywords: ['price', 'cost', 'plan', 'billing'],
      escalation_triggers: ['expensive', 'cancel']
    }
  ],
  workflows: [
    {
      id: 'onboarding_flow',
      name: 'Getting Started',
      description: 'Let me help you get set up!',
      steps: [
        {
          id: 'welcome',
          name: 'Welcome',
          content: 'Welcome! What would you like to do first?',
          next_steps: { default: 'complete' }
        }
      ]
    }
  ],
  quickResponses: {
    greeting: ['Hi! How can I help you today?'],
    thanks: ['You\'re welcome!'],
    goodbye: ['Goodbye! Have a great day!']
  }
};