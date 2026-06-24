'use client';
import { motion } from 'framer-motion';
import { STANDINGS_2025, CONSTRUCTORS_2025 } from '@/lib/f1/api';
import { CIRCUITS } from '@/lib/f1/circuit-data';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

function NextRaceCountdown() {
  const now = new Date();
  const upcoming = CIRCUITS
    .filter(c => c.raceDate && new Date(c.raceDate) > now)
    .sort((a, b) => new Date(a.raceDate!).getTime() - new Date(b.raceDate!).getTime());

  const next = upcoming[0];
  if (!next) return null;

  const diff = new Date(next.raceDate!).getTime() - now.getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);

  return (
    <motion.div
      variants={fadeUp}
      className="border border-[#222] rounded-2xl p-6 bg-[#0d0d0d] relative overflow-hidden mb-8"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E8002D]/60 to-transparent" />
      <p className="font-mono text-[10px] text-[#555] tracking-widest uppercase mb-3">Next Race</p>
      <h2 className="font-heading font-black text-2xl text-frost mb-1">{next.flag} {next.name}</h2>
      <p className="text-[#666] text-sm mb-6">{next.shortName}, {next.country}</p>
      <div className="flex gap-8">
        {[
          { val: days, label: 'DAYS' },
          { val: hours, label: 'HRS' },
          { val: next.laps, label: 'LAPS' },
          { val: `${next.lapLengthKm}km`, label: 'LAP LENGTH' },
        ].map(({ val, label }) => (
          <div key={label}>
            <p className="font-heading font-black text-3xl text-amber">{val}</p>
            <p className="font-mono text-[10px] text-[#555] tracking-widest">{label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function OverviewTab() {
  const maxPts = STANDINGS_2025[0].points;
  const maxConPts = CONSTRUCTORS_2025[0].points;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Next race + driver standings */}
      <div>
        <NextRaceCountdown />

        {/* Driver Standings */}
        <motion.div variants={fadeUp} className="border border-[#222] rounded-2xl overflow-hidden bg-[#0d0d0d]">
          <div className="border-b border-[#1a1a1a] px-5 py-3 flex justify-between items-center">
            <span className="font-mono text-[10px] text-[#555] tracking-widest uppercase">Driver Championship</span>
            <span className="font-mono text-[10px] text-amber">2025 Season</span>
          </div>
          <div className="divide-y divide-[#111]">
            {STANDINGS_2025.map((d) => (
              <div key={d.pos} className="flex items-center gap-3 px-5 py-3 hover:bg-[#111] transition-colors group">
                <span className="w-6 text-right font-mono text-xs text-[#444]">P{d.pos}</span>
                <div
                  className="w-1 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-frost text-sm font-medium truncate">{d.driver}</p>
                  <p className="text-[#555] text-xs font-mono">{d.team}</p>
                </div>
                <div className="text-right">
                  <p className="text-frost text-sm font-mono font-bold">{d.points}</p>
                  <div className="w-20 h-1 bg-[#1a1a1a] rounded-full mt-1">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(d.points / maxPts) * 100}%`, backgroundColor: d.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right: Constructor standings */}
      <div>
        <motion.div variants={fadeUp} className="border border-[#222] rounded-2xl overflow-hidden bg-[#0d0d0d]">
          <div className="border-b border-[#1a1a1a] px-5 py-3 flex justify-between items-center">
            <span className="font-mono text-[10px] text-[#555] tracking-widest uppercase">Constructor Championship</span>
            <span className="font-mono text-[10px] text-amber">2025 Season</span>
          </div>
          <div className="divide-y divide-[#111]">
            {CONSTRUCTORS_2025.map((c) => (
              <div key={c.pos} className="flex items-center gap-3 px-5 py-4 hover:bg-[#111] transition-colors">
                <span className="w-6 text-right font-mono text-xs text-[#444]">P{c.pos}</span>
                <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                <div className="flex-1">
                  <p className="text-frost text-sm font-medium">{c.team}</p>
                  <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full mt-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.points / maxConPts) * 100}%` }}
                      transition={{ duration: 1, delay: c.pos * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                  </div>
                </div>
                <span className="text-frost text-sm font-mono font-bold w-12 text-right">{c.points}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Data note */}
        <p className="text-[#444] font-mono text-[10px] mt-3 px-1">
          Standings updated through Canadian GP · Jun 15 2025
        </p>
      </div>
    </motion.div>
  );
}
