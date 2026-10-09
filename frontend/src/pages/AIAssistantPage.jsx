import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card, Button, Input } from '../components/UIComponents';
import { Bot, Send, Sparkles, User, Copy, Check, RefreshCw, MessageSquare } from 'lucide-react';

export const AIAssistantPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ASSISTANT',
      text: `Hello ${user?.profile?.full_name || 'Student'}! Welcome to the dedicated InternHub AI Career & Technical Assistant. You can ask me to evaluate your skill gaps, review your resume bullet points, prepare C++ and DSA interview questions, or find matching internships.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    'Which internships suit my profile skills?',
    'What skills should I learn for a C++ Backend Engineer role?',
    'Review and improve my resume summary',
    'Prepare me for a C++ and DSA technical interview',
    'Give me hands-on project ideas to improve my profile'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ASSISTANT',
          text: 'AI Service connection error. Using local rule-based response.'
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

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Bot className="w-6 h-6 text-[var(--primary)]" /> InternHub AI Assistant
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">ChatGPT-like interactive career and technical coach.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setMessages([{ id: Date.now(), sender: 'ASSISTANT', text: 'Chat history cleared. How else can I assist you?' }])}>
          <RefreshCw className="w-3.5 h-3.5" /> Clear Chat
        </Button>
      </div>

      {/* Suggested Prompts Pill Row */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--primary)] hover:text-[var(--primary)] text-[var(--text-secondary)] whitespace-nowrap transition-all shadow-xs flex items-center gap-1.5"
          >
            <MessageSquare className="w-3 h-3 text-[var(--primary)]" /> {p}
          </button>
        ))}
      </div>

      {/* Messages Window */}
      <Card className="flex-1 p-6 overflow-y-auto space-y-4 bg-[var(--bg-main)]/50 border-[var(--border-color)]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'ASSISTANT' && (
              <div className="w-9 h-9 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center shrink-0 shadow-md">
                <Bot className="w-5 h-5" />
              </div>
            )}

            <div className={`max-w-[80%] rounded-2xl p-4 text-xs relative group ${
              msg.sender === 'USER'
                ? 'bg-[var(--primary)] text-white rounded-br-none shadow-md'
                : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-bl-none shadow-sm'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
              {msg.isFallback && (
                <span className="block mt-2 text-[9px] font-bold uppercase text-amber-500 tracking-wider">
                  ⚡ Mode: DSA Rule-Based Engine
                </span>
              )}
              {msg.sender === 'ASSISTANT' && (
                <button
                  onClick={() => handleCopy(msg.id, msg.text)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-[var(--text-muted)] transition-opacity"
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
        {loading && (
          <div className="flex gap-3 items-center">
            <div className="w-9 h-9 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-ping" /> Analyzing request...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </Card>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask InternHub AI anything about your profile, C++, DSA, or interviews..."
          className="flex-1 px-4 py-3 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-ring)]"
        />
        <Button type="submit" disabled={!input.trim() || loading} className="px-6">
          <Send className="w-4 h-4" /> Send
        </Button>
      </form>
    </div>
  );
};
