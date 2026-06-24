'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ACCENT = '#06B6D4';

interface FaultRecord {
  id: string;
  timestamp: string;
  relay: string;
  type: string;
  magnitude: string;
  duration: string;
  cleared: boolean;
  breakers: string;
  severity: 'LOW' | 'MED' | 'HIGH' | 'CRIT';
}

const SEED_RECORDS: FaultRecord[] = [
  { id: 'F-0041', timestamp: '2026-06-24 19:44:02', relay: '50/51', type: 'Overcurrent', magnitude: '2,380 A (2.8× nom)', duration: '48 ms', cleared: true, breakers: 'B1, B2, B3', severity: 'CRIT' },
  { id: 'F-0040', timestamp: '2026-06-24 17:12:39', relay: 'ROCOV', type: 'dV/dt Event', magnitude: '7.2 kV/s', duration: '23 ms', cleared: true, breakers: 'B2, B3', severity: 'HIGH' },
  { id: 'F-0039', timestamp: '2026-06-24 14:05:11', relay: '67', type: 'Reverse Power', magnitude: '-0.41 p.u.', duration: '62 ms', cleared: true, breakers: 'B1', severity: 'MED' },
  { id: 'F-0038', timestamp: '2026-06-23 22:30:55', relay: '50/51', type: 'Overcurrent', magnitude: '1,540 A (1.81× nom)', duration: '81 ms', cleared: true, breakers: 'B3', severity: 'HIGH' },
  { id: 'F-0037', timestamp: '2026-06-23 09:17:28', relay: 'ROCOV', type: 'dV/dt Event', magnitude: '4.1 kV/s', duration: '14 ms', cleared: true, breakers: 'None (below trip)', severity: 'LOW' },
  { id: 'F-0036', timestamp: '2026-06-22 15:44:00', relay: '50/51', type: 'Overcurrent', magnitude: '3,100 A (3.6× nom)', duration: '37 ms', cleared: true, breakers: 'B1, B2, B3', severity: 'CRIT' },
  { id: 'F-0035', timestamp: '2026-06-21 08:02:14', relay: '67', type: 'Reverse Power', magnitude: '-0.22 p.u.', duration: '105 ms', cleared: false, breakers: 'B1', severity: 'MED' },
  { id: 'F-0034', timestamp: '2026-06-20 20:11:44', relay: 'ROCOV', type: 'dV/dt Event', magnitude: '5.8 kV/s', duration: '29 ms', cleared: true, breakers: 'B2', severity: 'HIGH' },
];

function severityColor(s: FaultRecord['severity']) {
  if (s === 'CRIT') return '#EF4444';
  if (s === 'HIGH') return '#F59E0B';
  if (s === 'MED')  return '#06B6D4';
  return '#22C55E';
}

