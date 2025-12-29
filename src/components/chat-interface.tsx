'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from 'ai';
import { Upload, Send, Bot, User, Loader2, Terminal } from 'lucide-react';

// TypeScript interfaces for message parts
interface TextPart {
  type: 'text' | 'text-delta';
  text?: string;
  delta?: string;
}

interface ToolInvocationPart {
  type: 'tool-invocation';
  toolName: string;
  args?: any;
}

type MessagePart = TextPart | ToolInvocationPart;

interface ChatInterfaceProps {
  onNewStep: (step: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onNewStep }) => {
  // AI SDK v3 Hook
  const chatHook = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onError: (err) => {
      console.error("Chat error:", err);
    }
  });

  const { messages, status, error, sendMessage } = chatHook;
  const isLoading = status === 'submitted' || status === 'streaming';

  // Manual input state management
  const [input, setInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    onNewStep(`PROCESSING QUERY: "${input.slice(0, 30).toUpperCase()}${input.length > 30 ? '...' : ''}"`);

    // Use sendMessage from AI SDK v3
    sendMessage({ text: input });

    setInput('');
  };

  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 2. Real File Upload Logic (The Librarian)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    onNewStep(`INITIATING UPLOAD: ${file.name.toUpperCase()}...`);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Call the Next.js API route we built
      const res = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      onNewStep(`SUCCESS: ${file.name.toUpperCase()} INDEXED IN VECTOR STORE.`);
    } catch (err) {
      console.error(err);
      onNewStep(`ERROR: FAILED TO INGEST ${file.name.toUpperCase()}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Wrapper to trigger UI updates on submit
  const onSubmitWrapper = (e: React.FormEvent) => {
    handleSubmit(e);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/30">
      {/* Header */}
      <header className="p-4 border-b border-cyan-900/30 flex items-center justify-between bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-cyan-950 border border-cyan-500 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.4)]">
            <Bot className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest uppercase text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">
              RAG CONTROL ENGINE <span className="text-xs text-indigo-400 ml-2">V4.0</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-500/80 uppercase tracking-tighter">System Nominal</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`px-3 py-1.5 rounded border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-all flex items-center gap-2 text-xs uppercase tracking-wider group ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {isUploading ? 'INGESTING...' : 'INGEST DATA'}
          </button>
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.md,.json,.pdf"
          />
        </div>
      </header>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        {messages.map((msg: any, index: number) => (
          <div
            key={msg.id || index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 border-2 border-dotted border-yellow-500/50 p-2 my-2`}
          >
            <div className={`max-w-[85%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-sm border flex items-center justify-center ${msg.role === 'user'
                ? 'border-indigo-500 bg-indigo-950/30 text-indigo-400'
                : 'border-cyan-500 bg-cyan-950/30 text-cyan-400'
                }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-lg border text-sm leading-relaxed whitespace-pre-wrap font-mono ${msg.role === 'user'
                  ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-100 shadow-[0_0_10px_rgba(99,102,241,0.1)]'
                  : 'border-cyan-500/50 bg-cyan-500/10 text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                  }`}>
                  {(() => {
                    // AI SDK v3: Use parts array
                    const parts = (msg as any).parts || [];

                    // Check for tool invocations
                    const toolParts = parts.filter((p: any) => p.type === 'tool-invocation');
                    if (toolParts.length > 0) {
                      return (
                        <div className="space-y-2">
                          <div className="italic text-cyan-400/70 flex items-center gap-2">
                            <Terminal className="w-3 h-3" />
                            <span>EXECUTING TOOL: {toolParts[0].toolName}</span>
                          </div>
                        </div>
                      );
                    }

                    // Render text parts
                    const textContent = parts
                      .filter((p: any) => p.type === 'text')
                      .map((p: any) => p.text)
                      .join('');

                    if (textContent) return textContent;

                    // Fallback for empty messages
                    if (msg.role === 'assistant') {
                      return <span className="animate-pulse opacity-50">...PROCESSING DATA STREAM...</span>;
                    }

                    return '...';
                  })()}
                </div>
                {/* Remove debug log from render to avoid loop, use Overlay instead */}
                <span className="text-[9px] text-slate-500 uppercase tracking-tighter mt-1">
                  {(msg as any).createdAt ? new Date((msg as any).createdAt).toLocaleTimeString() : 'JUST NOW'} • {msg.role}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="flex gap-4 items-center">
              <div className="w-8 h-8 rounded-sm border border-cyan-500 bg-cyan-950/30 flex items-center justify-center text-cyan-400">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-cyan-500/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-cyan-500/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-slate-950 border-t border-cyan-900/30">
        <form onSubmit={onSubmitWrapper} className="relative max-w-4xl mx-auto group">
          <div className="absolute inset-0 bg-cyan-500/5 blur-xl group-focus-within:bg-cyan-500/10 transition-all pointer-events-none" />
          <div className="relative flex items-center bg-slate-900/80 border border-cyan-500/30 rounded-lg group-focus-within:border-cyan-500 transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <div className="pl-4 text-cyan-500 opacity-50">
              <Terminal className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="ENTER COMMAND OR QUERY..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-cyan-100 placeholder:text-cyan-900 text-sm px-4 py-4 uppercase font-mono"
              disabled={isLoading}
            />
            <div className="pr-4 flex items-center gap-2">
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 text-cyan-500 hover:text-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
        <div className="mt-3 text-center">
          <span className="text-[10px] text-cyan-900 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
            End-to-end encrypted • Neural-link established
          </span>
        </div>


      </div>
    </div>
  );
};

export default ChatInterface;