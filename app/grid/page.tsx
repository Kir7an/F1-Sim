'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CursorDot } from '@/components/CursorDot';
import { PowerFlowTab } from '@/components/grid/PowerFlowTab';
import { AnalyticsTab } from '@/components/grid/AnalyticsTab';
import { FaultsTab } from '@/components/grid/FaultsTab';

type Tab = 'flow' | 'analytics' | 'faults';

const TABS: { id: Tab; label: string; badge?: string }[] = [
  { id: 'flow',      label: 'Power Flow',    badge: 'LIVE' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'faults',    label: 'System Status' },
];

export default function GridPage() {
  const [activeTab, setActiveTab] = useState<Tab>('flow');

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
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Portfolio
              </a>

              <div className="w-px h-4 bg-[#1a1a1a]" />

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-[#00D084] rounded-sm flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>
                  <span className="font-heading font-black text-frost text-lg tracking-tight">Grid</span>
                  <span className="font-heading font-black text-[#00D084] text-lg tracking-tight">Commander</span>
                </div>
              </div>

              <div className="flex-1" />

              <div className="flex items-center gap-1.5 border border-[#1a1a1a] rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D084] animate-pulse" />
                <span className="font-mono text-[9px] text-[#444] tracking-widest">MICROGRID · LIVE SIM</span>
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
                        ? 'bg-[#00D084] text-[#050505]'
                        : 'bg-[#1a1a1a] text-[#444]'
                    }`}>{tab.badge}</span>
                  )}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="grid-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D084]"
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
            {activeTab === 'flow' && (
              <motion.div
                key="flow"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <PowerFlowTab />
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h1 className="font-heading font-black text-2xl text-frost">Energy Analytics</h1>
                  <p className="text-[#444] font-mono text-xs mt-1">24-hour profile · 15-minute resolution · simulated data</p>
                </div>
                <AnalyticsTab />
              </motion.div>
            )}

            {activeTab === 'faults' && (
              <motion.div
                key="faults"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h1 className="font-heading font-black text-2xl text-frost">
                    System Status
                    <span className="ml-2 text-sm font-mono font-normal text-[#00D084]">SCADA MONITOR</span>
                  </h1>
                  <p className="text-[#444] font-mono text-xs mt-1">
                    Subsystem health · fault injection · event log
                  </p>
                </div>
                <FaultsTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
