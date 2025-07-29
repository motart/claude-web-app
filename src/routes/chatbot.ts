import express from 'express';
import { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { IntelligentChatbotService } from '../services/IntelligentChatbotService';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const chatbotService = new IntelligentChatbotService();

// Get knowledge base
router.get('/knowledge-base', async (req: Request, res: Response) => {
  try {
    const knowledgeBasePath = path.join(__dirname, '../data/chatbot-knowledge-base.json');
    
    if (fs.existsSync(knowledgeBasePath)) {
      const knowledgeBase = JSON.parse(fs.readFileSync(knowledgeBasePath, 'utf8'));
      res.json(knowledgeBase);
    } else {
      // Fallback to default knowledge base
      res.json(getDefaultKnowledgeBase());
    }
  } catch (error) {
    logger.error('Error loading knowledge base:', error);
    res.status(500).json({ error: 'Failed to load knowledge base' });
  }
});

// Process chat message
router.post('/message', authenticate, async (req: Request, res: Response) => {
  try {
    const { message, conversationId, sessionId, context } = req.body;
    
    if (!message || !conversationId) {
      return res.status(400).json({ error: 'Message and conversation ID are required' });
    }

    // Build conversation context
    const conversationContext = {
      userId: req.user!.id,
      sessionId: sessionId || `session_${Date.now()}`,
      conversationId,
      userProfile: {
        name: req.user!.name,
        role: req.user!.role || 'user',
        company: req.user!.company,
        plan: req.user!.plan || 'starter',
        onboardingCompleted: req.user!.onboardingCompleted || false,
        storesConnected: req.user!.connectedStores?.length || 0,
        lastActivity: new Date()
      },
      preferences: {
        language: req.user!.preferences?.language || 'en',
        timezone: req.user!.preferences?.timezone || 'UTC',
        communicationStyle: req.user!.preferences?.communicationStyle || 'casual'
      },
      conversationHistory: context?.conversationHistory || [],
      activeTickets: context?.activeTickets || [],
      recentActions: context?.recentActions || [],
      currentWorkflow: context?.currentWorkflow,
      ...context
    };

    // Process the message through the intelligent chatbot service
    const response = await chatbotService.processMessage(message, conversationContext);

    // Log conversation analytics
    await logConversationAnalytics(req.user!.id, {
      message,
      response,
      context: conversationContext,
      timestamp: new Date()
    });

    res.json({
      response,
      context: {
        conversationId,
        sessionId: conversationContext.sessionId,
        currentWorkflow: conversationContext.currentWorkflow
      }
    });

  } catch (error) {
    logger.error('Error processing chatbot message:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      response: {
        id: `error_${Date.now()}`,
        content: 'I apologize, but I\'m having trouble processing your request right now. Please try again or contact our support team.',
        sender: 'bot',
        timestamp: new Date(),
        intent: 'error',
        confidence: 1.0
      }
    });
  }
});

// Get conversation history
router.get('/conversations/:conversationId', authenticate, async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    
    // In a real implementation, this would fetch from database
    const conversation = await getConversationHistory(req.user!.id, conversationId);
    
    res.json(conversation);
  } catch (error) {
    logger.error('Error fetching conversation history:', error);
    res.status(500).json({ error: 'Failed to fetch conversation history' });
  }
});

// Escalate to human support
router.post('/escalate', authenticate, async (req: Request, res: Response) => {
  try {
    const { conversationId, reason, priority, additionalInfo } = req.body;
    
    const ticket = await createSupportTicket({
      userId: req.user!.id,
      conversationId,
      reason,
      priority: priority || (req.user!.plan === 'enterprise' ? 'high' : 'medium'),
      additionalInfo,
      userProfile: {
        name: req.user!.name,
        email: req.user!.email,
        plan: req.user!.plan,
        company: req.user!.company
      }
    });

    // Send notification to support team
    await notifySupportTeam(ticket);

    res.json({
      success: true,
      ticket: {
        ticketNumber: ticket.ticketNumber,
        priority: ticket.priority,
        estimatedResponseTime: ticket.estimatedResponseTime
      }
    });

  } catch (error) {
    logger.error('Error escalating to human support:', error);
    res.status(500).json({ error: 'Failed to escalate to human support' });
  }
});

// Feedback on chatbot response
router.post('/feedback', authenticate, async (req: Request, res: Response) => {
  try {
    const { messageId, conversationId, feedback, rating, comment } = req.body;
    
    await logFeedback({
      userId: req.user!.id,
      messageId,
      conversationId,
      feedback,
      rating,
      comment,
      timestamp: new Date()
    });

    res.json({ success: true });
  } catch (error) {
    logger.error('Error logging chatbot feedback:', error);
    res.status(500).json({ error: 'Failed to log feedback' });
  }
});

