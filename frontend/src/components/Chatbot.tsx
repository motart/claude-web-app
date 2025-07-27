import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Fab,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  Avatar,
  Slide,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon
} from '@mui/icons-material';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const predefinedResponses = {
  'hello': 'Hi there! I\'m here to help you with OrderNimbus. What can I assist you with today?',
  'help': 'I can help you with:\n• Navigating the dashboard\n• Understanding forecasting features\n• Data ingestion guidance\n• Setting up connectors\n• Account settings',
  'dashboard': 'The dashboard shows your key metrics, recent orders, and performance analytics. You can customize widgets and view real-time data.',
  'forecast': 'Our AI forecasting uses machine learning to predict demand, sales trends, and inventory needs based on your historical data.',
  'data': 'You can import data from CSV files, connect to databases, or use our API. Go to Data Ingestion to get started.',
  'connectors': 'We support integrations with Shopify, WooCommerce, Amazon, and other platforms. Check the Connectors page.',
  'settings': 'Access your profile and account settings from the user menu in the top right corner.',
  'default': 'I\'m here to help! You can ask me about dashboard features, forecasting, data management, or account settings. What would you like to know?'
};

export const Chatbot: React.FC = () => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to OrderNimbus! I\'m your AI assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase().trim();
    
    for (const [key, response] of Object.entries(predefinedResponses)) {
      if (key !== 'default' && message.includes(key)) {
        return response;
      }
    }
    
    return predefinedResponses.default;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getResponse(inputValue),
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="chat"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          boxShadow: theme.shadows[8],
          '&:hover': {
            transform: 'scale(1.1)',
            transition: 'transform 0.2s ease-in-out'
          }
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>

      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            width: 380,
            height: 500,
            zIndex: 999,
            borderRadius: 3,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: 'white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
                <BotIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1 }}>
                  OrderNimbus Assistant
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Online • Ready to help
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 1,
              backgroundColor: alpha(theme.palette.background.default, 0.5)
            }}
          >
            <List sx={{ p: 0 }}>
              {messages.map((message) => (
                <ListItem
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                    p: 0.5
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '80%',
                      display: 'flex',
                      flexDirection: message.isUser ? 'row-reverse' : 'row',
                      alignItems: 'flex-end',
                      gap: 1
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.875rem',
                        bgcolor: message.isUser 
                          ? theme.palette.primary.main 
                          : theme.palette.grey[600]
                      }}
                    >
                      {message.isUser ? 'U' : <BotIcon fontSize="small" />}
                    </Avatar>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: message.isUser
                          ? theme.palette.primary.main
                          : theme.palette.background.paper,
                        color: message.isUser 
                          ? 'white' 
                          : theme.palette.text.primary,
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-line'
                      }}
                    >
                      <Typography variant="body2">
                        {message.text}
                      </Typography>
                    </Paper>
                  </Box>
                </ListItem>
              ))}
              
              {isTyping && (
                <ListItem sx={{ display: 'flex', justifyContent: 'flex-start', p: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.grey[600] }}>
                      <BotIcon fontSize="small" />
                    </Avatar>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: theme.palette.background.paper,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        Typing...
                      </Typography>
                    </Paper>
                  </Box>
                </ListItem>
              )}
            </List>
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                multiline
                maxRows={3}
                variant="outlined"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
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
                    bgcolor: theme.palette.primary.dark
                  },
                  '&:disabled': {
                    bgcolor: theme.palette.grey[300]
                  }
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Slide>
    </>
  );
};