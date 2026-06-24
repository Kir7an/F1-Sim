'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ACCENT = '#3B82F6';

// Initial voltages: mostly healthy with one weak cell
const INITIAL_VOLTAGES: number[][] = Array.from({ length: 6 }, (_, s) =>
  Array.from({ length: 4 }, (_, c) => {
    if (s === 2 && c === 1) return 3.52; // weak cell S3C2
    return parseFloat((3.65 + Math.random() * 0.15).toFixed(3));
  })
);

function cellColor(v: number): string {
  if (v > 4.0) return '#00D084';
  if (v >= 3.7) return '#22C55E';
  if (v >= 3.5) return '#F59E0B';
  if (v >= 3.2) return '#EF4444';
  return '#7F1D1D';
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

export function PackOverviewTab() {
  const [voltages, setVoltages] = useState(INITIAL_VOLTAGES);
  const [current, setCurrent] = useState(-18.5);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => {
      setVoltages(prev =>
        prev.map(row =>
          row.map(v => {
            const drift = (Math.random() - 0.5) * 0.008;
            return parseFloat(Math.max(3.0, Math.min(4.2, v + drift)).toFixed(3));
          })
        )
      );
      setCurrent(prev => parseFloat((prev + (Math.random() - 0.5) * 0.5).toFixed(1)));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const flat = voltages.flat();
  const avgV = flat.reduce((a, b) => a + b, 0) / 24;
  const maxV = Math.max(...flat);
  const minV = Math.min(...flat);
  const delta = maxV - minV;
  const soc = Math.round(((avgV - 3.0) / (4.2 - 3.0)) * 100);
  const packVoltage = avgV * 6;

  // SOC arc
  const r = 90;
  const cx = 120;
  const cy = 120;
  const circumference = 2 * Math.PI * r; // 565.49
  const socOffset = circumference * (1 - Math.max(0, Math.min(100, soc)) / 100);
  const socColor = soc > 60 ? '#22C55E' : soc >= 20 ? '#F59E0B' : '#EF4444';

  // SVG grid dimensions
  const cellW = 90;
  const cellH = 45;
  const colGap = 110;
  const rowGap = 55;
  const offsetX = 55; // space for S-labels
  const offsetY = 30; // space for C-labels
  const svgW = offsetX + 4 * colGap + 20;
  const svgH = offsetY + 6 * rowGap + 10;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-black text-2xl text-frost">
          Pack Overview
          <span className="ml-2 text-sm font-mono font-normal" style={{ color: ACCENT }}>
            4P6S · 24 CELLS
          </span>
        </h1>
        <p className="text-[#444] font-mono text-xs mt-1">
          4 parallel × 6 series lithium-ion pack · live cell-level simulation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: cell grid + stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cell SVG Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="border border-[#1a1a1a] rounded-xl bg-[#080808] p-4 overflow-x-auto"
          >
            <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-3">
              Cell Voltage Map
            </p>
            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              width="100%"
              style={{ minWidth: 400, maxWidth: 560 }}
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Column labels C1-C4 */}
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

              {/* Rows: display S6 at top (row index 0) → S1 at bottom (row index 5) */}
              {Array.from({ length: 6 }, (_, displayRow) => {
                const s = 5 - displayRow; // S6 → S1
                const y = offsetY + displayRow * rowGap;
                return (
                  <g key={`row-${s}`}>
                    {/* S-label */}
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

                    {/* Cells */}
                    {Array.from({ length: 4 }, (_, c) => {
                      const v = voltages[s]?.[c] ?? 3.65;
                      const x = offsetX + c * colGap;
                      const color = cellColor(v);
                      return (
                        <g key={`cell-${s}-${c}`}>
                          <rect
                            x={x}
                            y={y}
                            width={cellW}
                            height={cellH}
                            rx={6}
                            fill={color}
                            fillOpacity={0.18}
                            stroke={color}
                            strokeWidth={1.5}
                            style={{ transition: 'stroke 0.5s ease, fill 0.5s ease' }}
                          />
                          {/* Cell ID */}
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
                          {/* Voltage */}
                          <text
                            x={x + cellW / 2}
                            y={y + 30}
                            textAnchor="middle"
                            fill="white"
                            fontFamily="monospace"
                            fontSize="11"
                            fontWeight="600"
                          >
                            {v.toFixed(3)}V
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </motion.div>

          {/* Pack Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard
              label="Pack Voltage"
              value={`${packVoltage.toFixed(1)} V`}
              delay={0.05}
            />
            <StatCard
              label="Current"
              value={`${current > 0 ? '+' : ''}${current} A · ${current > 0 ? 'CHARGING' : 'DISCHARGING'}`}
              color={current > 0 ? '#22C55E' : '#F59E0B'}
              delay={0.1}
            />
            <StatCard
              label="Max Cell V"
              value={`${maxV.toFixed(3)} V`}
              color="#22C55E"
              delay={0.15}
            />
            <StatCard
              label="Min Cell V"
              value={`${minV.toFixed(3)} V`}
              color={minV < 3.5 ? '#EF4444' : '#e8e8e8'}
              delay={0.2}
            />
            <StatCard
              label="Cell Delta"
              value={`${delta.toFixed(3)} V`}
              color={delta > 0.1 ? '#EF4444' : '#e8e8e8'}
              delay={0.25}
            />
            <StatCard
              label="Balancing"
              value={delta > 0.05 ? 'ACTIVE' : 'IDLE'}
              color={delta > 0.05 ? '#F59E0B' : '#555'}
              delay={0.3}
            />
          </div>
        </div>

        {/* Right: SOC Gauge */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="border border-[#1a1a1a] rounded-xl bg-[#080808] p-6 flex flex-col items-center"
          >
            <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-4">
              State of Charge
            </p>

            <svg viewBox="0 0 240 240" width="220" height="220" xmlns="http://www.w3.org/2000/svg">
              {/* Background track */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="#1a1a1a"
                strokeWidth={16}
              />
              {/* SOC arc — rotate -90deg so 0% starts at top */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={socColor}
                strokeWidth={16}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={mounted ? socOffset : circumference}
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{
                  transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease',
                }}
              />
              {/* SOC % center */}
              <text
                x={cx}
                y={cy - 8}
                textAnchor="middle"
                fill="white"
                fontFamily="monospace"
                fontSize="34"
                fontWeight="700"
              >
                {soc}%
              </text>
              <text
                x={cx}
                y={cy + 18}
                textAnchor="middle"
                fill="#555"
                fontFamily="monospace"
                fontSize="9"
                letterSpacing="2"
              >
                STATE OF CHARGE
              </text>
              {/* Avg voltage */}
              <text
                x={cx}
                y={cy + 36}
                textAnchor="middle"
                fill="#444"
                fontFamily="monospace"
                fontSize="9"
              >
                avg {avgV.toFixed(3)} V/cell
              </text>
            </svg>

            {/* Legend */}
            <div className="mt-4 space-y-2 w-full">
              {[
                { color: '#00D084', label: '> 4.0 V', note: 'Full' },
                { color: '#22C55E', label: '3.7 – 4.0 V', note: 'Good' },
                { color: '#F59E0B', label: '3.5 – 3.7 V', note: 'Low' },
                { color: '#EF4444', label: '3.2 – 3.5 V', note: 'Critical' },
                { color: '#7F1D1D', label: '< 3.2 V', note: 'Dead' },
              ].map(({ color, label, note }) => (
                <div key={label} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-mono text-[10px] text-[#555]">{label}</span>
                  <span className="font-mono text-[10px] text-[#333] ml-auto">{note}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
