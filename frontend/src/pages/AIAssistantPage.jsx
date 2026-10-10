import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card, Button } from '../components/UIComponents';
import { Bot, Send, Sparkles, User, Copy, Check, RefreshCw, MessageSquare, RotateCcw } from 'lucide-react';

export const AIAssistantPage = () => {
  const { user } = useAuth();
  
  const getInitialGreeting = () => ({
    id: 1,
    sender: 'ASSISTANT',
    text: `Hi! I'm InternHub AI. I can help you discover internships, improve your resume, review your profile, and prepare for interviews. What would you like help with today?`
  });

  const [messages, setMessages] = useState([getInitialGreeting()]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    { label: 'Find internships', prompt: 'Which internships suit my profile skills and career goals?' },
    { label: 'Improve my resume', prompt: 'How can I improve my resume summary and project bullet points?' },
    { label: 'Review my profile', prompt: 'Review my profile and tell me what sections remain incomplete.' },
    { label: 'Prepare for interviews', prompt: 'Prepare me for a technical software engineering interview with sample questions.' },
    { label: 'Identify skill gaps', prompt: 'Identify my skill gaps for a Backend Developer role and give a learning path.' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
      const historyPayload = updatedMessages.map((m) => ({
        role: m.sender === 'USER' ? 'user' : 'model',
        text: m.text
      }));

      const res = await api.post('/ai/chat', {
        message: queryText,
        history: historyPayload
      });

      if (res.data.success || res.data.response) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ASSISTANT',
            text: res.data.response,
            isFallback: res.data.isFallback,
            provider: res.data.provider
          }
        ]);
      } else {
        throw new Error(res.data.error || 'Failed to receive AI response');
      }
    } catch (err) {
      const errorText = err.response?.data?.error || err.message || 'Connection error with AI backend.';
      setLastFailedMessage(queryText);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ASSISTANT',
          isError: true,
          text: `I encountered an issue connecting to the AI backend (${errorText}). Click 'Retry' below to resend your message.`
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

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Bot className="w-6 h-6 text-[var(--primary)]" /> InternHub AI Career Coach
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">Interactive career, resume, and technical interview advisor.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMessages([getInitialGreeting()])}
          className="flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Clear Chat
        </Button>
      </div>

      {/* Suggested Prompts Pill Row */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {suggestedPrompts.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(item.prompt)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--primary)] hover:text-[var(--primary)] text-[var(--text-secondary)] whitespace-nowrap transition-all shadow-2xs flex items-center gap-1.5 shrink-0"
          >
            <MessageSquare className="w-3 h-3 text-[var(--primary)]" /> {item.label}
          </button>
        ))}
      </div>

      {/* Messages Window */}
      <Card className="flex-1 p-6 overflow-y-auto space-y-4 bg-[var(--bg-main)]/40 border-[var(--border-color)] shadow-inner">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ASSISTANT' && (
              <div className="w-9 h-9 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center shrink-0 shadow-md">
                <Bot className="w-5 h-5" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl p-4 text-xs relative group ${
                msg.sender === 'USER'
                  ? 'bg-[var(--primary)] text-white rounded-br-none shadow-md'
                  : msg.isError
                  ? 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-bl-none'
                  : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-bl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

              {msg.provider && (
                <span className="block mt-2 text-[9px] font-bold uppercase text-[var(--text-muted)] tracking-wider">
                  Provider: {msg.provider}
                </span>
              )}

              {msg.sender === 'ASSISTANT' && !msg.isError && (
                <button
                  onClick={() => handleCopy(msg.id, msg.text)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-[var(--text-muted)] transition-opacity"
                  title="Copy text"
                >
                  {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </div>

            {msg.sender === 'USER' && (
              <div className="w-9 h-9 rounded-2xl bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-md">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}

        {/* Retry Button */}
        {lastFailedMessage && !loading && (
          <div className="flex justify-center my-2">
            <button
              onClick={() => handleSend(lastFailedMessage)}
              className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:bg-rose-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retry Last Message
            </button>
          </div>
        )}

        {loading && (
          <div className="flex gap-3 items-center">
            <div className="w-9 h-9 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center shrink-0 shadow-md">
              <Bot className="w-5 h-5 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-ping" /> InternHub AI is processing context...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </Card>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2 items-end">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask InternHub AI anything about your profile, skills, career goals, or interviews..."
          className="flex-1 px-4 py-3 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-ring)] resize-none max-h-24 overflow-y-auto"
        />
        <Button type="submit" disabled={!input.trim() || loading} className="px-6 py-3 shrink-0">
          <Send className="w-4 h-4" /> Send
        </Button>
      </form>
    </div>
  );
};
