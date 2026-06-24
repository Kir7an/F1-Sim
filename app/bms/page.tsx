'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CursorDot } from '@/components/CursorDot';
import { PackOverviewTab } from '@/components/bms/PackOverviewTab';
import { ThermalTab } from '@/components/bms/ThermalTab';
import { DegradationTab } from '@/components/bms/DegradationTab';

type Tab = 'pack' | 'thermal' | 'degradation' | 'charge';

const TABS: { id: Tab; label: string; badge?: string }[] = [
  { id: 'pack',        label: 'Pack Overview',  badge: 'LIVE' },
  { id: 'thermal',     label: 'Thermal Map' },
  { id: 'degradation', label: 'Degradation' },
  { id: 'charge',      label: 'Charge Curves' },
];

const ACCENT = '#3B82F6';

export default function BMSPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pack');

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
                  <div
                    className="w-6 h-6 rounded-sm flex items-center justify-center"
                    style={{ backgroundColor: ACCENT }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <rect x="2" y="7" width="18" height="11" rx="2" />
                      <path d="M22 11v3" />
                    </svg>
                  </div>
                  <span className="font-heading font-black text-frost text-lg tracking-tight">BMS</span>
                  <span className="font-heading font-black text-lg tracking-tight" style={{ color: ACCENT }}>Lab</span>
                </div>
              </div>

              <div className="flex-1" />

              <div className="flex items-center gap-1.5 border border-[#1a1a1a] rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: ACCENT }} />
                <span className="font-mono text-[9px] text-[#444] tracking-widest">BATTERY · LIVE SIM</span>
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
                    <span
                      className={`text-[8px] px-1 rounded font-mono ${
                        activeTab === tab.id ? 'text-white' : 'bg-[#1a1a1a] text-[#444]'
                      }`}
                      style={activeTab === tab.id ? { backgroundColor: ACCENT } : {}}
                    >
                      {tab.badge}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="bms-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: ACCENT }}
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
            {activeTab === 'pack' && (
              <motion.div
                key="pack"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <PackOverviewTab />
              </motion.div>
            )}

            {activeTab === 'thermal' && (
              <motion.div
                key="thermal"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <ThermalTab />
              </motion.div>
            )}

            {activeTab === 'degradation' && (
              <motion.div
                key="degradation"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <DegradationTab />
              </motion.div>
            )}

            {activeTab === 'charge' && (
              <motion.div
                key="charge"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-center min-h-[400px]">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="border border-[#1a1a1a] rounded-xl p-12 text-center max-w-md"
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: `${ACCENT}15`, border: `1px solid ${ACCENT}30` }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5">
                        <polyline points="13 2 13 9 19 9 11 22 11 15 5 15 13 2" />
                      </svg>
                    </div>
                    <h3 className="font-heading font-black text-frost text-xl mb-2">Charge Curves</h3>
                    <p className="font-mono text-[#444] text-xs leading-relaxed mb-4">
                      CC/CV charging profiles, C-rate analysis, and multi-cycle overlay charts are under development.
                    </p>
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[10px] tracking-widest"
                      style={{ backgroundColor: `${ACCENT}10`, color: ACCENT, border: `1px solid ${ACCENT}20` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      COMING SOON
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
