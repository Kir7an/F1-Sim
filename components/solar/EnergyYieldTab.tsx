'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

const LOCATIONS = [
  { name: 'Liverpool, UK',     lat: 53.4,  lon: -3.0,  ghi: 1050, color: '#6B7280' },
  { name: 'Dubai, UAE',        lat: 25.2,  lon: 55.3,  ghi: 2285, color: '#F59E0B' },
  { name: 'Sydney, Australia', lat: -33.9, lon: 151.2, ghi: 1742, color: '#10B981' },
  { name: 'Madrid, Spain',     lat: 40.4,  lon: -3.7,  ghi: 1868, color: '#EF4444' },
  { name: 'Lagos, Nigeria',    lat: 6.5,   lon: 3.4,   ghi: 1958, color: '#8B5CF6' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Seasonal distribution factors (relative to annual average, sums to 12)
const SEASONAL = [0.55, 0.65, 0.85, 1.00, 1.15, 1.25, 1.25, 1.15, 1.00, 0.85, 0.65, 0.55];
// For southern hemisphere, invert
const SEASONAL_SH = [...SEASONAL.slice(6), ...SEASONAL.slice(0, 6)];

const panelArea = 1.96;
const panelEff  = 0.21;
const peakKW    = panelArea * panelEff;

function calcYield(ghi: number) {
  const annualKWh_fixed  = peakKW * ghi * 0.85;
  const annualKWh_single = peakKW * ghi * 1.25 * 0.85;
  const annualKWh_dual   = peakKW * ghi * 1.40 * 0.85;
  return {
    daily_fixed:  annualKWh_fixed  / 365,
    daily_single: annualKWh_single / 365,
    daily_dual:   annualKWh_dual   / 365,
    annualKWh_fixed,
    annualKWh_single,
    annualKWh_dual,
  };
}

interface BarProps {
  x: number;
  width: number;
  maxHeight: number;
  value: number;
  maxVal: number;
  color: string;
  label: string;
  badge?: string;
  yBase: number;
}

function AnimatedBar({ x, width, maxHeight, value, maxVal, color, label, badge, yBase }: BarProps) {
  const barH = maxVal > 0 ? (value / maxVal) * maxHeight : 0;
  const y    = yBase - barH;

  return (
    <g>
      <motion.rect
        x={x}
        y={yBase}
        width={width}
        height={0}
        rx={3}
        fill={color}
        fillOpacity={0.85}
        animate={{ y, height: barH }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      />
      {/* Value label */}
      <motion.text
        x={x + width / 2}
        y={yBase}
        textAnchor="middle"
        fill="white"
        fontFamily="monospace"
        fontSize="10"
        animate={{ y: y - 6 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      >
        {value.toFixed(2)} kWh
      </motion.text>
      {/* Badge */}
      {badge && (
        <motion.text
          x={x + width / 2}
          y={yBase}
          textAnchor="middle"
          fill={color}
          fontFamily="monospace"
          fontSize="9"
          animate={{ y: y - 18 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
          {badge}
        </motion.text>
      )}
      {/* Bottom label */}
      <text
        x={x + width / 2}
        y={yBase + 16}
        textAnchor="middle"
        fill="#555"
        fontFamily="monospace"
        fontSize="9"
      >
        {label}
      </text>
    </g>
  );
}

export function EnergyYieldTab() {
  const [selectedLocation, setSelectedLocation] = useState(0);

  const loc  = LOCATIONS[selectedLocation];
  const y    = calcYield(loc.ghi);
  const maxD = y.daily_dual * 1.2;

  // Monthly yields for dual-axis (kWh/day per month)
  const seasonal = loc.lat < 0 ? SEASONAL_SH : SEASONAL;
  const monthlyDaily = seasonal.map(f => (y.annualKWh_dual / 365) * f);

  // Chart constants
  const chartW    = 700;
  const chartH    = 300;
  const yBase     = 240;
  const maxBarH   = 180;
  const barW      = 80;
  const barGap    = 60;
  const totalBars = 3;
  const totalW    = totalBars * barW + (totalBars - 1) * barGap;
  const startX    = (chartW - totalW) / 2;

  const bars = [
    { value: y.daily_fixed,  color: '#6B7280', label: 'Fixed Tilt',   badge: undefined },
    { value: y.daily_single, color: '#3B82F6', label: 'Single-Axis',  badge: '+25%'  },
    { value: y.daily_dual,   color: loc.color, label: 'Dual-Axis',    badge: '+40%'  },
  ];

  // Y-axis ticks
  const yTicks = 5;

  return (
    <div className="space-y-6">
      {/* Location selector */}
      <div className="flex flex-wrap gap-2">
        {LOCATIONS.map((l, i) => (
          <button
            key={i}
            onClick={() => setSelectedLocation(i)}
            className={`font-mono text-[10px] tracking-wider px-3 py-1.5 rounded border transition-all ${
              selectedLocation === i
                ? 'border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/5'
                : 'border-[#1a1a1a] text-[#444] hover:border-[#333] hover:text-[#888]'
            }`}
            style={selectedLocation === i ? { borderColor: l.color, color: l.color } : undefined}
          >
            {l.name}
          </button>
        ))}
      </div>

      {/* Location info bar */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-4 py-3 flex items-center gap-4 flex-wrap">
        <span className="font-mono text-[9px] text-[#444] tracking-widest">LOCATION</span>
        <span className="font-mono text-xs" style={{ color: loc.color }}>{loc.name}</span>
        <span className="w-px h-4 bg-[#1a1a1a]" />
        <span className="font-mono text-[9px] text-[#444] tracking-widest">GHI</span>
        <span className="font-mono text-xs text-frost">{loc.ghi} kWh/m²/yr</span>
        <span className="w-px h-4 bg-[#1a1a1a]" />
        <span className="font-mono text-[9px] text-[#444] tracking-widest">PEAK POWER</span>
        <span className="font-mono text-xs text-frost">{(peakKW * 1000).toFixed(0)} Wp</span>
        <span className="w-px h-4 bg-[#1a1a1a]" />
        <span className="font-mono text-[9px] text-[#444] tracking-widest">ANNUAL DUAL-AXIS</span>
        <span className="font-mono text-xs" style={{ color: loc.color }}>
          {y.annualKWh_dual.toFixed(1)} kWh/yr
        </span>
      </div>

      {/* Bar chart */}
      <motion.div
        className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4"
        key={selectedLocation}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="font-mono text-[10px] text-[#444] tracking-widest mb-3">DAILY YIELD COMPARISON · kWh/day (AVERAGE)</div>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full">
          {/* Y-axis grid + labels */}
          {Array.from({ length: yTicks + 1 }, (_, i) => {
            const val    = (maxD / yTicks) * i;
            const yPos   = yBase - (val / maxD) * maxBarH;
            return (
              <g key={i}>
                <line x1={40} y1={yPos} x2={chartW - 20} y2={yPos} stroke="#111" strokeWidth="1" />
                <text
                  x={36}
                  y={yPos + 4}
                  fill="#333"
                  fontFamily="monospace"
                  fontSize="9"
                  textAnchor="end"
                >
                  {val.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* X baseline */}
          <line x1={40} y1={yBase} x2={chartW - 20} y2={yBase} stroke="#1e1e1e" strokeWidth="1" />

          {/* Bars */}
          {bars.map((bar, i) => (
            <AnimatedBar
              key={`${selectedLocation}-${i}`}
              x={startX + i * (barW + barGap)}
              width={barW}
              maxHeight={maxBarH}
              value={bar.value}
              maxVal={maxD}
              color={bar.color}
              label={bar.label}
              badge={bar.badge}
              yBase={yBase}
            />
          ))}

          {/* Chart title */}
          <text x={chartW / 2} y={chartH - 4} fill="#333" fontFamily="monospace" fontSize="9" textAnchor="middle">
            Based on {loc.name}: {loc.ghi} kWh/m²/year GHI · 1.96m² panel · 21% efficiency
          </text>
        </svg>
      </motion.div>

      {/* Monthly projection table */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
        <div className="font-mono text-[10px] text-[#444] tracking-widest mb-4">MONTHLY YIELD PROJECTION · DUAL-AXIS TRACKER</div>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
          {MONTHS.map((month, i) => {
            const val    = monthlyDaily[i];
            const maxVal = Math.max(...monthlyDaily);
            const pct    = val / maxVal;
            return (
              <div key={month} className="text-center">
                <div className="font-mono text-[9px] text-[#444] mb-1">{month}</div>
                <div className="relative h-16 bg-[#111] rounded overflow-hidden">
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 rounded"
                    style={{ background: loc.color, opacity: 0.7 }}
                    initial={{ height: 0 }}
                    animate={{ height: `${pct * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                  />
                </div>
                <div className="font-mono text-[8px] text-[#555] mt-1">{val.toFixed(2)}</div>
              </div>
            );
          })}
        </div>
        <div className="font-mono text-[9px] text-[#333] mt-3 text-center">kWh/day per month (estimated)</div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Fixed Tilt Annual',  value: y.annualKWh_fixed.toFixed(1),  unit: 'kWh/yr', color: '#6B7280', gain: 'Baseline' },
          { label: 'Single-Axis Annual', value: y.annualKWh_single.toFixed(1), unit: 'kWh/yr', color: '#3B82F6', gain: '+25% vs fixed' },
          { label: 'Dual-Axis Annual',   value: y.annualKWh_dual.toFixed(1),   unit: 'kWh/yr', color: loc.color, gain: '+40% vs fixed' },
        ].map(card => (
          <div key={card.label} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
            <div className="font-mono text-[9px] text-[#444] tracking-widest mb-1">{card.label.toUpperCase()}</div>
            <div className="font-heading font-black text-2xl text-frost">
              {card.value}
              <span className="text-sm font-mono font-normal ml-1" style={{ color: card.color }}>{card.unit}</span>
            </div>
            <div className="font-mono text-[9px] mt-1" style={{ color: card.color }}>{card.gain}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
