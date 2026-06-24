'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

const nominalPower = 412; // W at STC (25°C)
const tempCoeff    = -0.0035; // -0.35%/°C

const LOSSES = [
  { label: 'Optical',     pct: 3.5,  color: '#6B7280' },
  { label: 'Inverter',    pct: 2.0,  color: '#3B82F6' },
  { label: 'Cable',       pct: 1.5,  color: '#8B5CF6' },
  { label: 'Soiling',     pct: 2.0,  color: '#EF4444' },
  { label: 'Mismatch',    pct: 1.0,  color: '#F59E0B' },
];

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export function PerformanceTab() {
  const [ambientTemp, setAmbientTemp] = useState(25);

  const cellTemp   = ambientTemp + 25;
  const tempDerate = 1 + tempCoeff * (cellTemp - 25);
  const actualPower = nominalPower * tempDerate;
  const powerLoss   = nominalPower - actualPower;
  const tempLossPct = clamp((1 - tempDerate) * 100, 0, 30);

  // All losses including temperature
  const allLosses = [
    ...LOSSES,
    { label: 'Temp Derate', pct: tempLossPct, color: '#F97316' },
  ];
  const totalLossPct = allLosses.reduce((s, l) => s + l.pct, 0);
  const pr = clamp((100 - totalLossPct) / 100, 0.5, 1.0);

  // Performance ratio gauge
  const prPct     = pr * 100;
  const gaugeAngle = 180 * pr; // 0-180 degrees arc
  const gaugeX    = 150 + 90 * Math.cos((Math.PI * (1 - pr)));
  const gaugeY    = 150 - 90 * Math.sin((Math.PI * (1 - pr)));

  // Derate curve chart
  const chartW  = 600;
  const chartH  = 250;
  const xMin    = -10;
  const xMax    = 60;
  const yMinPct = 70;
  const yMaxPct = 110;
  const pad     = { l: 55, r: 20, t: 20, b: 40 };
  const innerW  = chartW - pad.l - pad.r;
  const innerH  = chartH - pad.t - pad.b;

  function tempToX(t: number) {
    return pad.l + ((t - xMin) / (xMax - xMin)) * innerW;
  }
  function pctToY(p: number) {
    return pad.t + innerH - ((p - yMinPct) / (yMaxPct - yMinPct)) * innerH;
  }

  // Build line path
  const points: string[] = [];
  for (let t = xMin; t <= xMax; t += 2) {
    const cell   = t + 25;
    const derate = 1 + tempCoeff * (cell - 25);
    const pPct   = clamp(derate * 100, yMinPct, yMaxPct);
    points.push(`${tempToX(t)},${pctToY(pPct)}`);
  }
  const linePath = 'M ' + points.join(' L ');

  // Current operating point
  const opX   = tempToX(ambientTemp);
  const opPct = clamp(tempDerate * 100, yMinPct, yMaxPct);
  const opY   = pctToY(opPct);

  // Waterfall chart
  const waterfallW = 600;
  const waterfallH = 200;
  const wPad       = { l: 90, r: 20, t: 20, b: 20 };
  const rowH       = 20;
  const rowGap     = 8;
  const maxPct     = 10; // max single loss shown at 100% bar width
  const barMaxW    = waterfallW - wPad.l - wPad.r;

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">

      {/* Temperature control */}
      <motion.div variants={itemVariants} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5">
        <div className="font-mono text-[10px] text-[#444] tracking-widest mb-4">AMBIENT TEMPERATURE CONTROL</div>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <input
              type="range"
              min={-10}
              max={60}
              value={ambientTemp}
              onChange={e => setAmbientTemp(Number(e.target.value))}
              className="w-full accent-amber-400"
            />
            <div className="flex justify-between font-mono text-[9px] text-[#333] mt-1">
              <span>-10°C</span>
              <span>60°C</span>
            </div>
          </div>
          <div className="font-heading font-black text-3xl text-[#F59E0B]">
            {ambientTemp}
            <span className="text-lg font-mono font-normal text-[#444]">°C</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Ambient Temp',  val: `${ambientTemp}°C`,                      color: '#F59E0B' },
            { label: 'Cell Temp',     val: `${cellTemp}°C`,                          color: '#F97316' },
            { label: 'Panel Power',   val: `${actualPower.toFixed(0)} W`,            color: '#10B981' },
            { label: 'Power Loss',    val: `${powerLoss.toFixed(0)} W (${(powerLoss/nominalPower*100).toFixed(1)}%)`, color: '#EF4444' },
          ].map(item => (
            <div key={item.label} className="bg-[#050505] border border-[#111] rounded-lg p-3">
              <div className="font-mono text-[9px] text-[#444] tracking-widest mb-1">{item.label.toUpperCase()}</div>
              <div className="font-mono text-sm font-bold" style={{ color: item.color }}>{item.val}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Two-column: derate curve + PR gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Derate curve */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
          <div className="font-mono text-[10px] text-[#444] tracking-widest mb-3">TEMPERATURE DERATE CURVE</div>
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full">
            {/* Grid lines */}
            {[-10, 0, 10, 20, 25, 30, 40, 50, 60].map(t => (
              <g key={t}>
                <line
                  x1={tempToX(t)} y1={pad.t}
                  x2={tempToX(t)} y2={pad.t + innerH}
                  stroke="#111" strokeWidth="1"
                />
                <text
                  x={tempToX(t)} y={pad.t + innerH + 14}
                  fill="#333" fontFamily="monospace" fontSize="9" textAnchor="middle"
                >{t}°C</text>
              </g>
            ))}
            {[70, 75, 80, 85, 90, 95, 100, 105].map(p => (
              <g key={p}>
                <line
                  x1={pad.l} y1={pctToY(p)}
                  x2={pad.l + innerW} y2={pctToY(p)}
                  stroke={p === 100 ? '#1e3a1e' : '#111'} strokeWidth={p === 100 ? '1.5' : '1'}
                />
                <text
                  x={pad.l - 6} y={pctToY(p) + 4}
                  fill="#333" fontFamily="monospace" fontSize="9" textAnchor="end"
                >{p}%</text>
              </g>
            ))}

            {/* STC reference line at 25°C */}
            <line
              x1={tempToX(25)} y1={pad.t}
              x2={tempToX(25)} y2={pad.t + innerH}
              stroke="#10B981" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.5"
            />
            <text
              x={tempToX(25) + 4} y={pad.t + 12}
              fill="#10B981" fontFamily="monospace" fontSize="9" opacity="0.8"
            >STC 25°C</text>

            {/* STC dot at 100% */}
            <circle cx={tempToX(25)} cy={pctToY(100)} r="5" fill="#10B981" />

            {/* Derate line */}
            <path d={linePath} fill="none" stroke="#F59E0B" strokeWidth="2" />

            {/* Fill under line */}
            <path
              d={`${linePath} L ${tempToX(xMax)} ${pad.t + innerH} L ${tempToX(xMin)} ${pad.t + innerH} Z`}
              fill="#F59E0B"
              fillOpacity="0.06"
            />

            {/* Operating point */}
            <motion.circle
              cx={0}
              cy={opY}
              r="6"
              fill="#F59E0B"
              stroke="#050505"
              strokeWidth="2"
              animate={{ cx: opX }}
              transition={{ duration: 0.3 }}
            />
            <motion.text
              x={0}
              y={opY - 12}
              fill="#F59E0B"
              fontFamily="monospace"
              fontSize="10"
              textAnchor="middle"
              animate={{ x: opX }}
              transition={{ duration: 0.3 }}
            >
              {opPct.toFixed(1)}%
            </motion.text>

            {/* Axes labels */}
            <text
              x={pad.l + innerW / 2} y={chartH - 2}
              fill="#444" fontFamily="monospace" fontSize="9" textAnchor="middle"
            >Ambient Temperature (°C)</text>
            <text
              x={10} y={pad.t + innerH / 2}
              fill="#444" fontFamily="monospace" fontSize="9" textAnchor="middle"
              transform={`rotate(-90, 10, ${pad.t + innerH / 2})`}
            >Output (%)</text>
          </svg>
        </motion.div>

        {/* Performance Ratio Gauge */}
        <motion.div variants={itemVariants} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 flex flex-col items-center justify-center">
          <div className="font-mono text-[10px] text-[#444] tracking-widest mb-4 self-start">PERFORMANCE RATIO</div>
          <svg viewBox="0 0 300 200" className="w-full max-w-[260px]">
            {/* Gauge background arc */}
            <path
              d="M 30 160 A 120 120 0 0 1 270 160"
              fill="none"
              stroke="#111"
              strokeWidth="18"
              strokeLinecap="round"
            />
            {/* Colored arc segments */}
            {[
              { start: 0,   end: 0.5,  color: '#EF4444' },
              { start: 0.5, end: 0.7,  color: '#F59E0B' },
              { start: 0.7, end: 0.85, color: '#10B981' },
              { start: 0.85,end: 1.0,  color: '#3B82F6' },
            ].map((seg, i) => {
              const startAngle = Math.PI - seg.start * Math.PI;
              const endAngle   = Math.PI - seg.end * Math.PI;
              const x1 = 150 + 120 * Math.cos(startAngle);
              const y1 = 160 - 120 * Math.sin(startAngle);
              const x2 = 150 + 120 * Math.cos(endAngle);
              const y2 = 160 - 120 * Math.sin(endAngle);
              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} A 120 120 0 0 1 ${x2} ${y2}`}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="18"
                  strokeLinecap="butt"
                  opacity="0.4"
                />
              );
            })}

            {/* Active arc */}
            <motion.path
              d={`M 30 160 A 120 120 0 ${pr > 0.5 ? 1 : 0} 1 ${gaugeX} ${gaugeY}`}
              fill="none"
              stroke={pr >= 0.78 ? '#10B981' : pr >= 0.65 ? '#F59E0B' : '#EF4444'}
              strokeWidth="18"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: pr }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            />

            {/* Center value */}
            <text
              x="150" y="148"
              fill="white" fontFamily="monospace" fontSize="32" textAnchor="middle" fontWeight="bold"
            >
              {(pr * 100).toFixed(0)}%
            </text>
            <text
              x="150" y="166"
              fill="#444" fontFamily="monospace" fontSize="9" textAnchor="middle" letterSpacing="2"
            >PERF RATIO</text>

            {/* Scale labels */}
            <text x="22"  y="176" fill="#444" fontFamily="monospace" fontSize="8" textAnchor="middle">0%</text>
            <text x="150" y="38"  fill="#444" fontFamily="monospace" fontSize="8" textAnchor="middle">50%</text>
            <text x="278" y="176" fill="#444" fontFamily="monospace" fontSize="8" textAnchor="middle">100%</text>
          </svg>

          <div className="text-center mt-2 space-y-1">
            {[
              { label: 'Excellent', range: '≥85%', color: '#3B82F6' },
              { label: 'Good',      range: '78–85%', color: '#10B981' },
              { label: 'Fair',      range: '65–78%', color: '#F59E0B' },
              { label: 'Poor',      range: '<65%',   color: '#EF4444' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between gap-4 font-mono text-[9px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span style={{ color: item.color }}>{item.label}</span>
                </span>
                <span className="text-[#333]">{item.range}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Losses Waterfall */}
      <motion.div variants={itemVariants} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
        <div className="font-mono text-[10px] text-[#444] tracking-widest mb-4">SYSTEM LOSSES BREAKDOWN</div>
        <svg viewBox={`0 0 ${waterfallW} ${waterfallH}`} className="w-full">
          {allLosses.map((loss, i) => {
            const barW  = clamp((loss.pct / maxPct) * barMaxW, 0, barMaxW);
            const y     = wPad.t + i * (rowH + rowGap);
            return (
              <g key={loss.label}>
                {/* Background track */}
                <rect
                  x={wPad.l} y={y}
                  width={barMaxW} height={rowH}
                  rx={3} fill="#0d0d0d"
                />
                {/* Animated bar */}
                <motion.rect
                  x={wPad.l} y={y}
                  width={0} height={rowH}
                  rx={3}
                  fill={loss.color}
                  fillOpacity={0.7}
                  animate={{ width: barW }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                />
                {/* Label */}
                <text
                  x={wPad.l - 6} y={y + rowH / 2 + 4}
                  fill="#555" fontFamily="monospace" fontSize="9" textAnchor="end"
                >{loss.label}</text>
                {/* Value */}
                <motion.text
                  x={wPad.l} y={y + rowH / 2 + 4}
                  fill={loss.color} fontFamily="monospace" fontSize="9"
                  animate={{ x: wPad.l + barW + 6 }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                >
                  -{loss.pct.toFixed(1)}%
                </motion.text>
              </g>
            );
          })}

          {/* Total losses summary */}
          <text
            x={wPad.l} y={waterfallH - 6}
            fill="#444" fontFamily="monospace" fontSize="9"
          >
            TOTAL LOSSES: -{totalLossPct.toFixed(1)}%  ·  NET OUTPUT: {(100 - totalLossPct).toFixed(1)}%  ·  PR = {(pr * 100).toFixed(0)}%
          </text>
        </svg>
      </motion.div>

      {/* Temp coefficient info card */}
      <motion.div variants={itemVariants} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
        <div className="font-mono text-[10px] text-[#444] tracking-widest mb-3">PANEL SPECIFICATIONS</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Technology',   val: 'Monocrystalline PERC' },
            { label: 'Nominal Power', val: `${nominalPower} Wp` },
            { label: 'Temp Coeff (Pmax)', val: `${(tempCoeff * 100).toFixed(2)}%/°C` },
            { label: 'Panel Area',   val: '1.96 m²' },
            { label: 'Efficiency',   val: '21.0%' },
            { label: 'NOCT',         val: '45°C' },
            { label: 'Voc',          val: '49.8 V' },
            { label: 'Isc',          val: '10.4 A' },
          ].map(item => (
            <div key={item.label} className="border-l border-[#1a1a1a] pl-3">
              <div className="font-mono text-[9px] text-[#444] tracking-widest">{item.label.toUpperCase()}</div>
              <div className="font-mono text-xs text-frost mt-0.5">{item.val}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
