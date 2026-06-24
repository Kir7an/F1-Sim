'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ACCENT = '#3B82F6';

const INITIAL_TEMPS: number[][] = Array.from({ length: 6 }, (_, s) =>
  Array.from({ length: 4 }, (_, c) => {
    const distFromCenter = Math.abs(s - 2.5) + Math.abs(c - 1.5);
    return parseFloat((35 + (4 - distFromCenter) * 2.5 + Math.random() * 3).toFixed(1));
  })
);

function tempToColor(t: number): string {
  const ratio = Math.max(0, Math.min(1, (t - 25) / 30));
  if (ratio < 0.33) {
    const h = 200 - (ratio * 200) / 0.33;
    return `hsl(${h}, 80%, 45%)`;
  }
  if (ratio < 0.66) {
    const h = 60 - ((ratio - 0.33) * 60) / 0.33;
    return `hsl(${h}, 80%, 50%)`;
  }
  const h = 30 - ((ratio - 0.66) * 30) / 0.34;
  return `hsl(${h}, 90%, 50%)`;
}

function StatCard({
  label,
  value,
  color,
  delay,
}: {
  label: string;
  value: string;
  color?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
      className="border border-[#1a1a1a] rounded-lg p-4 bg-[#080808]"
    >
      <p className="font-mono text-[10px] text-[#444] tracking-widest mb-1 uppercase">{label}</p>
      <p className="font-mono text-sm font-semibold" style={{ color: color ?? '#e8e8e8' }}>
        {value}
      </p>
    </motion.div>
  );
}

