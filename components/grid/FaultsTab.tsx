'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

type Severity = 'INFO' | 'WARNING' | 'FAULT';

interface EventEntry {
  time: string;
  subsystem: string;
  severity: Severity;
  event: string;
}

const SUBSYSTEMS = [
  { name: 'Solar Array',      metric: '6.0 kW',      updated: '00:00:01' },
  { name: 'Battery Pack',     metric: '62% SOC',     updated: '00:00:01' },
  { name: 'Grid Inverter',    metric: '98.2% eff',   updated: '00:00:01' },
  { name: 'Grid Connection',  metric: '50.00 Hz',    updated: '00:00:02' },
];

const MOCK_EVENTS: EventEntry[] = [
  { time: '14:32:01', subsystem: 'Solar Array',     severity: 'INFO',    event: 'MPPT algorithm adjusted tracking angle by +2.1°' },
  { time: '14:28:44', subsystem: 'Battery Pack',    severity: 'WARNING', event: 'Cell #7 voltage deviation: +18 mV above mean' },
  { time: '14:25:10', subsystem: 'Grid Connection', severity: 'INFO',    event: 'Grid frequency: 50.023 Hz (+0.023 Hz drift)' },
  { time: '14:19:55', subsystem: 'Grid Inverter',   severity: 'INFO',    event: 'THD measurement: 1.8% — within EN 50160 limits' },
  { time: '14:11:30', subsystem: 'Battery Pack',    severity: 'INFO',    event: 'Cell balancing cycle completed — δV: 4 mV' },
  { time: '13:58:02', subsystem: 'Solar Array',     severity: 'WARNING', event: 'Partial shading detected on string 2 — output –14%' },
];

const SEVERITY_STYLES: Record<Severity, string> = {
  INFO:    'bg-[#1a1a1a] text-[#888]',
  WARNING: 'bg-amber-500/10 text-amber-400',
  FAULT:   'bg-red-500/10 text-red-400',
};

export function FaultsTab() {
  const [injected, setInjected] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Subsystem health cards */}
      <div>
        <div className="font-mono text-[9px] text-[#444] tracking-widest uppercase mb-3">Subsystem Health</div>
        <div className="grid grid-cols-2 gap-3">
          {SUBSYSTEMS.map((sys, i) => {
            const isWarning = injected === sys.name;
            const statusLabel = isWarning ? 'WARNING' : 'NOMINAL';
            const statusColor = isWarning ? '#F59E0B' : '#00D084';
            const borderColor = isWarning ? 'border-amber-500/40' : 'border-[#1a1a1a]';

            return (
              <motion.div
                key={sys.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`bg-[#0a0a0a] border ${borderColor} rounded-xl p-4 transition-colors duration-300`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="font-heading font-bold text-frost text-sm">{sys.name}</div>
                  <div
                    className="flex items-center gap-1.5 rounded-full px-2 py-0.5"
                    style={{ backgroundColor: `${statusColor}15` }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: statusColor,
                        animation: isWarning ? 'pulse 1s ease-in-out infinite' : 'none',
                      }}
                    />
                    <span className="font-mono text-[9px] tracking-widest" style={{ color: statusColor }}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                <div className="font-heading font-black text-xl mb-1" style={{ color: statusColor }}>
                  {sys.metric}
                </div>
                <div className="font-mono text-[9px] text-[#333] tracking-widest">
                  LAST UPDATED {sys.updated} AGO
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Fault Injection Panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="bg-[#0a0a0a] border border-amber-500/20 rounded-xl p-5"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[9px] tracking-widest text-amber-400">⚠</span>
          <span className="font-mono text-[10px] text-amber-400 tracking-widest uppercase font-bold">
            Fault Injection — Test Mode
          </span>
        </div>
        <p className="font-mono text-[9px] text-[#444] tracking-wide mb-4">
          Inject a synthetic warning into a subsystem to test alarm routing and response procedures.
        </p>

        <div className="flex flex-wrap gap-2">
          {SUBSYSTEMS.map(sys => (
            <button
              key={sys.name}
              onClick={() => setInjected(sys.name)}
              className={`font-mono text-[10px] tracking-widest px-3 py-2 rounded-lg border transition-all duration-200 ${
                injected === sys.name
                  ? 'border-amber-500 bg-amber-500/15 text-amber-400'
                  : 'border-amber-500/30 text-[#666] hover:border-amber-500/60 hover:text-amber-500/80'
              }`}
            >
              {injected === sys.name && <span className="mr-1">⚠</span>}
              {sys.name}
            </button>
          ))}

          <button
            onClick={() => setInjected(null)}
            className="font-mono text-[10px] tracking-widest px-3 py-2 rounded-lg border border-[#333] text-[#555] hover:border-[#555] hover:text-[#888] transition-all duration-200 ml-auto"
          >
            CLEAR ALL
          </button>
        </div>

        {injected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 bg-amber-500/5 border border-amber-500/20 rounded-lg px-4 py-3"
          >
            <span className="font-mono text-[10px] text-amber-400">
              WARNING ACTIVE: {injected} — simulated fault condition engaged. Review event log for details.
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Event Log */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#111]">
          <span className="font-mono text-[10px] text-[#444] tracking-widest uppercase">Event Log</span>
          <span className="font-mono text-[9px] text-[#333]">{MOCK_EVENTS.length} ENTRIES</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#111]">
                {['Time', 'Subsystem', 'Severity', 'Event'].map(col => (
                  <th key={col} className="px-5 py-2.5 text-left font-mono text-[9px] text-[#333] tracking-widest uppercase">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_EVENTS.map((entry, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.06 }}
                  className="border-b border-[#0d0d0d] hover:bg-[#0f0f0f] transition-colors"
                >
                  <td className="px-5 py-3 font-mono text-[10px] text-[#555] whitespace-nowrap">{entry.time}</td>
                  <td className="px-5 py-3 font-mono text-[10px] text-[#888] whitespace-nowrap">{entry.subsystem}</td>
                  <td className="px-5 py-3">
                    <span className={`font-mono text-[9px] tracking-widest px-2 py-0.5 rounded ${SEVERITY_STYLES[entry.severity]}`}>
                      {entry.severity}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-[10px] text-[#666]">{entry.event}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