// Get chatbot analytics (admin only)
router.get('/analytics', authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const analytics = await getChatbotAnalytics();
    res.json(analytics);
  } catch (error) {
    logger.error('Error fetching chatbot analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Update knowledge base (admin only)
router.post('/knowledge-base', authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { knowledgeBase } = req.body;
    
    const knowledgeBasePath = path.join(__dirname, '../data/chatbot-knowledge-base.json');
    fs.writeFileSync(knowledgeBasePath, JSON.stringify(knowledgeBase, null, 2));
    
    // Reload the chatbot service with new knowledge base
    await chatbotService.reloadKnowledgeBase();

    res.json({ success: true });
  } catch (error) {
    logger.error('Error updating knowledge base:', error);
    res.status(500).json({ error: 'Failed to update knowledge base' });
  }
});

// Helper functions
async function logConversationAnalytics(userId: string, data: any) {
  try {
    // In production, this would store in database or analytics service
    logger.info('Chatbot Analytics:', {
      userId,
      intent: data.response.intent,
      confidence: data.response.confidence,
      timestamp: data.timestamp,
      userMessage: data.message.substring(0, 100), // Truncate for privacy
      responseLength: data.response.content.length
    });
  } catch (error) {
    logger.error('Error logging conversation analytics:', error);
  }
}

async function getConversationHistory(userId: string, conversationId: string) {
  // Mock implementation - in production, fetch from database
  return {
    conversationId,
    userId,
    messages: [],
    startTime: new Date(),
    lastActivity: new Date()
  };
}

async function createSupportTicket(ticketData: any) {
  const ticketNumber = `TK${Date.now().toString().slice(-6)}`;
  
  const ticket = {
    ticketNumber,
    userId: ticketData.userId,
    conversationId: ticketData.conversationId,
    reason: ticketData.reason,
    priority: ticketData.priority,
    additionalInfo: ticketData.additionalInfo,
    userProfile: ticketData.userProfile,
    status: 'open',
    createdAt: new Date(),
    estimatedResponseTime: ticketData.priority === 'high' ? '15 minutes' : 
                          ticketData.priority === 'medium' ? '2 hours' : '24 hours'
  };

  // In production, save to database
  logger.info('Support ticket created:', { ticketNumber, userId: ticketData.userId, reason: ticketData.reason });
  
  return ticket;
}

async function notifySupportTeam(ticket: any) {
  // In production, this would send notifications via email, Slack, etc.
  logger.info('Support team notified:', { ticketNumber: ticket.ticketNumber, priority: ticket.priority });
}

async function logFeedback(feedbackData: any) {
  // In production, store feedback in database for model improvement
  logger.info('Chatbot feedback received:', {
    userId: feedbackData.userId,
    feedback: feedbackData.feedback,
    rating: feedbackData.rating,
    timestamp: feedbackData.timestamp
  });
}

async function getChatbotAnalytics() {
  // Mock analytics data - in production, aggregate from database
  return {
    totalConversations: 1250,
    avgSatisfactionRating: 4.2,
    avgResponseTime: '1.2s',
    topIntents: [
      { intent: 'pricing_inquiry', count: 324, satisfaction: 4.5 },
      { intent: 'technical_support', count: 289, satisfaction: 3.8 },
      { intent: 'integration_support', count: 267, satisfaction: 4.1 },
      { intent: 'onboarding_help', count: 201, satisfaction: 4.6 }
    ],
    escalationRate: 12.5,
    resolutionRate: 78.3,
    avgConversationLength: 5.8,
    knowledgeBaseUtilization: {
      totalArticles: 45,
      articlesUsed: 38,
      avgConfidence: 0.82
    }
  };
}

function getDefaultKnowledgeBase() {
  return {
    knowledgeBase: [
      {
        id: 'kb_default_help',
        title: 'How can I help you?',
        category: 'general',
        tags: ['help', 'support'],
        content: 'I can help you with:\n• Getting started with OrderNimbus\n• Connecting your stores\n• Understanding forecasting\n• Billing and pricing questions\n• Technical support\n\nWhat would you like to know about?',
        searchTerms: 'help support getting started',
        confidence: 0.9,
        usage: 100,
        rating: 4.5,
        lastUpdated: new Date().toISOString()
      }
    ],
    commonIntents: [
      {
        intent: 'general_help',
        keywords: ['help', 'support', 'question'],
        confidence_threshold: 0.6,
        escalation_triggers: ['urgent', 'critical']
      }
    ],
    workflows: [],
    quickResponses: {
      greeting: ['Hi! How can I help you today?'],
      thanks: ['You\'re welcome!'],
      goodbye: ['Have a great day!']
    }
  };
}

export default router;