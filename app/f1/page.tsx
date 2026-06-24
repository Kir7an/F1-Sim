'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CursorDot } from '@/components/CursorDot';
import { OverviewTab } from '@/components/f1/OverviewTab';
import { CalendarTab } from '@/components/f1/CalendarTab';
import { StrategyLab } from '@/components/f1/StrategyLab';
import { RaceSim } from '@/components/f1/RaceSim';

type Tab = 'overview' | 'calendar' | 'strategy' | 'race';

const TABS: { id: Tab; label: string; badge?: string }[] = [
  { id: 'overview',  label: 'Championship',  badge: '2025' },
  { id: 'calendar',  label: 'Race Calendar' },
  { id: 'strategy',  label: 'Strategy Lab',  badge: 'SIM' },
  { id: 'race',      label: 'Race Sim',      badge: '20 CARS' },
];

export default function F1Page() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <>
      <CursorDot />
      <div className="min-h-screen bg-[#050505] text-frost">
        {/* Header */}
        <div className="border-b border-[#111] bg-[#050505]/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-6 py-4">
              <a
                href="/"
                className="font-mono text-[10px] text-[#444] hover:text-[#888] tracking-widest uppercase transition-colors flex items-center gap-1.5"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Portfolio
              </a>

              <div className="w-px h-4 bg-[#1a1a1a]" />

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-[#E8002D] rounded-sm flex items-center justify-center">
                    <span className="font-heading font-black text-white text-[9px]">F1</span>
                  </div>
                  <span className="font-heading font-black text-frost text-lg tracking-tight">Strategy</span>
                  <span className="font-heading font-black text-[#E8002D] text-lg tracking-tight">Command</span>
                </div>
              </div>

              <div className="flex-1" />

              <div className="flex items-center gap-1.5 border border-[#1a1a1a] rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8002D] animate-pulse" />
                <span className="font-mono text-[9px] text-[#444] tracking-widest">LIVE DATA · OPENF1</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 pb-0 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-4 py-3 font-mono text-xs tracking-wider transition-colors whitespace-nowrap ${
                    activeTab === tab.id ? 'text-frost' : 'text-[#444] hover:text-[#888]'
                  }`}
                >
                  {tab.label}
                  {tab.badge && (
                    <span className={`text-[8px] px-1 rounded font-mono ${
                      activeTab === tab.id
                        ? 'bg-[#E8002D] text-white'
                        : 'bg-[#1a1a1a] text-[#444]'
                    }`}>{tab.badge}</span>
                  )}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="f1-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8002D]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <OverviewTab />
              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h1 className="font-heading font-black text-2xl text-frost">Race Calendar</h1>
                  <p className="text-[#444] font-mono text-xs mt-1">2024, 2025 &amp; 2026 seasons · live via OpenF1 API</p>
                </div>
                <CalendarTab />
              </motion.div>
            )}

            {activeTab === 'strategy' && (
              <motion.div
                key="strategy"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h1 className="font-heading font-black text-2xl text-frost">
                    Strategy Lab
                    <span className="ml-2 text-sm font-mono font-normal text-[#E8002D]">SIM ENGINE v2.0</span>
                  </h1>
                  <p className="text-[#444] font-mono text-xs mt-1">
                    Configure tire stints · simulate race outcomes · visualise in 3D
                  </p>
                </div>
                <StrategyLab />
              </motion.div>
            )}

            {activeTab === 'race' && (
              <motion.div
                key="race"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h1 className="font-heading font-black text-2xl text-frost">
                    Race Simulator
                    <span className="ml-2 text-sm font-mono font-normal text-[#FFD700]">20 CARS</span>
                  </h1>
                  <p className="text-[#444] font-mono text-xs mt-1">
                    Tune your car setup · race against 19 AI opponents from the 2025 F1 grid
                  </p>
                </div>
                <RaceSim />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
