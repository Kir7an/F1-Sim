'use client';
import { useMemo, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface DataPoint {
  h: number;
  solar: number;
  load: number;
  battery: number;
}

const PAD = { top: 20, bottom: 40, left: 50, right: 20 };
const W = 900;
const H = 280;
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const MAX_KW = 7;

function scaleX(h: number) {
  return PAD.left + (h / 24) * PLOT_W;
}
function scaleY(kw: number) {
  return PAD.top + PLOT_H - (kw / MAX_KW) * PLOT_H;
}

function polylinePoints(data: DataPoint[], key: keyof DataPoint): string {
  return data.map(d => `${scaleX(d.h)},${scaleY(d[key] as number)}`).join(' ');
}

function usePolylineLength(points: string) {
  const ref = useRef<SVGPolylineElement>(null);
  const [len, setLen] = useState(0);
  useEffect(() => {
    if (ref.current) setLen(ref.current.getTotalLength());
  }, [points]);
  return { ref, len };
}

const SUMMARY_STATS = [
  { label: 'Peak Solar',       value: '6.0 kW',  color: '#00D084' },
  { label: 'Daily Yield',      value: '34.2 kWh', color: '#00D084' },
  { label: 'Grid Export',      value: '11.8 kWh', color: '#00D084' },
  { label: 'Self-Sufficiency', value: '89%',      color: '#3B82F6' },
  { label: 'CO₂ Avoided',      value: '15.4 kg',  color: '#3B82F6' },
  { label: 'Peak Load',        value: '4.8 kW',   color: '#F59E0B' },
];

export function AnalyticsTab() {
  const data = useMemo<DataPoint[]>(() => Array.from({ length: 96 }, (_, i) => {
    const h = i / 4;
    const solar = Math.max(0, 6 * Math.sin(Math.PI * (h - 6) / 12));
    const load = 2.0
      + (h >= 7 && h <= 9 ? 1.5 : 0)
      + (h >= 17 && h <= 21 ? 2.0 : 0)
      + Math.sin(i * 0.5) * 0.3;
    const battery = 40 + 30 * Math.sin(Math.PI * (h - 4) / 14);
    return { h, solar, load, battery };
  }), []);

  const solarPoints  = polylinePoints(data, 'solar');
  const loadPoints   = polylinePoints(data, 'load');
  const battPoints   = polylinePoints(data, 'battery');

  const solarLine  = usePolylineLength(solarPoints);
  const loadLine   = usePolylineLength(loadPoints);
  const battLine   = usePolylineLength(battPoints);

  // Solar area polygon: follow line then close at bottom
  const solarAreaPoints =
    data.map(d => `${scaleX(d.h)},${scaleY(d.solar)}`).join(' ') +
    ` ${scaleX(24)},${scaleY(0)} ${scaleX(0)},${scaleY(0)}`;

  const xTicks = [0, 6, 12, 18, 24];
  const yTicks = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div>
      {/* Chart card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-heading font-black text-frost text-base">24-Hour Energy Profile</div>
            <div className="font-mono text-[9px] text-[#444] tracking-widest mt-0.5">15-MINUTE INTERVALS · SIMULATED DAY</div>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4">
            {[
              { color: '#00D084', label: 'Solar' },
              { color: '#3B82F6', label: 'Load' },
              { color: '#F59E0B', label: 'Battery SOC' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 rounded" style={{ backgroundColor: l.color, display: 'inline-block' }} />
                <span className="font-mono text-[10px]" style={{ color: l.color }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} width="100%" xmlns="http://www.w3.org/2000/svg">
          {/* Grid lines */}
          {yTicks.map(kw => (
            <line
              key={kw}
              x1={PAD.left} y1={scaleY(kw)}
              x2={W - PAD.right} y2={scaleY(kw)}
              stroke="#111" strokeWidth="1"
            />
          ))}
          {xTicks.map(h => (
            <line
              key={h}
              x1={scaleX(h)} y1={PAD.top}
              x2={scaleX(h)} y2={PAD.top + PLOT_H}
              stroke="#111" strokeWidth="1"
            />
          ))}

          {/* Y axis labels */}
          {yTicks.map(kw => (
            <text key={kw} x={PAD.left - 6} y={scaleY(kw) + 4} textAnchor="end"
              fill="#333" fontSize="10" fontFamily="monospace">{kw}</text>
          ))}
          <text x={PAD.left - 6} y={PAD.top - 6} textAnchor="end"
            fill="#333" fontSize="9" fontFamily="monospace">kW</text>

          {/* X axis labels */}
          {xTicks.map(h => (
            <text key={h} x={scaleX(h)} y={H - 8} textAnchor="middle"
              fill="#333" fontSize="10" fontFamily="monospace">{h}h</text>
          ))}

          {/* Solar area fill */}
          <polygon points={solarAreaPoints} fill="#00D084" opacity="0.08" />

          {/* Solar polyline */}
          <motion.polyline
            ref={solarLine.ref}
            points={solarPoints}
            fill="none"
            stroke="#00D084"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={solarLine.len || 2000}
            initial={{ strokeDashoffset: solarLine.len || 2000 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />

          {/* Load polyline */}
          <motion.polyline
            ref={loadLine.ref}
            points={loadPoints}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={loadLine.len || 2000}
            initial={{ strokeDashoffset: loadLine.len || 2000 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 2, ease: 'easeInOut', delay: 0.2 }}
          />

          {/* Battery SOC polyline (scaled: battery/100 * MAX_KW for display) */}
          <motion.polyline
            ref={battLine.ref}
            points={data.map(d => `${scaleX(d.h)},${scaleY(d.battery / 100 * MAX_KW)}`).join(' ')}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={battLine.len || 2000}
            initial={{ strokeDashoffset: battLine.len || 2000 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 2, ease: 'easeInOut', delay: 0.4 }}
          />

          {/* Axis borders */}
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + PLOT_H} stroke="#222" strokeWidth="1" />
          <line x1={PAD.left} y1={PAD.top + PLOT_H} x2={W - PAD.right} y2={PAD.top + PLOT_H} stroke="#222" strokeWidth="1" />
        </svg>
      </motion.div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {SUMMARY_STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4"
          >
            <div className="font-mono text-[9px] text-[#444] tracking-widest uppercase mb-2">{s.label}</div>
            <div className="font-heading font-black text-2xl" style={{ color: s.color }}>{s.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
