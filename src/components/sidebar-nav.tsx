'use client';

import React from 'react';
import { Cpu, Database, Settings, Shield, Power, Gauge, Binary } from 'lucide-react';

const SidebarNav: React.FC = () => {
  const navItems = [
    { icon: Cpu, label: 'CORE', active: true },
    { icon: Database, label: 'DATA', active: false },
    { icon: Gauge, label: 'OPS', active: false },
    { icon: Binary, label: 'LIBS', active: false },
    { icon: Shield, label: 'SEC', active: false },
    { icon: Settings, label: 'CONF', active: false },
  ];

  return (
    <nav className="w-20 bg-slate-950/50 border-r border-cyan-900/30 flex flex-col items-center py-6 gap-8 z-30 h-full backdrop-blur-sm">
      {/* Power / System Button */}
      <div className="w-10 h-10 rounded-full bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-center mb-4 group cursor-pointer hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
        <Power className="w-4 h-4 text-cyan-600 group-hover:text-cyan-400 transition-colors" />
      </div>

      <div className="flex-1 flex flex-col gap-6 w-full px-2">
        {navItems.map((item) => (
          <button 
            key={item.label}
            className={`group relative flex flex-col items-center gap-1 transition-all w-full ${
              item.active ? 'text-cyan-400' : 'text-slate-600 hover:text-cyan-600'
            }`}
          >
            <div className={`p-2 rounded-lg transition-all ${
              item.active 
                ? 'bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50' 
                : 'hover:bg-cyan-950/30'
            }`}>
              <item.icon className="w-5 h-5" />
            </div>
            
            <span className={`text-[8px] font-bold tracking-widest uppercase transition-colors ${
              item.active ? 'text-cyan-300' : 'opacity-0 group-hover:opacity-100'
            }`}>
              {item.label}
            </span>

            {/* Active Indicator Line */}
            {item.active && (
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-cyan-500 rounded-r shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            )}
          </button>
        ))}
      </div>

      {/* Footer Visuals */}
      <div className="mt-auto flex flex-col items-center gap-4 pb-4 w-full">
        <div className="w-0.5 h-12 bg-slate-800 rounded-full overflow-hidden relative">
          <div className="absolute top-0 w-full h-1/2 bg-cyan-500/50 animate-[bounce_3s_infinite_ease-in-out]" />
        </div>
        <div className="text-[8px] text-cyan-900 font-bold rotate-180 writing-vertical-rl tracking-[0.3em] opacity-40">
          SYS_OS_V4
        </div>
      </div>
    </nav>
  );
};

export default SidebarNav;