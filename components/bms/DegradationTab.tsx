'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const ACCENT = '#3B82F6';

function getSoh(c: number): number {
  return 100 - (c / 2000) * 12 - Math.max(0, ((c - 1500) / 500) * 5);
}

function StatCard({
  label,
  value,
  sub,
  color,
  delay,
}: {
  label: string;
  value: string;
  sub?: string;
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
      {sub && <p className="font-mono text-[10px] text-[#333] mt-0.5">{sub}</p>}
    </motion.div>
  );
}

export function DegradationTab() {
  const [cycles, setCycles] = useState(847);

  const curveData = useMemo(
    () =>
      Array.from({ length: 201 }, (_, i) => {
        const c = i * 10;
        const soh = getSoh(c);
        return { c, soh };
      }),
    []
  );

  const currentSoh = getSoh(cycles);

  // Estimate remaining cycles to 80% SOH
  // 80 = 100 - (c/2000)*12 - max(0, (c-1500)/500 * 5)
  // approximate: linear portion → c_eol ≈ (100-80)/12 * 2000 = 3333 but capped by knee
  // Use numerical search
  const eolCycles = useMemo(() => {
    for (let c = 0; c <= 2000; c += 5) {
      if (getSoh(c) <= 80) return c;
    }
    return 2000;
  }, []);

  const remainingCycles = Math.max(0, eolCycles - cycles);

  // SVG chart dimensions
  const chartW = 660;
  const chartH = 260;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const xMin = 0;
  const xMax = 2000;
  const yMin = 75;
  const yMax = 102;

  function toSvgX(c: number) {
    return padL + ((c - xMin) / (xMax - xMin)) * innerW;
  }
  function toSvgY(s: number) {
    return padT + ((yMax - s) / (yMax - yMin)) * innerH;
  }

  // Build polyline points for full curve (gray) and active section (green)
  const fullPoints = curveData.map(d => `${toSvgX(d.c)},${toSvgY(d.soh)}`).join(' ');

  const activeData = curveData.filter(d => d.c <= cycles);
  // append exact current point
  const exactPoint = { c: cycles, soh: currentSoh };
  const activePoints = [...activeData.map(d => `${toSvgX(d.c)},${toSvgY(d.soh)}`), `${toSvgX(exactPoint.c)},${toSvgY(exactPoint.soh)}`].join(' ');

  const cursorX = toSvgX(cycles);
  const cursorY = toSvgY(currentSoh);

  const eolX = toSvgX(eolCycles);
  const eolY = toSvgY(80);
  const eolLineY = toSvgY(80);

  // X axis ticks
  const xTicks = [0, 500, 1000, 1500, 2000];
  const yTicks = [80, 85, 90, 95, 100];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-black text-2xl text-frost">
          Degradation Analysis
          <span className="ml-2 text-sm font-mono font-normal" style={{ color: ACCENT }}>
            CAPACITY FADE MODEL
          </span>
        </h1>
        <p className="text-[#444] font-mono text-xs mt-1">
          Li-ion capacity retention curve · drag slider to explore cycle-life trajectory
        </p>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border border-[#1a1a1a] rounded-xl bg-[#080808] p-5 mb-5"
      >
        <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-4">
          Capacity Retention vs. Cycle Count
        </p>

        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible' }}
        >
          {/* Grid lines - horizontal */}
          {yTicks.map(y => (
            <g key={y}>
              <line
                x1={padL}
                y1={toSvgY(y)}
                x2={padL + innerW}
                y2={toSvgY(y)}
                stroke="#1a1a1a"
                strokeWidth={1}
              />
              <text
                x={padL - 6}
                y={toSvgY(y) + 4}
                textAnchor="end"
                fill="#444"
                fontFamily="monospace"
                fontSize="9"
              >
                {y}%
              </text>
            </g>
          ))}

          {/* Grid lines - vertical */}
          {xTicks.map(x => (
            <g key={x}>
              <line
                x1={toSvgX(x)}
                y1={padT}
                x2={toSvgX(x)}
                y2={padT + innerH}
                stroke="#1a1a1a"
                strokeWidth={1}
              />
              <text
                x={toSvgX(x)}
                y={padT + innerH + 16}
                textAnchor="middle"
                fill="#444"
                fontFamily="monospace"
                fontSize="9"
              >
                {x}
              </text>
            </g>
          ))}

          {/* X axis label */}
          <text
            x={padL + innerW / 2}
            y={chartH - 2}
            textAnchor="middle"
            fill="#333"
            fontFamily="monospace"
            fontSize="9"
          >
            Cycle Count
          </text>

          {/* EOL threshold line at 80% */}
          <line
            x1={padL}
            y1={eolLineY}
            x2={padL + innerW}
            y2={eolLineY}
            stroke="#EF4444"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          <text
            x={padL + 4}
            y={eolLineY - 5}
            fill="#EF4444"
            fontFamily="monospace"
            fontSize="9"
          >
            EOL threshold (80%)
          </text>

          {/* EOL annotation */}
          {eolCycles <= xMax && (
            <>
              <line
                x1={eolX}
                y1={padT}
                x2={eolX}
                y2={padT + innerH}
                stroke="#EF4444"
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.5}
              />
              <text
                x={eolX + 4}
                y={padT + 12}
                fill="#EF4444"
                fontFamily="monospace"
                fontSize="8"
                opacity={0.7}
              >
                EOL ~{eolCycles} cycles
              </text>
            </>
          )}

          {/* Full curve (gray) */}
          <polyline
            points={fullPoints}
            fill="none"
            stroke="#2a2a2a"
            strokeWidth={2}
          />

          {/* Active section (green) */}
          {activePoints && (
            <polyline
              points={activePoints}
              fill="none"
              stroke="#22C55E"
              strokeWidth={2.5}
            />
          )}

          {/* Current position dashed vertical line */}
          <line
            x1={cursorX}
            y1={padT}
            x2={cursorX}
            y2={padT + innerH}
            stroke={ACCENT}
            strokeWidth={1.5}
            strokeDasharray="5 3"
          />

          {/* Current SOH dot */}
          <circle cx={cursorX} cy={cursorY} r={5} fill={ACCENT} />
          <circle cx={cursorX} cy={cursorY} r={9} fill={ACCENT} fillOpacity={0.15} />

          {/* SOH label */}
          <rect
            x={cursorX + 8}
            y={cursorY - 16}
            width={80}
            height={20}
            rx={4}
            fill="#0a0a0a"
            stroke={ACCENT}
            strokeWidth={0.5}
            strokeOpacity={0.4}
          />
          <text
            x={cursorX + 48}
            y={cursorY - 2}
            textAnchor="middle"
            fill={ACCENT}
            fontFamily="monospace"
            fontSize="9"
            fontWeight="600"
          >
            SOH {currentSoh.toFixed(1)}%
          </text>

          {/* Cycle label below cursor */}
          <text
            x={cursorX}
            y={padT + innerH + 28}
            textAnchor="middle"
            fill={ACCENT}
            fontFamily="monospace"
            fontSize="8"
          >
            ▲ {cycles}
          </text>

          {/* Axes */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="#2a2a2a" strokeWidth={1} />
          <line x1={padL} y1={padT + innerH} x2={padL + innerW} y2={padT + innerH} stroke="#2a2a2a" strokeWidth={1} />
        </svg>

        {/* Slider */}
        <div className="mt-4 px-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] text-[#444] uppercase tracking-wider">
              Cycle Count: <span style={{ color: ACCENT }}>{cycles}</span>
            </span>
            <span className="font-mono text-[10px] text-[#444]">0 – 2000</span>
          </div>
          <input
            type="range"
            min={0}
            max={2000}
            value={cycles}
            onChange={e => setCycles(Number(e.target.value))}
            className="w-full accent-[#3B82F6] cursor-pointer"
            style={{ accentColor: ACCENT }}
          />
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Current Cycles"
          value={`${cycles}`}
          delay={0.05}
          color={ACCENT}
        />
        <StatCard
          label="State of Health"
          value={`${currentSoh.toFixed(1)}%`}
          color={currentSoh > 90 ? '#22C55E' : currentSoh > 80 ? '#F59E0B' : '#EF4444'}
          delay={0.1}
        />
        <StatCard
          label="Remaining Cap."
          value={`${currentSoh.toFixed(1)} kWh`}
          sub="of 100 kWh nominal"
          delay={0.15}
        />
        <StatCard
          label="Est. Remaining"
          value={`${remainingCycles} cycles`}
          color={remainingCycles < 200 ? '#EF4444' : remainingCycles < 500 ? '#F59E0B' : '#e8e8e8'}
          delay={0.2}
        />
        <StatCard
          label="Calendar Age"
          value="2.3 years"
          delay={0.25}
        />
        <StatCard
          label="Replacement"
          value="Q2 2027"
          color="#888"
          delay={0.3}
        />
      </div>
    </div>
  );
}