export function FaultLogTab() {
  const [records, setRecords] = useState<FaultRecord[]>(SEED_RECORDS);
  const [filter, setFilter] = useState<'ALL' | 'CRIT' | 'HIGH' | 'MED' | 'LOW'>('ALL');
  const [search, setSearch] = useState('');
  const [showCleared, setShowCleared] = useState(true);

  const filtered = records.filter(r => {
    if (filter !== 'ALL' && r.severity !== filter) return false;
    if (!showCleared && r.cleared) return false;
    if (search && !r.type.toLowerCase().includes(search.toLowerCase()) && !r.relay.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const clearRecord = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, cleared: true } : r));
  };

  const stats = {
    total: records.length,
    crit:  records.filter(r => r.severity === 'CRIT').length,
    uncleared: records.filter(r => !r.cleared).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-black text-frost text-2xl">Fault Log</h2>
          <p className="font-mono text-[#444] text-xs mt-1">IEC 61850 GOOSE · disturbance recording · {records.length} events total</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'TOTAL EVENTS', val: stats.total, color: ACCENT },
          { label: 'CRITICAL', val: stats.crit, color: '#EF4444' },
          { label: 'UNCLEARED', val: stats.uncleared, color: '#F59E0B' },
          { label: 'MTBF', val: '42h', color: '#22C55E' },
        ].map(s => (
          <div key={s.label} className="border border-[#1a1a1a] rounded-xl p-4 bg-[#080808]">
            <p className="font-mono text-[#444] text-[9px] tracking-widest uppercase mb-1">{s.label}</p>
            <p className="font-heading font-black text-2xl" style={{ color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {(['ALL', 'CRIT', 'HIGH', 'MED', 'LOW'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1 rounded-full font-mono text-[9px] tracking-widest border transition-colors"
            style={filter === f
              ? { borderColor: ACCENT, backgroundColor: `${ACCENT}20`, color: ACCENT }
              : { borderColor: '#1a1a1a', color: '#444' }}
          >
            {f}
          </button>
        ))}
        <div className="flex-1 min-w-[160px]">
          <input
            type="text"
            placeholder="Search relay / type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg px-3 py-1.5 font-mono text-[10px] text-[#888] placeholder:text-[#333] outline-none focus:border-[#06B6D440]"
          />
        </div>
        <label className="flex items-center gap-1.5 font-mono text-[9px] text-[#444] cursor-pointer">
          <input type="checkbox" checked={showCleared} onChange={e => setShowCleared(e.target.checked)} className="accent-[#06B6D4]" />
          SHOW CLEARED
        </label>
      </div>

      {/* Table */}
      <div className="border border-[#1a1a1a] rounded-xl bg-[#080808] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#111]">
                {['ID', 'TIMESTAMP', 'RELAY', 'TYPE', 'MAGNITUDE', 'DURATION', 'BREAKERS', 'SEV', 'STATUS', ''].map(h => (
                  <th key={h} className="px-3 py-3 text-left font-mono text-[#333] text-[8px] tracking-widest whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-[#0d0d0d] hover:bg-[#0d0d0d] transition-colors"
                  >
                    <td className="px-3 py-3 font-mono text-[10px]" style={{ color: ACCENT }}>{r.id}</td>
                    <td className="px-3 py-3 font-mono text-[#444] text-[9px] whitespace-nowrap">{r.timestamp}</td>
                    <td className="px-3 py-3 font-mono text-[10px] text-[#888]">{r.relay}</td>
                    <td className="px-3 py-3 font-mono text-[10px] text-frost whitespace-nowrap">{r.type}</td>
                    <td className="px-3 py-3 font-mono text-[10px] text-[#666] whitespace-nowrap">{r.magnitude}</td>
                    <td className="px-3 py-3 font-mono text-[10px] text-[#555]">{r.duration}</td>
                    <td className="px-3 py-3 font-mono text-[9px] text-[#444]">{r.breakers}</td>
                    <td className="px-3 py-3">
                      <span
                        className="font-mono text-[8px] px-1.5 py-0.5 rounded border"
                        style={{ color: severityColor(r.severity), borderColor: `${severityColor(r.severity)}30`, backgroundColor: `${severityColor(r.severity)}10` }}
                      >
                        {r.severity}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`font-mono text-[8px] ${r.cleared ? 'text-[#333]' : 'text-[#F59E0B]'}`}>
                        {r.cleared ? 'CLEARED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {!r.cleared && (
                        <button
                          onClick={() => clearRecord(r.id)}
                          className="font-mono text-[8px] text-[#444] hover:text-[#888] transition-colors border border-[#1a1a1a] px-2 py-0.5 rounded"
                        >
                          CLEAR
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center font-mono text-[#333] text-xs">No matching records.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export */}
      <div className="flex gap-2">
        <button className="px-4 py-2 rounded-lg font-mono text-[10px] tracking-widest border border-[#06B6D430] text-[#06B6D4] bg-[#06B6D408] hover:bg-[#06B6D415] transition-colors">
          EXPORT CSV
        </button>
        <button className="px-4 py-2 rounded-lg font-mono text-[10px] tracking-widest border border-[#1a1a1a] text-[#444] hover:text-[#888] transition-colors">
          IEC 61850 XML
        </button>
      </div>
    </div>
  );
}
