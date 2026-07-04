import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Search, Loader2, Plus, X, User } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { messagesAPI } from '../lib/api';
import { useAuth } from '../store/AuthContext';
import toast from 'react-hot-toast';

const MessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const convIdRef = useRef(null);
  const otherUserRef = useRef({});

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const map = {};
    conversations.forEach(conv => {
      if (conv.lastMessage) {
        const other = String(conv.lastMessage.sender?._id) === user?.id
          ? conv.lastMessage.receiver
          : conv.lastMessage.sender;
        if (other) map[conv._id] = other;
      }
    });
    otherUserRef.current = map;
  }, [conversations, user?.id]);

  useEffect(() => {
    if (activeConvId) {
      convIdRef.current = activeConvId;
      fetchMessages(activeConvId);
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getOtherUserId = (convId) => {
    if (!convId) return null;
    const ids = convId.split('_');
    return ids[0] === user?.id ? ids[1] : ids[0];
  };

  const fetchConversations = async () => {
    try {
      const response = await messagesAPI.getConversations();
      const list = response.data.conversations || [];
      setConversations(list);
      if (list.length > 0 && !convIdRef.current) {
        setActiveConvId(list[0]._id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const response = await messagesAPI.getMessages(convId);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      setLoadingContacts(true);
      const response = await messagesAPI.getContacts();
      setContacts(response.data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoadingContacts(false);
    }
  };

  const refreshConversations = useCallback(async () => {
    try {
      const response = await messagesAPI.getConversations();
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error refreshing conversations:', error);
    }
  }, []);

  const openNewChat = () => {
    fetchContacts();
    setShowNewChat(true);
  };

  const startChat = async (contact) => {
    const convId = `${[user?.id, String(contact._id)].sort().join('_')}`;

    try {
      const existingConv = conversations.find(c => c._id === convId);
      if (existingConv) {
        setActiveConvId(convId);
        setShowNewChat(false);
        return;
      }

      const response = await messagesAPI.send({
        receiver: String(contact._id),
        content: `Hello ${contact.name}!`,
        conversationId: convId
      });

      const newConv = {
        _id: convId,
        lastMessage: response.data.message,
        unreadCount: 0
      };
      otherUserRef.current[convId] = { _id: contact._id, name: contact.name, email: contact.email };
      setConversations(prev => [newConv, ...prev]);
      setActiveConvId(convId);
      setShowNewChat(false);
      toast.success(`Chat started with ${contact.name}`);
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeConvId) return;

    const otherUserId = getOtherUserId(activeConvId);
    if (!otherUserId) return;

    try {
      setSending(true);
      const response = await messagesAPI.send({
        receiver: otherUserId,
        content: msgInput,
        conversationId: activeConvId
      });
      setMessages(prev => [...prev, response.data.message]);
      setConversations(prev => prev.map(c =>
        c._id === activeConvId ? { ...c, lastMessage: response.data.message } : c
      ));
      setMsgInput('');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getOtherUser = (conv) => {
    if (!conv) return null;
    if (conv.lastMessage) {
      return String(conv.lastMessage.sender?._id) === user?.id
        ? conv.lastMessage.receiver
        : conv.lastMessage.sender;
    }
    return otherUserRef.current[conv._id] || null;
  };

  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const contactLabel = user?.role === 'organizer' ? 'attendees' : user?.role === 'admin' ? 'organizers' : 'organizers';

  if (initialLoading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Messages</h1>
            <p className="text-text-muted">Chat with event organizers</p>
          </div>
          <button
            onClick={openNewChat}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl transition-colors text-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            New Message
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl flex flex-col overflow-hidden h-full">
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center gap-2 bg-slate-700/30 rounded-xl px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  className="w-full bg-transparent border-0 focus:outline-none text-sm text-white placeholder-slate-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-700/30">
              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No conversations yet</p>
                  <button
                    onClick={openNewChat}
                    className="mt-4 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                  >
                    Start a new chat
                  </button>
                </div>
              ) : (
                conversations.map((conv) => {
                  const otherUser = getOtherUser(conv);
                  const isActive = conv._id === activeConvId;
                  return (
                    <button
                      key={conv._id}
                      onClick={() => setActiveConvId(conv._id)}
                      className={`w-full p-4 flex items-start gap-3 transition-colors text-left ${
                        isActive ? 'bg-purple-500/10 border-l-4 border-l-purple-500' : 'hover:bg-slate-700/20'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {otherUser?.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className={`font-semibold truncate text-sm ${isActive ? 'text-white' : 'text-slate-300'}`}>
                            {otherUser?.name || 'Unknown'}
                          </span>
                          <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                            {conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{conv.lastMessage?.content || 'No messages'}</p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5 font-semibold flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex flex-col overflow-hidden h-full">
            {activeConvId ? (
              <>
                <div className="p-4 border-b border-slate-700/50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {getOtherUser(conversations.find(c => c._id === activeConvId))?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {getOtherUser(conversations.find(c => c._id === activeConvId))?.name || 'Select Conversation'}
                    </h3>
                    <span className="text-xs text-green-400">Online</span>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-slate-500 text-sm">No messages yet. Start a conversation!</p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div key={m._id} className={`flex ${String(m.sender?._id) === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                            String(m.sender?._id) === user?.id
                              ? 'bg-purple-600 text-white rounded-tr-none'
                              : 'bg-slate-700/50 text-slate-200 rounded-tl-none'
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-4 border-t border-slate-700/50 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    className="flex-1 bg-slate-700/30 border border-slate-600/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={sending || !msgInput.trim()}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white rounded-xl p-2.5 flex items-center justify-center transition-colors"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showNewChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewChat(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
                <h3 className="text-lg font-bold text-white">New Message</h3>
                <button
                  onClick={() => setShowNewChat(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2 mb-4">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={`Search ${contactLabel}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-0 focus:outline-none text-sm text-white placeholder-slate-500"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1">
                  {loadingContacts ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                    </div>
                  ) : filteredContacts.length === 0 ? (
                    <div className="text-center py-8">
                      <User className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">
                        {searchQuery ? `No ${contactLabel} found` : `No ${contactLabel} available`}
                      </p>
                      <p className="text-slate-600 text-xs mt-1">
                        {user?.role === 'organizer' ? 'Attendees will appear once they book your events' : 'No contacts available yet'}
                      </p>
                    </div>
                  ) : (
                    filteredContacts.map((contact) => (
                      <button
                        key={contact._id}
                        onClick={() => startChat(contact)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {contact.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm">{contact.name}</p>
                          <p className="text-xs text-slate-500 truncate">
                            {user?.role === 'organizer' ? 'Event Attendee' : user?.role === 'admin' ? 'Organizer' : 'Event Organizer'}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessagesPage;
