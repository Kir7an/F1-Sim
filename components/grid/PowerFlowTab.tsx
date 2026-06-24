'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function PowerFlowTab() {
  const [tick, setTick] = useState(0);
  const [batterySOC, setBatterySOC] = useState(62);

  useEffect(() => {
    const id = setInterval(() => {
      setTick(t => t + 1);
      const hour = new Date().getHours() + new Date().getMinutes() / 60;
      const solarKW = Math.max(0, 6 * Math.sin(Math.PI * (hour - 6) / 12));
      const loadKW = 2.8 + Math.sin(tick * 0.3) * 0.8 + 0.2;
      const delta = (solarKW - loadKW) * 0.015;
      setBatterySOC(prev => Math.max(10, Math.min(95, prev + delta)));
    }, 1000);
    return () => clearInterval(id);
  }, [tick]);

  const hour = new Date().getHours() + new Date().getMinutes() / 60;
  const solarKW = parseFloat(Math.max(0, 6 * Math.sin(Math.PI * (hour - 6) / 12)).toFixed(2));
  const loadKW = parseFloat((2.8 + Math.sin(tick * 0.3) * 0.8 + 0.2).toFixed(2));
  const battPower = parseFloat((solarKW - loadKW).toFixed(2));
  const gridKW = parseFloat((solarKW - loadKW - Math.max(0, battPower)).toFixed(2));
  const frequency = parseFloat((50 + gridKW * 0.006 + Math.sin(tick * 0.7) * 0.008).toFixed(3));
  const voltage = parseFloat((230 + Math.sin(tick * 0.4) * 1.5).toFixed(1));

  const socPercent = Math.round(batterySOC);
  const socColor = batterySOC > 60 ? '#00D084' : batterySOC > 20 ? '#F59E0B' : '#EF4444';

  const freqColor = frequency >= 49.9 && frequency <= 50.1 ? '#00D084' : '#F59E0B';
  const voltDev = Math.abs(voltage - 230);
  const voltColor = voltDev < 1 ? '#00D084' : voltDev < 3 ? '#F59E0B' : '#EF4444';
  const gridColor = gridKW >= 0 ? '#00D084' : '#F59E0B';

  // Arc SVG for battery SOC
  const arcRadius = 16;
  const arcCircumference = 2 * Math.PI * arcRadius;
  const arcOffset = arcCircumference * (1 - batterySOC / 100);

  const statCards = [
    {
      label: 'Solar Output',
      value: `${solarKW} kW`,
      sub: solarKW > 0 ? 'GENERATING' : 'NIGHT MODE',
      color: '#00D084',
    },
    {
      label: 'Battery SOC',
      value: `${socPercent}%`,
      sub: battPower > 0 ? 'CHARGING' : 'DISCHARGING',
      color: socColor,
      arc: true,
    },
    {
      label: 'Load Demand',
      value: `${loadKW} kW`,
      sub: 'RESIDENTIAL',
      color: '#3B82F6',
    },
    {
      label: 'Grid Exchange',
      value: `${gridKW > 0 ? '+' : ''}${gridKW} kW`,
      sub: gridKW > 0 ? 'EXPORTING' : 'IMPORTING',
      color: gridColor,
    },
    {
      label: 'Frequency',
      value: `${frequency} Hz`,
      sub: frequency >= 49.9 && frequency <= 50.1 ? 'NOMINAL' : 'DEVIATION',
      color: freqColor,
    },
    {
      label: 'Voltage',
      value: `${voltage} V`,
      sub: voltDev < 1 ? 'NOMINAL' : 'DEVIATION',
      color: voltColor,
    },
  ];

  return (
    <div>
      <style>{`
        @keyframes flowDown { to { stroke-dashoffset: -10; } }
        @keyframes flowUp   { to { stroke-dashoffset: 10; } }
        @keyframes spinSlow { to { transform: rotate(360deg); } }
        @keyframes pulse    { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes glowPulse { 0%,100% { filter: drop-shadow(0 0 4px #00D084); } 50% { filter: drop-shadow(0 0 12px #00D084); } }
      `}</style>

      {/* Section header */}
      <div className="mb-6">
        <h1 className="font-heading font-black text-2xl text-frost">Power Flow</h1>
        <p className="text-[#444] font-mono text-xs mt-1">Real-time microgrid topology · 1-second resolution · live simulation</p>
      </div>

      {/* SVG Energy Flow Diagram */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4 mb-6 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] text-[#444] tracking-widest uppercase">Topology — Single Line Diagram</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D084]" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
            <span className="font-mono text-[9px] text-[#00D084] tracking-widest">LIVE</span>
          </div>
        </div>

        <svg viewBox="0 0 800 500" width="100%" style={{ maxHeight: 480 }} xmlns="http://www.w3.org/2000/svg">
          {/* Background grid */}
          <defs>
            <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#111" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#smallGrid)" />

          {/* ===== CONNECTION LINES ===== */}

          {/* Solar → Battery (vertical, center) */}
          <line
            x1="400" y1="125" x2="400" y2="215"
            stroke={solarKW > 0 ? '#00D084' : '#1a1a1a'}
            strokeWidth="2.5"
            style={{ strokeDasharray: '8 5', animation: solarKW > 0 ? 'flowDown 0.7s linear infinite' : 'none' }}
          />
          <text x="418" y="175" fill={solarKW > 0 ? '#00D084' : '#333'} fontSize="11" fontFamily="monospace">{solarKW} kW</text>

          {/* Battery → Load (diagonal left-down) */}
          <line
            x1="365" y1="278" x2="215" y2="360"
            stroke="#3B82F6"
            strokeWidth="2.5"
            style={{ strokeDasharray: '8 5', animation: 'flowDown 0.9s linear infinite' }}
          />
          <text x="255" y="326" fill="#3B82F6" fontSize="11" fontFamily="monospace">{loadKW} kW</text>

          {/* Battery → Grid (diagonal right-down) */}
          <line
            x1="435" y1="278" x2="585" y2="360"
            stroke={gridColor}
            strokeWidth="2.5"
            style={{ strokeDasharray: '8 5', animation: gridKW >= 0 ? 'flowDown 0.8s linear infinite' : 'flowUp 0.8s linear infinite' }}
          />
          <text x="498" y="326" fill={gridColor} fontSize="11" fontFamily="monospace">{gridKW > 0 ? '+' : ''}{gridKW} kW</text>

          {/* ===== SOLAR NODE (400, 70) ===== */}
          <g transform="translate(370, 45)" style={{ animation: solarKW > 0 ? 'glowPulse 2s ease-in-out infinite' : 'none' }}>
            {/* Panel frame */}
            <rect x="0" y="0" width="60" height="42" rx="3" fill="#0d1a14" stroke={solarKW > 0 ? '#00D084' : '#1a2a1a'} strokeWidth="1.5" />
            {/* Panel grid lines */}
            <line x1="20" y1="0" x2="20" y2="42" stroke={solarKW > 0 ? '#00D08430' : '#111'} strokeWidth="1" />
            <line x1="40" y1="0" x2="40" y2="42" stroke={solarKW > 0 ? '#00D08430' : '#111'} strokeWidth="1" />
            <line x1="0" y1="14" x2="60" y2="14" stroke={solarKW > 0 ? '#00D08430' : '#111'} strokeWidth="1" />
            <line x1="0" y1="28" x2="60" y2="28" stroke={solarKW > 0 ? '#00D08430' : '#111'} strokeWidth="1" />
            {/* Solar cell fill */}
            <rect x="2" y="2" width="16" height="10" fill={solarKW > 0 ? '#00D08415' : '#0a0a0a'} />
            <rect x="22" y="2" width="16" height="10" fill={solarKW > 0 ? '#00D08415' : '#0a0a0a'} />
            <rect x="42" y="2" width="16" height="10" fill={solarKW > 0 ? '#00D08415' : '#0a0a0a'} />
            <rect x="2" y="16" width="16" height="10" fill={solarKW > 0 ? '#00D08415' : '#0a0a0a'} />
            <rect x="22" y="16" width="16" height="10" fill={solarKW > 0 ? '#00D08415' : '#0a0a0a'} />
            <rect x="42" y="16" width="16" height="10" fill={solarKW > 0 ? '#00D08415' : '#0a0a0a'} />
            <rect x="2" y="30" width="16" height="10" fill={solarKW > 0 ? '#00D08415' : '#0a0a0a'} />
            <rect x="22" y="30" width="16" height="10" fill={solarKW > 0 ? '#00D08415' : '#0a0a0a'} />
            <rect x="42" y="30" width="16" height="10" fill={solarKW > 0 ? '#00D08415' : '#0a0a0a'} />
          </g>
          <text x="400" y="102" textAnchor="middle" fill={solarKW > 0 ? '#00D084' : '#333'} fontSize="11" fontFamily="monospace" fontWeight="600">SOLAR ARRAY</text>
          <text x="400" y="116" textAnchor="middle" fill={solarKW > 0 ? '#00D08488' : '#222'} fontSize="10" fontFamily="monospace">{solarKW} kW</text>

          {/* ===== BATTERY NODE (400, 240) ===== */}
          <g transform="translate(355, 218)">
            {/* Battery body */}
            <rect x="0" y="0" width="90" height="50" rx="4" fill="#0a0a0a" stroke={socColor} strokeWidth="1.5" />
            {/* Battery terminal nubs */}
            <rect x="90" y="16" width="6" height="18" rx="2" fill={socColor} />
            {/* Battery fill level */}
            <rect
              x="3" y="3"
              width={Math.round((batterySOC / 100) * 84)}
              height="44"
              rx="2"
              fill={`${socColor}25`}
            />
            {/* SOC text */}
            <text x="45" y="30" textAnchor="middle" fill={socColor} fontSize="14" fontFamily="monospace" fontWeight="700">{socPercent}%</text>
            <text x="45" y="43" textAnchor="middle" fill={`${socColor}88`} fontSize="9" fontFamily="monospace">{battPower > 0 ? '↑ CHRG' : '↓ DCHG'}</text>
          </g>
          <text x="400" y="285" textAnchor="middle" fill={socColor} fontSize="11" fontFamily="monospace" fontWeight="600">BATTERY PACK</text>

          {/* ===== LOAD NODE (180, 390) ===== */}
          <g transform="translate(140, 355)">
            {/* House shape */}
            <polygon points="40,0 80,35 70,35 70,70 10,70 10,35 0,35" fill="#0a0f1a" stroke="#3B82F6" strokeWidth="1.5" />
            {/* Door */}
            <rect x="28" y="48" width="24" height="22" fill="#3B82F620" stroke="#3B82F640" strokeWidth="1" />
            {/* Window */}
            <rect x="12" y="38" width="16" height="14" fill="#3B82F620" stroke="#3B82F640" strokeWidth="1" />
            <rect x="52" y="38" width="16" height="14" fill="#3B82F620" stroke="#3B82F640" strokeWidth="1" />
          </g>
          <text x="180" y="436" textAnchor="middle" fill="#3B82F6" fontSize="11" fontFamily="monospace" fontWeight="600">LOAD / HOME</text>
          <text x="180" y="449" textAnchor="middle" fill="#3B82F688" fontSize="10" fontFamily="monospace">{loadKW} kW</text>

          {/* ===== GRID NODE (620, 390) ===== */}
          <g transform="translate(596, 353)">
            {/* Tower base */}
            <polygon points="24,0 48,70 36,70 36,50 12,50 12,70 0,70" fill="#0a0a0a" stroke={gridColor} strokeWidth="1.5" />
            {/* Cross arms */}
            <line x1="4" y1="20" x2="44" y2="20" stroke={gridColor} strokeWidth="1.5" />
            <line x1="8" y1="35" x2="40" y2="35" stroke={gridColor} strokeWidth="1.5" />
            {/* Lightning bolt accent */}
            <text x="16" y="18" fill={gridColor} fontSize="14" fontFamily="sans-serif">⚡</text>
          </g>
          <text x="620" y="436" textAnchor="middle" fill={gridColor} fontSize="11" fontFamily="monospace" fontWeight="600">UTILITY GRID</text>
          <text x="620" y="449" textAnchor="middle" fill={`${gridColor}88`} fontSize="10" fontFamily="monospace">{gridKW > 0 ? '+' : ''}{gridKW} kW</text>

          {/* Node labels at top left */}
          <text x="16" y="22" fill="#333" fontSize="10" fontFamily="monospace">IEC 61850 · SLD VIEW</text>
          <text x="16" y="36" fill="#222" fontSize="9" fontFamily="monospace">tick: {tick}s</text>
        </svg>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4"
          >
            <div className="font-mono text-[9px] text-[#444] tracking-widest uppercase mb-2">{card.label}</div>

            {card.arc ? (
              <div className="flex items-center gap-2 mb-1">
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r={arcRadius} fill="none" stroke="#1a1a1a" strokeWidth="3" />
                  <circle
                    cx="20" cy="20" r={arcRadius}
                    fill="none"
                    stroke={socColor}
                    strokeWidth="3"
                    strokeDasharray={arcCircumference}
                    strokeDashoffset={arcOffset}
                    strokeLinecap="round"
                    transform="rotate(-90 20 20)"
                  />
                </svg>
                <span className="font-heading font-black text-lg" style={{ color: card.color }}>{card.value}</span>
              </div>
            ) : (
              <div className="font-heading font-black text-xl mb-1" style={{ color: card.color }}>{card.value}</div>
            )}

            <div className="font-mono text-[8px] tracking-widest" style={{ color: `${card.color}88` }}>{card.sub}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
