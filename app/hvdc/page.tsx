'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CursorDot } from '@/components/CursorDot';
import { LineStatusTab } from '@/components/hvdc/LineStatusTab';
import { WaveformsTab } from '@/components/hvdc/WaveformsTab';
import { ProtectionTab } from '@/components/hvdc/ProtectionTab';
import { FaultLogTab } from '@/components/hvdc/FaultLogTab';
import { SchematicTab } from '@/components/hvdc/SchematicTab';

type Tab = 'line' | 'waveforms' | 'protection' | 'faultlog' | 'schematic';

const TABS: { id: Tab; label: string; badge?: string }[] = [
  { id: 'line',       label: 'Line Status',  badge: 'LIVE' },
  { id: 'waveforms',  label: 'Waveforms',    badge: 'LIVE' },
  { id: 'protection', label: 'Protection' },
  { id: 'faultlog',   label: 'Fault Log' },
  { id: 'schematic',  label: 'Schematic',    badge: 'IEC' },
];

const ACCENT = '#06B6D4';

export default function HVDCPage() {
  const [activeTab, setActiveTab] = useState<Tab>('line');

  return (
    <>
      <CursorDot />
      <div className="min-h-screen bg-[#050505] text-frost">
        <div className="border-b border-[#111] bg-[#050505]/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-6 py-4">
              <a href="/" className="font-mono text-[10px] text-[#444] hover:text-[#888] tracking-widest uppercase transition-colors flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                Portfolio
              </a>
              <div className="w-px h-4 bg-[#1a1a1a]" />
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-sm flex items-center justify-center" style={{ backgroundColor: ACCENT }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                </div>
                <span className="font-heading font-black text-frost text-lg tracking-tight">HVDC</span>
                <span className="font-heading font-black text-lg tracking-tight" style={{ color: ACCENT }}>Breaker</span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-1.5 border border-[#1a1a1a] rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: ACCENT }} />
                <span className="font-mono text-[9px] text-[#444] tracking-widest">PROTECTION · LIVE SIM</span>
              </div>
            </div>
            <div className="flex items-center gap-1 pb-0 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-4 py-3 font-mono text-xs tracking-wider transition-colors whitespace-nowrap ${activeTab === tab.id ? 'text-frost' : 'text-[#444] hover:text-[#888]'}`}
                >
                  {tab.label}
                  {tab.badge && (
                    <span className={`text-[8px] px-1 rounded font-mono ${activeTab === tab.id ? 'text-white' : 'bg-[#1a1a1a] text-[#444]'}`}
                      style={activeTab === tab.id ? { backgroundColor: ACCENT } : {}}>
                      {tab.badge}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <motion.div layoutId="hvdc-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: ACCENT }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            {activeTab === 'line' && (
              <motion.div key="line" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <LineStatusTab />
              </motion.div>
            )}
            {activeTab === 'waveforms' && (
              <motion.div key="waveforms" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <WaveformsTab />
              </motion.div>
            )}
            {activeTab === 'protection' && (
              <motion.div key="protection" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <ProtectionTab />
              </motion.div>
            )}
            {activeTab === 'faultlog' && (
              <motion.div key="faultlog" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <FaultLogTab />
              </motion.div>
            )}
            {activeTab === 'schematic' && (
              <motion.div key="schematic" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <SchematicTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
