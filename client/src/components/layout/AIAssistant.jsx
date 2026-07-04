import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  X, 
  Send, 
  Minimize2, 
  Maximize2,
  MessageSquare,
  Calendar,
  Search,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import { useTheme } from '../../store/ThemeContext';
import Button from '../ui/Button';
import Input from '../ui/Input';

const AIAssistant = () => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hi! I\'m your AI assistant. I can help you with event planning, recommendations, and more. What would you like to know?',
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickActions = [
    { icon: Search, label: 'Find Events', prompt: 'Find events near me this weekend' },
    { icon: Calendar, label: 'Plan Event', prompt: 'Help me plan a birthday party for 50 people' },
    { icon: Lightbulb, label: 'Get Ideas', prompt: 'Give me creative event theme ideas' },
    { icon: TrendingUp, label: 'Trending', prompt: 'What are the trending event categories?' },
  ];

  const handleSend = async (content) => {
    if (!content.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: content.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I found several events matching your criteria. Would you like me to show you the top 3 options?",
        "Based on your preferences, I'd recommend the Tech Conference 2024. It has excellent reviews and fits your budget.",
        "For a birthday party with 50 guests, I suggest considering venues like The Grand Hall or Skyline Terrace. Both offer great packages.",
        "Here are some trending event themes: Vintage Hollywood, Tropical Paradise, Cyberpunk Future, and Garden Party.",
      ];

      const aiMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (prompt) => {
    handleSend(prompt);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          variant="gradient"
          size="lg"
          icon={Sparkles}
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-2xl shadow-indigo-500/50 animate-pulse-glow"
        >
          {!isOpen && <Sparkles className="h-6 w-6" />}
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-24 right-6 z-50 w-96 h-[600px] rounded-3xl shadow-2xl flex flex-col overflow-hidden ${
              isDark 
                ? 'bg-slate-900 border border-slate-800' 
                : 'bg-white border border-slate-200'
            }`}
          >
            {/* Header */}
            <div className={`p-4 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">AI Assistant</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Always here to help</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={isMinimized ? Maximize2 : Minimize2}
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-2"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={X}
                    onClick={() => setIsOpen(false)}
                    className="p-2"
                  />
                </div>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.type === 'user'
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                          : isDark
                          ? 'bg-slate-800 text-slate-200'
                          : 'bg-slate-100 text-slate-900'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className={`rounded-2xl px-4 py-3 ${
                        isDark ? 'bg-slate-800' : 'bg-slate-100'
                      }`}>
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action) => (
                      <Button
                        key={action.label}
                        variant="ghost"
                        size="sm"
                        icon={action.icon}
                        onClick={() => handleQuickAction(action.prompt)}
                        className={`text-xs ${
                          isDark 
                            ? 'text-slate-400 hover:bg-slate-800' 
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask me anything..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSend(message)}
                      className="flex-1"
                    />
                    <Button
                      variant="gradient"
                      size="md"
                      icon={Send}
                      onClick={() => handleSend(message)}
                      disabled={!message.trim() || isTyping}
                      className="p-3 rounded-xl"
                    />
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
