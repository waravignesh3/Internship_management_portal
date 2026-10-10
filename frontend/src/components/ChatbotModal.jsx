import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Bot, X, Send, Sparkles, Copy, Check, RefreshCw,
  User, MessageSquare, RotateCcw, Wifi, WifiOff, Loader2, AlertTriangle
} from 'lucide-react';

// ─── Connection status badge ──────────────────────────────────────────────────
const ConnectionBadge = ({ status }) => {
  if (status === 'connected') {
    return (
      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Gemini AI Active
      </span>
    );
  }
  if (status === 'checking') {
    return (
      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-white/60">
        <Loader2 className="w-2.5 h-2.5 animate-spin" />
        Connecting...
      </span>
    );
  }
  if (status === 'configuration_missing') {
    return (
      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-300">
        <AlertTriangle className="w-2.5 h-2.5" />
        Setup Required
      </span>
    );
  }
  if (status === 'auth_failed') {
    return (
      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-rose-300">
        <WifiOff className="w-2.5 h-2.5" />
        Auth Failed
      </span>
    );
  }
  if (status === 'quota_exceeded') {
    return (
      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-orange-300">
        <AlertTriangle className="w-2.5 h-2.5" />
        Quota Exceeded
      </span>
    );
  }
  // generic provider_error / provider_unavailable / unknown
  return (
    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-white/60">
      <WifiOff className="w-2.5 h-2.5" />
      Offline
    </span>
  );
};

export const ChatbotModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const getInitialGreeting = () => ({
    id: 1,
    sender: 'ASSISTANT',
    text: `Hi${user?.name ? ` ${user.name.split(' ')[0]}` : ''}! I'm InternHub AI. I can help you discover internships, improve your resume, review your profile, and prepare for interviews. What would you like help with today?`
  });

  const [messages, setMessages] = useState([getInitialGreeting()]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking'); // checking | connected | configuration_missing | auth_failed | quota_exceeded | provider_unavailable | provider_error
  const [connectionMessage, setConnectionMessage] = useState('');
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    { label: 'Find internships', prompt: 'Which internships suit my profile skills and career goals?' },
    { label: 'Improve my resume', prompt: 'How can I improve my resume summary and bullet points?' },
    { label: 'Review my profile', prompt: 'Review my profile and tell me what sections remain incomplete.' },
    { label: 'Interview prep', prompt: 'Prepare me for a technical software engineering interview with sample questions.' },
    { label: 'Skill gaps', prompt: 'Identify my skill gaps for a Backend Developer role and give a learning path.' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Probe the AI status endpoint once when the modal opens
  const checkAiStatus = useCallback(async () => {
    setConnectionStatus('checking');
    try {
      const res = await api.get('/ai/status');
      const { status, message } = res.data;
      setConnectionStatus(status || 'provider_error');
      setConnectionMessage(message || '');
    } catch (err) {
      setConnectionStatus('provider_unavailable');
      setConnectionMessage('Could not reach backend to check AI status.');
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      checkAiStatus();
    }
  }, [isOpen, checkAiStatus]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, loading]);

  const handleSend = async (textToSend) => {
    const queryText = (textToSend || input || '').trim();
    if (!queryText || loading) return;

    const userMsg = { id: Date.now(), sender: 'USER', text: queryText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInput('');
    setLoading(true);
    setLastFailedMessage(null);

    try {
      // Build history — exclude the current user message (it's sent as `message` field)
      const historyPayload = updatedMessages.slice(0, -1).map((m) => ({
        role: m.sender === 'USER' ? 'user' : 'model',
        text: m.text
      }));

      const res = await api.post('/ai/chat', {
        message: queryText,
        history: historyPayload
      });

      if (res.data.success || res.data.response) {
        const aiMsg = {
          id: Date.now() + 1,
          sender: 'ASSISTANT',
          text: res.data.response,
          isFallback: res.data.isFallback,
          provider: res.data.provider
        };
        setMessages((prev) => [...prev, aiMsg]);
        // Reflect live connection status in badge if the first real reply came through
        if (!res.data.isFallback && connectionStatus !== 'connected') {
          setConnectionStatus('connected');
        }
      } else {
        throw new Error(res.data.error || 'Failed to receive AI response');
      }
    } catch (err) {
      const status = err.response?.status;
      let errorText = err.response?.data?.error || err.message || 'Connection error with AI backend.';

      // Translate known HTTP errors into friendly messages
      if (status === 401 || status === 403) errorText = 'Authentication failed. Please log in again.';
      else if (status === 429) errorText = 'AI quota limit reached. Please try again later.';
      else if (status === 503 || status === 502) errorText = 'AI service is temporarily unavailable.';

      setLastFailedMessage(queryText);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ASSISTANT',
          isError: true,
          text: `I encountered an issue: ${errorText} Click "Retry" below to resend your message.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([getInitialGreeting()]);
    setLastFailedMessage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-md md:max-w-lg h-[640px] bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-gradient-to-r from-[var(--primary)] to-indigo-600 text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              InternHub AI Assistant <Sparkles className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
            </h3>
            <ConnectionBadge status={connectionStatus} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Re-check connection */}
          <button
            onClick={checkAiStatus}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white text-xs flex items-center gap-1 transition-colors"
            title="Re-check AI connection"
          >
            <Wifi className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white text-xs flex items-center gap-1 transition-colors"
            title="Clear Chat History"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Connection problem banner — only shown for non-connected non-checking states */}
      {connectionStatus !== 'connected' && connectionStatus !== 'checking' && connectionMessage && (
        <div className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] flex items-start gap-2">
          <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
          <span>{connectionMessage}</span>
        </div>
      )}

      {/* Suggested Prompt Chips */}
      <div className="p-2.5 bg-[var(--bg-main)] border-b border-[var(--border-color)] overflow-x-auto whitespace-nowrap flex gap-2 no-scrollbar">
        {suggestedPrompts.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item.prompt)}
            disabled={loading}
            className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all shrink-0 shadow-2xs disabled:opacity-50"
          >
            <MessageSquare className="w-3 h-3 text-[var(--primary)]" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Message History Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-main)]/40">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ASSISTANT' && (
              <div className="w-8 h-8 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[82%] rounded-2xl p-3.5 text-xs relative group ${
                msg.sender === 'USER'
                  ? 'bg-[var(--primary)] text-white rounded-br-none shadow-md'
                  : msg.isError
                  ? 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-bl-none'
                  : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-bl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

              {/* Only show provider label when it's the real AI (not fallback) */}
              {msg.provider && !msg.isFallback && (
                <span className="block mt-2 text-[9px] font-bold uppercase text-emerald-500 tracking-wider">
                  ✦ {msg.provider}
                </span>
              )}

              {msg.sender === 'ASSISTANT' && !msg.isError && (
                <button
                  onClick={() => handleCopy(msg.id, msg.text)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-[var(--text-muted)] transition-opacity"
                  title="Copy response text"
                >
                  {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </div>
            {msg.sender === 'USER' && (
              <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* Retry Banner */}
        {lastFailedMessage && !loading && (
          <div className="flex justify-center my-2">
            <button
              onClick={() => handleSend(lastFailedMessage)}
              className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:bg-rose-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retry Last Message
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-ping" />
              InternHub AI is generating response...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-card)] flex items-end gap-2">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Ask InternHub AI about internships, skills, resume... (Enter to send)"
          className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-ring)] resize-none max-h-24 overflow-y-auto disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors shadow-sm shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
