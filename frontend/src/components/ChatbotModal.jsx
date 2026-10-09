import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Bot, X, Send, Sparkles, Copy, Check, RefreshCw, User, MessageSquare } from 'lucide-react';

export const ChatbotModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ASSISTANT',
      text: `Hello ${user?.profile?.full_name || 'Student'}! I am InternHub AI, your intelligent career coach and internship matching assistant. How can I help you discover internships or improve your skills today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    'Find internships matching my technical skills',
    'Analyze my skill gap for Backend Developer',
    'Prepare me for a Software Engineering internship interview',
    'How can I improve my resume for software internships?',
    'Recommend portfolio projects for my profile'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim() || loading) return;

    const userMsg = { id: Date.now(), sender: 'USER', text: queryText };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: queryText });
      if (res.data.success) {
        const aiMsg = {
          id: Date.now() + 1,
          sender: 'ASSISTANT',
          text: res.data.response,
          isFallback: res.data.isFallback,
          provider: res.data.provider
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ASSISTANT',
          text: 'Sorry, I encountered an issue connecting to the AI backend. Try selecting one of the suggested prompts above.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-lg h-[620px] bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--primary)] text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              InternHub AI Assistant <Sparkles className="w-3.5 h-3.5 fill-white text-yellow-300" />
            </h3>
            <p className="text-[10px] text-white/80">Smart Internship Matching & Career Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages([{ id: Date.now(), sender: 'ASSISTANT', text: 'Chat history cleared. How else can I assist you?' }])}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white text-xs flex items-center gap-1"
            title="Clear Chat"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Suggested Prompts Header Pill Carousel */}
      <div className="p-2.5 bg-[var(--bg-main)] border-b border-[var(--border-color)] overflow-x-auto whitespace-nowrap flex gap-2 no-scrollbar">
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all shrink-0"
          >
            <MessageSquare className="w-3 h-3 text-[var(--primary)]" />
            {prompt}
          </button>
        ))}
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-main)]/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ASSISTANT' && (
              <div className="w-8 h-8 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs relative group ${
              msg.sender === 'USER'
                ? 'bg-[var(--primary)] text-white rounded-br-none'
                : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-bl-none shadow-sm'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
              {msg.isFallback && (
                <span className="block mt-2 text-[9px] font-semibold uppercase text-amber-500 tracking-wider">
                  ⚡ Mode: Smart Matching Engine
                </span>
              )}
              {msg.sender === 'ASSISTANT' && (
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
              <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-ping" /> InternHub AI is processing context...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-card)] flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI about internships, skills, applications..."
          className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-ring)]"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
