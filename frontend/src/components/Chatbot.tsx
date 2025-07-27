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
  Rating,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  useTheme,
  alpha,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  SmartToy as BotIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  intent?: string;
  confidence?: number;
  feedback?: 'helpful' | 'not_helpful';
}

export const Chatbot: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !conversationId) {
      initializeConversation();
    }
  }, [isOpen]);

  const initializeConversation = async () => {
    const newConversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setConversationId(newConversationId);
    
    const welcomeMessage: Message = {
      id: `msg_${Date.now()}`,
      content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your OrderNimbus assistant. How can I help you today?`,
      sender: 'bot',
      timestamp: new Date(),
      intent: 'greeting',
      confidence: 1.0
    };
    
    setMessages([welcomeMessage]);
    await logMessage(newConversationId, welcomeMessage);
  };

  const logMessage = async (convId: string, message: Message) => {
    try {
      const payload = {
        conversationId: convId,
        sessionId,
        userId: user?.id,
        message: {
          ...message,
          metadata: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            page: window.location.pathname,
            timestamp: message.timestamp.toISOString()
          }
        }
      };

      console.log('📊 ML Training Data:', payload);
    } catch (error) {
      console.error('Failed to log message:', error);
    }
  };

  const logConversationEvent = async (event: string, data?: any) => {
    try {
      const payload = {
        conversationId,
        sessionId,
        userId: user?.id,
        event,
        data,
        timestamp: new Date().toISOString()
      };

      console.log('📈 Analytics Event:', payload);
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  };

  const getBotResponse = async (userMessage: string): Promise<Message> => {
    setIsTyping(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const intent = detectIntent(userMessage);
      const response = generateResponse(userMessage, intent);
      
      const botMessage: Message = {
        id: `msg_${Date.now()}`,
        content: response.content,
        sender: 'bot',
        timestamp: new Date(),
        intent: intent.name,
        confidence: intent.confidence
      };

      return botMessage;
    } finally {
      setIsTyping(false);
    }
  };

  const detectIntent = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('plan')) {
      return { name: 'pricing_inquiry', confidence: 0.9 };
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return { name: 'help_request', confidence: 0.85 };
    } else if (lowerMessage.includes('order') || lowerMessage.includes('purchase')) {
      return { name: 'order_inquiry', confidence: 0.8 };
    } else if (lowerMessage.includes('forecast') || lowerMessage.includes('predict')) {
      return { name: 'forecasting_question', confidence: 0.9 };
    } else if (lowerMessage.includes('data') || lowerMessage.includes('upload')) {
      return { name: 'data_question', confidence: 0.85 };
    } else {
      return { name: 'general_inquiry', confidence: 0.5 };
    }
  };

  const generateResponse = (userMessage: string, intent: { name: string; confidence: number }) => {
    const responses = {
      pricing_inquiry: [
        "Our plans start at $29/month for the Starter plan. Would you like to see a detailed comparison of all our plans?",
        "We offer three tiers: Starter ($29), Professional ($79), and Enterprise ($199). Each includes different features and limits.",
      ],
      help_request: [
        "I'm here to help! What specific aspect of OrderNimbus would you like assistance with?",
        "Of course! I can help you with forecasting, data management, store connections, or any other features. What do you need?",
      ],
      order_inquiry: [
        "OrderNimbus helps you manage and forecast orders across all your sales channels. Are you looking to connect a specific platform?",
        "Our order management features include real-time tracking, forecasting, and cross-platform synchronization. What would you like to know?",
      ],
      forecasting_question: [
        "Our AI forecasting uses machine learning to predict future demand based on your historical data. It's one of our most powerful features!",
        "Forecasting in OrderNimbus analyzes patterns, seasonality, and trends to help you optimize inventory. Want to see how it works?",
      ],
      data_question: [
        "You can upload data via CSV/Excel files or connect directly to your sales platforms. Which method would work better for you?",
        "Our data ingestion supports multiple formats and real-time sync from major e-commerce platforms. Need help getting started?",
      ],
      general_inquiry: [
        "That's an interesting question! Could you provide a bit more detail so I can give you the most helpful answer?",
        "I'd be happy to help with that. Can you tell me more about what you're trying to accomplish?",
      ]
    };

    const intentResponses = responses[intent.name as keyof typeof responses] || responses.general_inquiry;
    const randomResponse = intentResponses[Math.floor(Math.random() * intentResponses.length)];
    
    return { content: randomResponse };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    await logMessage(conversationId, userMessage);

    const botResponse = await getBotResponse(userMessage.content);
    setMessages(prev => [...prev, botResponse]);
    
    await logMessage(conversationId, botResponse);
  };

  const handleMessageFeedback = async (messageId: string, feedback: 'helpful' | 'not_helpful') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback } : msg
    ));

    await logConversationEvent('message_feedback', { messageId, feedback });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = async () => {
    setIsOpen(false);
    if (messages.length > 2) {
      setFeedbackDialogOpen(true);
    }
    await logConversationEvent('conversation_closed');
  };

  const handleFeedbackSubmit = async () => {
    if (satisfaction !== null) {
      await logConversationEvent('satisfaction_rating', { rating: satisfaction });
    }
    setFeedbackDialogOpen(false);
    setSatisfaction(null);
  };

  const toggleChat = () => {
    if (!isOpen) {
      setIsOpen(true);
      logConversationEvent('conversation_opened');
    } else {
      handleClose();
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
          boxShadow: theme.shadows[8]
        }}
        onClick={toggleChat}
      >
        <Badge badgeContent={unreadCount} color="error" max={9}>
          {isOpen ? <CloseIcon /> : <ChatIcon />}
        </Badge>
      </Fab>

      <Collapse in={isOpen}>
        <Paper
          elevation={16}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            width: 380,
            height: 500,
            zIndex: 1299,
            borderRadius: 3,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box
            sx={{
              p: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 32, height: 32 }}>
                <BotIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1 }}>
                  OrderNimbus Assistant
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {isTyping ? 'Typing...' : 'Online'}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={handleClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ 
            flex: 1, 
            overflow: 'auto', 
            p: 1,
            bgcolor: alpha(theme.palette.background.default, 0.5)
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
                    mb: 1
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 'auto' }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32,
                        bgcolor: message.sender === 'user' ? theme.palette.primary.main : theme.palette.secondary.main
                      }}
                    >
                      {message.sender === 'user' ? <PersonIcon fontSize="small" /> : <BotIcon fontSize="small" />}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <Box sx={{ 
                    maxWidth: '75%',
                    textAlign: message.sender === 'user' ? 'right' : 'left'
                  }}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        bgcolor: message.sender === 'user' 
                          ? theme.palette.primary.main 
                          : theme.palette.background.paper,
                        color: message.sender === 'user' ? 'white' : 'text.primary',
                        borderRadius: 2,
                        borderTopLeftRadius: message.sender === 'bot' ? 0 : 2,
                        borderTopRightRadius: message.sender === 'user' ? 0 : 2
                      }}
                    >
                      <Typography variant="body2">{message.content}</Typography>
                      
                      {message.sender === 'bot' && message.intent && (
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={message.intent.replace('_', ' ')} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                          {message.confidence && (
                            <Typography variant="caption" color="text.secondary">
                              {Math.round(message.confidence * 100)}%
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Paper>
                    
                    {message.sender === 'bot' && !message.feedback && (
                      <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Helpful">
                          <IconButton 
                            size="small" 
                            onClick={() => handleMessageFeedback(message.id, 'helpful')}
                          >
                            <ThumbUpIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Not helpful">
                          <IconButton 
                            size="small" 
                            onClick={() => handleMessageFeedback(message.id, 'not_helpful')}
                          >
                            <ThumbDownIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                    
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
              
              {isTyping && (
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}>
                      <BotIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                      Thinking...
                    </Typography>
                  </Box>
                </ListItem>
              )}
            </List>
            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                multiline
                maxRows={3}
                disabled={isTyping}
              />
              <IconButton 
                color="primary" 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Collapse>

      <Dialog open={feedbackDialogOpen} onClose={() => setFeedbackDialogOpen(false)}>
        <DialogTitle>How was your experience?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Your feedback helps us improve our AI assistant.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Rating
              value={satisfaction}
              onChange={(_, newValue) => setSatisfaction(newValue)}
              size="large"
            />
            <Typography variant="caption" color="text.secondary">
              Rate your satisfaction with the conversation
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialogOpen(false)}>Skip</Button>
          <Button onClick={handleFeedbackSubmit} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};