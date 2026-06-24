'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CursorDot } from '@/components/CursorDot';
import { TrackViewTab } from '@/components/solar/TrackViewTab';
import { EnergyYieldTab } from '@/components/solar/EnergyYieldTab';
import { PerformanceTab } from '@/components/solar/PerformanceTab';

type Tab = 'track' | 'yield' | 'performance';

const TABS: { id: Tab; label: string; badge?: string }[] = [
  { id: 'track',       label: 'Track View',   badge: 'LIVE' },
  { id: 'yield',       label: 'Energy Yield' },
  { id: 'performance', label: 'Performance' },
];

export default function SolarPage() {
  const [activeTab, setActiveTab] = useState<Tab>('track');

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
                  <div className="w-6 h-6 bg-[#F59E0B] rounded-sm flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="white" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                  <span className="font-heading font-black text-white text-lg tracking-tight">Solar</span>
                  <span className="font-heading font-black text-[#F59E0B] text-lg tracking-tight">Command</span>
                </div>
              </div>

              <div className="flex-1" />

              <div className="flex items-center gap-1.5 border border-[#1a1a1a] rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
                <span className="font-mono text-[9px] text-[#444] tracking-widest">SUN TRACKING · LIVE</span>
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
                        ? 'bg-[#F59E0B] text-black'
                        : 'bg-[#1a1a1a] text-[#444]'
                    }`}>{tab.badge}</span>
                  )}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="solar-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F59E0B]"
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
            {activeTab === 'track' && (
              <motion.div
                key="track"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <TrackViewTab />
              </motion.div>
            )}

            {activeTab === 'yield' && (
              <motion.div
                key="yield"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h1 className="font-heading font-black text-2xl text-frost">Energy Yield</h1>
                  <p className="text-[#444] font-mono text-xs mt-1">Annual yield comparison · fixed vs single-axis vs dual-axis tracking</p>
                </div>
                <EnergyYieldTab />
              </motion.div>
            )}

            {activeTab === 'performance' && (
              <motion.div
                key="performance"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h1 className="font-heading font-black text-2xl text-frost">Performance Analysis</h1>
                  <p className="text-[#444] font-mono text-xs mt-1">Temperature derate · efficiency losses · performance ratio</p>
                </div>
                <PerformanceTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