export function ThermalTab() {
  const [temps, setTemps] = useState(INITIAL_TEMPS);

  useEffect(() => {
    const id = setInterval(() => {
      setTemps(prev =>
        prev.map(row =>
          row.map(t => {
            const drift = (Math.random() - 0.5) * 0.4;
            return parseFloat(Math.max(20, Math.min(65, t + drift)).toFixed(1));
          })
        )
      );
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const flat = temps.flat();
  const avgT = flat.reduce((a, b) => a + b, 0) / 24;
  const maxT = Math.max(...flat);
  const minT = Math.min(...flat);
  const spread = maxT - minT;

  let status = 'NORMAL';
  let statusColor = '#22C55E';
  if (maxT > 55) {
    status = 'CRITICAL';
    statusColor = '#EF4444';
  } else if (maxT > 45) {
    status = 'HIGH TEMP';
    statusColor = '#F59E0B';
  }

  // SVG grid
  const cellW = 90;
  const cellH = 45;
  const colGap = 110;
  const rowGap = 55;
  const offsetX = 55;
  const offsetY = 30;
  const svgW = offsetX + 4 * colGap + 20;
  const svgH = offsetY + 6 * rowGap + 10;

  // Gradient legend: 25°C (blue) → 55°C (red)
  const legendGradientStops = [
    { offset: '0%', color: tempToColor(55) },   // top = hot
    { offset: '33%', color: tempToColor(45) },
    { offset: '66%', color: tempToColor(35) },
    { offset: '100%', color: tempToColor(25) }, // bottom = cool
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-black text-2xl text-frost">
          Thermal Map
          <span className="ml-2 text-sm font-mono font-normal" style={{ color: ACCENT }}>
            4P6S · TEMPERATURE
          </span>
        </h1>
        <p className="text-[#444] font-mono text-xs mt-1">
          Cell-level temperature distribution · center cells run hotter due to reduced airflow
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="border border-[#1a1a1a] rounded-xl bg-[#080808] p-4 overflow-x-auto"
          >
            <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-3">
              Temperature Heatmap (°C)
            </p>
            <div className="flex gap-4">
              <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                width="100%"
                style={{ minWidth: 400, maxWidth: 520 }}
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Column labels */}
                {Array.from({ length: 4 }, (_, c) => (
                  <text
                    key={`cl-${c}`}
                    x={offsetX + c * colGap + cellW / 2}
                    y={18}
                    textAnchor="middle"
                    fill="#555"
                    fontFamily="monospace"
                    fontSize="10"
                  >
                    C{c + 1}
                  </text>
                ))}

                {/* Rows: S6 at top, S1 at bottom */}
                {Array.from({ length: 6 }, (_, displayRow) => {
                  const s = 5 - displayRow;
                  const y = offsetY + displayRow * rowGap;
                  return (
                    <g key={`row-${s}`}>
                      <text
                        x={offsetX - 8}
                        y={y + cellH / 2 + 4}
                        textAnchor="end"
                        fill="#555"
                        fontFamily="monospace"
                        fontSize="10"
                      >
                        S{s + 1}
                      </text>

                      {Array.from({ length: 4 }, (_, c) => {
                        const t = temps[s]?.[c] ?? 35;
                        const x = offsetX + c * colGap;
                        const color = tempToColor(t);
                        return (
                          <g key={`cell-${s}-${c}`}>
                            <rect
                              x={x}
                              y={y}
                              width={cellW}
                              height={cellH}
                              rx={6}
                              fill={color}
                              fillOpacity={0.25}
                              stroke={color}
                              strokeWidth={1.5}
                              style={{ transition: 'stroke 0.5s ease, fill 0.5s ease' }}
                            />
                            <text
                              x={x + cellW / 2}
                              y={y + 14}
                              textAnchor="middle"
                              fill="#888"
                              fontFamily="monospace"
                              fontSize="8"
                            >
                              S{s + 1}C{c + 1}
                            </text>
                            <text
                              x={x + cellW / 2}
                              y={y + 30}
                              textAnchor="middle"
                              fill="white"
                              fontFamily="monospace"
                              fontSize="11"
                              fontWeight="600"
                            >
                              {t.toFixed(1)}°C
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  );
                })}
              </svg>

              {/* Gradient legend bar */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-6">
                <span className="font-mono text-[9px] text-[#444]">55°C</span>
                <svg width="18" height="200" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="thermalLegend" x1="0" y1="0" x2="0" y2="1">
                      {legendGradientStops.map(s => (
                        <stop key={s.offset} offset={s.offset} stopColor={s.color} />
                      ))}
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="18" height="200" rx="4" fill="url(#thermalLegend)" />
                </svg>
                <span className="font-mono text-[9px] text-[#444]">25°C</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="lg:col-span-1 space-y-3">
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="border border-[#1a1a1a] rounded-xl bg-[#080808] p-5"
          >
            <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-4">
              Thermal Status
            </p>
            <div
              className="flex items-center gap-2 mb-5 px-3 py-2 rounded-lg"
              style={{ backgroundColor: `${statusColor}12`, border: `1px solid ${statusColor}30` }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: statusColor }}
              />
              <span className="font-mono text-xs font-bold" style={{ color: statusColor }}>
                {status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-mono text-[10px] text-[#444] uppercase tracking-wider">Average</span>
                <span className="font-mono text-xs text-frost">{avgT.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-[10px] text-[#444] uppercase tracking-wider">Maximum</span>
                <span
                  className="font-mono text-xs"
                  style={{ color: maxT > 45 ? '#EF4444' : '#e8e8e8' }}
                >
                  {maxT.toFixed(1)}°C
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-mono text-[10px] text-[#444] uppercase tracking-wider">Minimum</span>
                <span className="font-mono text-xs text-frost">{minT.toFixed(1)}°C</span>
              </div>
              <div className="h-px bg-[#1a1a1a]" />
              <div className="flex justify-between">
                <span className="font-mono text-[10px] text-[#444] uppercase tracking-wider">Spread</span>
                <span
                  className="font-mono text-xs"
                  style={{ color: spread > 10 ? '#F59E0B' : '#e8e8e8' }}
                >
                  {spread.toFixed(1)}°C
                </span>
              </div>
            </div>
          </motion.div>

          {/* Thresholds */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="border border-[#1a1a1a] rounded-xl bg-[#080808] p-5"
          >
            <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-3">
              Thresholds
            </p>
            <div className="space-y-2">
              {[
                { label: 'Warning', value: '> 45°C', color: '#F59E0B' },
                { label: 'Critical', value: '> 55°C', color: '#EF4444' },
                { label: 'Optimal', value: '20 – 40°C', color: '#22C55E' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }} />
                    <span className="font-mono text-[10px] text-[#555]">{row.label}</span>
                  </div>
                  <span className="font-mono text-[10px]" style={{ color: row.color }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <StatCard label="Average Temp" value={`${avgT.toFixed(1)}°C`} delay={0.05} />
        <StatCard
          label="Max Temp"
          value={`${maxT.toFixed(1)}°C`}
          color={maxT > 45 ? '#EF4444' : '#e8e8e8'}
          delay={0.1}
        />
        <StatCard label="Min Temp" value={`${minT.toFixed(1)}°C`} delay={0.15} />
        <StatCard
          label="Thermal Spread"
          value={`${spread.toFixed(1)}°C`}
          color={spread > 10 ? '#F59E0B' : '#e8e8e8'}
          delay={0.2}
        />
      </div>
    </div>
  );
}
