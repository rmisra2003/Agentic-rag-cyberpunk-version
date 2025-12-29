'use client';

import React, { useEffect, useRef } from 'react';
import { ChevronRight, Terminal } from 'lucide-react';

interface ExecutionStreamProps {
  steps: string[];
}

const ExecutionStream: React.FC<ExecutionStreamProps> = ({ steps }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom logic
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [steps]);

  return (
    <div className="flex flex-col h-full bg-slate-950/50 border-l border-cyan-900/30 font-mono text-[10px]">
      {/* Header */}
      <div className="p-3 border-b border-cyan-900/30 flex items-center justify-between bg-slate-900/80 backdrop-blur">
        <div className="flex items-center gap-2 text-cyan-500">
          <Terminal className="w-3 h-3" />
          <span className="font-bold tracking-widest uppercase text-cyan-400">Execution Log</span>
        </div>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/20" />
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
        </div>
      </div>

      {/* Log Feed */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
      >
        {steps.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-2">
            <div className="w-8 h-8 border border-cyan-500/30 rounded flex items-center justify-center">
              <div className="w-1 h-1 bg-cyan-500 animate-ping" />
            </div>
            <p className="text-cyan-400 tracking-widest">AWAITING SEQUENCE</p>
          </div>
        ) : (
          steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            // Create a stable ID based on index
            const stepId = idx.toString().padStart(3, '0');
            
            return (
              <div 
                key={`${idx}-${step}`} 
                className={`group animate-in fade-in slide-in-from-left-2 duration-500 ${
                  isLast ? 'opacity-100' : 'opacity-60 hover:opacity-100 transition-opacity'
                }`}
              >
                <div className="flex gap-3">
                  {/* Line Number / ID */}
                  <div className="mt-0.5 text-cyan-800 select-none">
                    {`0x${stepId}`}
                  </div>

                  <div className="flex-1 space-y-1">
                    {/* The Log Message */}
                    <div className={`flex items-start gap-2 leading-tight break-words ${
                      isLast ? 'text-cyan-300 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'text-cyan-600'
                    }`}>
                      <ChevronRight className={`w-3 h-3 mt-0.5 flex-shrink-0 ${isLast ? 'text-cyan-400' : 'text-cyan-900'}`} />
                      <span>{step}</span>
                    </div>

                    {/* Active Progress Bar (Only for the last item) */}
                    {isLast && (
                      <div className="relative h-0.5 w-full bg-cyan-900/30 mt-2 overflow-hidden rounded-full">
                        <div className="absolute inset-0 bg-cyan-500/50 animate-[progress_1.5s_ease-in-out_infinite]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Metrics */}
      <div className="p-2 border-t border-cyan-900/30 bg-black/40 text-[9px] text-cyan-900 flex justify-between uppercase tracking-wider">
        <span>PID: 8492</span>
        <span>MEM: 14%</span>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default ExecutionStream;