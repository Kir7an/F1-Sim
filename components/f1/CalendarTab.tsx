'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getMeetings, CALENDAR_2026 } from '@/lib/f1/api';
import type { Meeting } from '@/lib/f1/types';
import { CIRCUITS } from '@/lib/f1/circuit-data';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

const FLAG_MAP: Record<string, string> = {
  Australia: '🇦🇺', China: '🇨🇳', Japan: '🇯🇵', Bahrain: '🇧🇭',
  'Saudi Arabia': '🇸🇦', 'United States': '🇺🇸', Italy: '🇮🇹',
  Monaco: '🇲🇨', Spain: '🇪🇸', Canada: '🇨🇦', Austria: '🇦🇹',
  'United Kingdom': '🇬🇧', Belgium: '🇧🇪', Hungary: '🇭🇺',
  Netherlands: '🇳🇱', Azerbaijan: '🇦🇿', Singapore: '🇸🇬',
  Mexico: '🇲🇽', Brazil: '🇧🇷', 'United Arab Emirates': '🇦🇪',
  Qatar: '🇶🇦',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function RaceCard({ meeting, isPast, round, isProvisional }: { meeting: Meeting; isPast: boolean; round: number; isProvisional?: boolean }) {
  const flag = FLAG_MAP[meeting.country_name] ?? '🏁';
  const circuit = CIRCUITS.find(c => c.meetingKey === meeting.meeting_key);

  return (
    <motion.div
      variants={fadeUp}
      className={`group relative border rounded-xl p-4 transition-all duration-300 cursor-default ${
        isPast
          ? 'border-[#1a1a1a] bg-[#0a0a0a] opacity-60'
          : 'border-[#222] bg-[#0d0d0d] hover:border-[#E8002D]/40 hover:bg-[#111]'
      }`}
    >
      {!isPast && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E8002D]/30 to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{flag}</span>
            <span className="font-mono text-[10px] text-[#444] tracking-widest">ROUND {round}</span>
            {isPast && <span className="font-mono text-[9px] text-[#333] tracking-wider border border-[#1a1a1a] px-1.5 py-0.5 rounded">DONE</span>}
            {!isPast && !isProvisional && <span className="font-mono text-[9px] text-[#E8002D]/70 tracking-wider border border-[#E8002D]/20 px-1.5 py-0.5 rounded">UPCOMING</span>}
            {isProvisional && !isPast && <span className="font-mono text-[9px] text-amber/70 tracking-wider border border-amber/20 px-1.5 py-0.5 rounded">PROVISIONAL</span>}
          </div>
          <h3 className="text-frost font-medium text-sm leading-tight">{meeting.meeting_name}</h3>
          <p className="text-[#555] text-xs font-mono mt-0.5">{meeting.circuit_short_name} · {meeting.location}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-amber font-mono text-xs">{formatDate(meeting.date_start)}</p>
          {circuit && (
            <p className="text-[#444] font-mono text-[10px] mt-1">{circuit.laps} laps</p>
          )}
        </div>
      </div>
      {circuit && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {[
            { label: circuit.overtaking.toUpperCase(), key: 'OVT' },
            { label: `${circuit.drsZones} DRS`, key: 'DRS' },
            { label: circuit.degProfile.toUpperCase() + ' DEG', key: 'DEG' },
          ].map(t => (
            <span key={t.key} className="font-mono text-[9px] text-[#444] border border-[#1a1a1a] px-1.5 py-0.5 rounded tracking-wider">
              {t.key}: {t.label}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function CalendarTab() {
  const [meetings2025, setMeetings2025] = useState<Meeting[]>([]);
  const [meetings2024, setMeetings2024] = useState<Meeting[]>([]);
  const [meetings2026, setMeetings2026] = useState<Meeting[]>(CALENDAR_2026);
  const [season, setSeason] = useState<2024 | 2025 | 2026>(2026);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMeetings(2025),
      getMeetings(2024),
      getMeetings(2026),
    ]).then(([m25, m24, m26]) => {
      setMeetings2025(m25);
      setMeetings2024(m24);
      // Use API data if available, otherwise fallback to hardcoded 2026 calendar
      if (m26.length > 0) setMeetings2026(m26);
      setLoading(false);
    });
  }, []);

  const meetings = season === 2026 ? meetings2026 : season === 2025 ? meetings2025 : meetings2024;
  const now = new Date();
  const is2026APIData = season === 2026 && meetings2026 !== CALENDAR_2026;

  return (
    <div>
      {/* Season toggle */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {([2026, 2025, 2024] as const).map(yr => (
          <button
            key={yr}
            onClick={() => setSeason(yr)}
            className={`font-mono text-xs px-4 py-2 rounded-lg border transition-all ${
              season === yr
                ? 'border-[#E8002D]/60 bg-[#E8002D]/10 text-frost'
                : 'border-[#222] text-[#444] hover:border-[#333] hover:text-[#888]'
            }`}
          >
            {yr} Season
          </button>
        ))}
        <span className="font-mono text-[10px] text-[#333] ml-2">
          {meetings.length} Grands Prix
        </span>
        {season === 2026 && !is2026APIData && (
          <span className="font-mono text-[9px] text-amber/60 border border-amber/20 px-2 py-1 rounded tracking-wider ml-auto">
            PROVISIONAL CALENDAR
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="border border-[#1a1a1a] rounded-xl p-4 animate-pulse bg-[#0a0a0a]">
              <div className="h-3 w-24 bg-[#1a1a1a] rounded mb-2" />
              <div className="h-4 w-40 bg-[#1a1a1a] rounded mb-2" />
              <div className="h-3 w-32 bg-[#111] rounded" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          key={season}
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
        >
          {meetings.map((m, i) => (
            <RaceCard
              key={m.meeting_key}
              meeting={m}
              isPast={new Date(m.date_start) < now}
              round={i + 1}
              isProvisional={season === 2026 && !is2026APIData}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
