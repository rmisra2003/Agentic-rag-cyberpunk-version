'use client';

import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

// Make sure these paths match where you saved the files
import SidebarNav from '@/components/sidebar-nav';
import ChatInterface from '@/components/chat-interface';
import ExecutionStream from '@/components/execution-stream';

export default function Dashboard() {
  // Shared state: The Chat sends logs here, and the Stream displays them
  const [steps, setSteps] = useState<string[]>([
    "INITIALIZING SYSTEM CORE...",
    "ESTABLISHING SECURE CONNECTION...",
    "READY FOR INPUT."
  ]);

  // Simulated background activity to keep the terminal looking "alive"
  useEffect(() => {
    const activities = [
      "SCRUBBING VECTOR CACHE...",
      "OPTIMIZING RETRIEVAL ENGINE...",
      "MONITORING SYSTEM THROUGHPUT...",
      "SCANNING FOR INTRUSIONS...",
      "CALIBRATING NEURAL WEIGHTS...",
      "SYNCING DISTRIBUTED NODES..."
    ];

    const interval = setInterval(() => {
      setSteps(prev => {
        // Keep logs clean (max 50 lines) to prevent memory issues
        const newLogs = [...prev, activities[Math.floor(Math.random() * activities.length)]];
        return newLogs.slice(-50);
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const addExecutionStep = (step: string) => {
    setSteps(prev => [...prev.slice(-50), step]);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden text-slate-400 font-sans selection:bg-cyan-500/20">
      {/* 1. Left Sidebar Navigation */}
      <SidebarNav />

      {/* 2. Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 border-x border-cyan-900/30 relative bg-slate-950/20 backdrop-blur-[2px]">
        <ChatInterface onNewStep={addExecutionStep} />
      </main>

      {/* 3. Right Execution Stream (Hidden on mobile) */}
      <aside className="w-80 hidden lg:flex flex-col border-l border-cyan-900/30 bg-slate-950/50 backdrop-blur-md">

        {/* Stream Header */}
        <div className="p-4 border-b border-cyan-900/30 flex items-center justify-between bg-slate-900/20">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">Execution Log</span>
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,1)]" />
            <div className="w-2 h-2 rounded-full bg-slate-800" />
          </div>
        </div>

        {/* Stream Content */}
        <div className="flex-1 overflow-hidden relative">
          <ExecutionStream steps={steps} />
        </div>

        {/* System Diagnostics Footer */}
        <div className="p-4 border-t border-cyan-900/30 bg-slate-900/40">
          <div className="text-[10px] space-y-2">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-cyan-900">CPU LOAD</span>
                <span className="text-cyan-300">12%</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 w-[12%] shadow-[0_0_5px_rgba(6,182,212,0.5)] transition-all duration-1000"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-cyan-900">MEM USAGE</span>
                <span className="text-indigo-400">4.2 GB</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[45%] shadow-[0_0_5px_rgba(99,102,241,0.5)] transition-all duration-1000"></div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center opacity-50">
              <span className="text-[8px]">ENCRYPTION</span>
              <span className="text-[8px] text-emerald-500">AES-256 ACTIVE</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Floating System ID (Top Right Overlay) */}
      <div className="absolute top-4 right-4 pointer-events-none opacity-20 hidden sm:block z-50">
        <div className="text-[8px] text-right uppercase tracking-widest text-cyan-500">
          Build v4.0.22-alpha<br />
          Secure Node: #7719-X<br />
          Location: Sector 7G
        </div>
      </div>
    </div>
  );
}