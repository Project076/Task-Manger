import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, BookOpen, FileText, Bot, HelpCircle, AlertTriangle, ListTodo, Activity } from 'lucide-react';
import { Task } from '../types.js';

interface NotebookLMDrawerProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  activeUserEmail: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'notebooklm';
  text: string;
  createdAt: string;
}

export default function NotebookLMDrawer({ task, isOpen, onClose, activeUserEmail }: NotebookLMDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string>('');
  const [qaQuery, setQaQuery] = useState('');
  const [qaLog, setQaLog] = useState<ChatMessage[]>([]);
  const [notebookLoading, setNotebookLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-fetch summary/insights card on drawer activation
  useEffect(() => {
    if (isOpen && task) {
      fetchInsights();
      setQaLog([]); // reset chat history on switching tasks
    }
  }, [isOpen, task?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [qaLog, notebookLoading]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notebooklm/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': activeUserEmail
        },
        body: JSON.stringify({ taskId: task.id })
      });
      const data = await res.json();
      if (res.ok) {
        setInsight(data.response || 'No summaries returned.');
      } else {
        setInsight(`⚠️ AI Error: ${data.error || 'Failed to synthesize dossier'}`);
      }
    } catch (err: any) {
      setInsight(`⚠️ Network Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const submitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaQuery.trim()) return;

    const queryText = qaQuery.trim();
    setQaQuery('');

    const newMsg: ChatMessage = {
      id: `qa-${Date.now()}`,
      sender: 'user',
      text: queryText,
      createdAt: new Date().toISOString()
    };
    setQaLog(prev => [...prev, newMsg]);
    setNotebookLoading(true);

    try {
      const res = await fetch('/api/notebooklm/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': activeUserEmail
        },
        body: JSON.stringify({ taskId: task.id, query: queryText })
      });
      const data = await res.json();
      
      const botMsg: ChatMessage = {
        id: `qa-resp-${Date.now()}`,
        sender: 'notebooklm',
        text: res.ok ? data.response : `⚠️ AI Assistant Error: ${data.error || 'Could not query services.'}`,
        createdAt: new Date().toISOString()
      };
      setQaLog(prev => [...prev, botMsg]);
    } catch (err: any) {
      setQaLog(prev => [...prev, {
        id: `qa-resp-${Date.now()}`,
        sender: 'notebooklm',
        text: `⚠️ Network disconnect failure: ${err.message || err}`,
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setNotebookLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-zinc-950/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="fixed right-0 top-0 bottom-0 z-45 w-full md:w-[480px] lg:w-[540px] bg-zinc-950 border-l border-emerald-950/40 shadow-2xl flex flex-col overflow-hidden"
            id="notebooklm_drawer"
          >
            {/* Drawer Header */}
            <div className="p-5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <BookOpen className="w-5 h-5" />
                <span className="font-display font-semibold text-lg text-zinc-100 flex items-center gap-1.5">
                  NotebookLM Source Notebook
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                </span>
              </div>
              <button 
                onClick={onClose}
                className="p-1 px-2 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Task Summary Card & Target Source listing */}
            <div className="bg-zinc-900/40 p-4 border-b border-zinc-900/60 flex flex-col gap-2">
              <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
                Connected Sources ({task.attachments.length + 2})
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <span className="px-2.5 py-1 text-xs bg-emerald-950/40 border border-emerald-900 text-emerald-300 rounded-lg flex items-center gap-1 font-mono">
                  <FileText className="w-3 h-3" />
                  Task Description
                </span>
                <span className="px-2.5 py-1 text-xs bg-emerald-950/40 border border-emerald-900 text-emerald-300 rounded-lg flex items-center gap-1 font-mono">
                  <Activity className="w-3 h-3" />
                  Workspace Chat Log
                </span>
                {task.attachments.map((att) => (
                  <span key={att.id} className="px-2.5 py-1 text-xs bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg flex items-center gap-1 font-mono">
                    <FileText className="w-3 h-3 text-zinc-400" />
                    {att.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Content Segment */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Executive Summary Widget */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-400 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-emerald-400" />
                    Automated Executive Dossier
                  </h4>
                  {loading && <span className="text-[10px] font-mono text-emerald-400 animate-pulse">Computing dossier vectors...</span>}
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 leading-relaxed text-sm text-zinc-300 select-text">
                  {loading ? (
                    <div className="space-y-3 py-2">
                      <div className="h-4 bg-zinc-800 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-zinc-800 rounded animate-pulse w-full"></div>
                      <div className="h-4 bg-zinc-800 rounded animate-pulse w-5/6"></div>
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-emerald text-sm max-w-none space-y-2">
                      {/* Formatted Markdown Render Simulator */}
                      {insight.split('\n').map((line, idx) => {
                        if (line.startsWith('## ')) {
                          return <div key={idx} className="font-display font-semibold text-emerald-400 text-base mt-3 mb-1">{line.replace('## ', '')}</div>;
                        }
                        if (line.startsWith('### ')) {
                          return <div key={idx} className="font-display font-medium text-emerald-500 text-sm mt-3 mb-1">{line.replace('### ', '')}</div>;
                        }
                        if (line.startsWith('* [ ]') || line.startsWith('- [ ]')) {
                          return <div key={idx} className="flex items-start gap-2 text-xs font-mono py-0.5 text-zinc-300"><span className="text-zinc-500 uppercase mt-0.5 font-bold">[ ]</span> {line.substring(5)}</div>;
                        }
                        if (line.startsWith('* ') || line.startsWith('- ')) {
                          return <div key={idx} className="list-item ml-4 pl-1 text-zinc-300 text-xs">{line.substring(2)}</div>;
                        }
                        return <p key={idx} className="text-zinc-300 text-xs leading-relaxed">{line}</p>;
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Direct Q&A with NotebookLM Module */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-400 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  Q&A Source Queries
                </h4>

                {/* Q&A chat loop */}
                <div className="space-y-4 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 min-h-[160px] max-h-[300px] overflow-y-auto">
                  {qaLog.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-6 text-zinc-600">
                      <HelpCircle className="w-8 h-8 opacity-20 mb-2" />
                      <p className="text-xs font-mono">Ask specific details, like "What is the core protocol in workspace handbook?"</p>
                    </div>
                  ) : (
                    qaLog.map((chat) => (
                      <div 
                        key={chat.id} 
                        className={`flex flex-col ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div className="text-[9px] font-mono text-zinc-600 mb-0.5 px-1 uppercase">
                          {chat.sender === 'user' ? 'Me' : 'NotebookLM AI'}
                        </div>
                        <div 
                          className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed select-text ${
                            chat.sender === 'user' 
                              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' 
                              : 'bg-emerald-950/20 text-emerald-100 border border-emerald-900/40'
                          }`}
                        >
                          {chat.text}
                        </div>
                      </div>
                    ))
                  )}

                  {notebookLoading && (
                    <div className="flex items-start gap-2">
                      <div className="p-2 bg-emerald-950/20 text-emerald-400 rounded-xl flex items-center gap-1.5 text-xs font-mono animate-pulse border border-emerald-900/30">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Scanning dossiers and chats...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>
            </div>

            {/* Q&A Input Panel */}
            <form onSubmit={submitQuestion} className="p-4 bg-zinc-900 border-t border-zinc-800 flex gap-2">
              <input
                type="text"
                value={qaQuery}
                onChange={(e) => setQaQuery(e.target.value)}
                disabled={notebookLoading || loading}
                placeholder="Ask NotebookLM details on project..."
                className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={notebookLoading || loading || !qaQuery.trim()}
                className="p-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-bold rounded-xl transition flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
