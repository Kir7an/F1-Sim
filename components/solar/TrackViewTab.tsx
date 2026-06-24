'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function useSunPosition() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const hour = time.getHours() + time.getMinutes() / 60 + time.getSeconds() / 3600;
  const elevation = Math.max(0, 90 - Math.abs(hour - 12) * 9.5);
  const azimuth = Math.max(0, Math.min(180, ((hour - 6) / 12) * 180));
  const irradiance = Math.round(Math.max(0, 1000 * Math.sin((elevation * Math.PI) / 180)));
  const panelPower = parseFloat((irradiance * 1.96 * 0.21).toFixed(0));
  const isDaytime = hour >= 6 && hour <= 18;

  return { time, hour, elevation, azimuth, irradiance, panelPower, isDaytime };
}

const STAT_CARDS = [
  { label: 'Solar Elevation', unit: '°', key: 'elevation' as const },
  { label: 'Solar Azimuth',   unit: '°', key: 'azimuth' as const },
  { label: 'Irradiance',      unit: ' W/m²', key: 'irradiance' as const },
  { label: 'Panel Power',     unit: ' W', key: 'panelPower' as const },
];

export function TrackViewTab() {
  const { time, hour, elevation, azimuth, irradiance, panelPower, isDaytime } = useSunPosition();

  // Sun path arc mapping
  const angle = (azimuth / 180) * Math.PI;
  const sunX = 250 - 200 * Math.cos(angle);
  const sunY = 240 - 200 * Math.sin(angle) * (elevation > 0 ? 1 : 0);

  // Panel tilt transform
  const panelTilt = elevation;

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header row */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-2xl text-frost">Track View</h1>
          <p className="text-[#444] font-mono text-xs mt-1">
            Real-time sun position · dual-axis panel tracking
          </p>
        </div>
        <div className="font-mono text-xs text-[#444] border border-[#1a1a1a] px-3 py-1.5 rounded">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </motion.div>

      {/* Two-column diagrams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sun Path Diagram */}
        <motion.div variants={itemVariants} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
          <div className="font-mono text-[10px] text-[#444] tracking-widest mb-3">SUN PATH DIAGRAM</div>
          <div className="relative">
            <style>{`@keyframes spinSlow { to { transform: rotate(360deg); } }`}</style>
            <svg viewBox="0 0 500 320" className="w-full" xmlns="http://www.w3.org/2000/svg">
              {/* Background */}
              <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#050505" />
                  <stop offset="100%" stopColor="#0a0a0a" />
                </linearGradient>
                <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="500" height="320" fill="url(#skyGrad)" />

              {/* Ground */}
              <rect x="0" y="240" width="500" height="80" fill="#0d0d0d" />

              {/* Horizon line */}
              <line x1="30" y1="240" x2="470" y2="240" stroke="#1e1e1e" strokeWidth="1" />

              {/* Dashed full day arc path */}
              <path
                d="M 50 240 A 200 200 0 0 1 450 240"
                fill="none"
                stroke="#1e1e1e"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />

              {/* Elevation arc from horizon to sun */}
              {isDaytime && elevation > 0 && (
                <path
                  d={`M 250 240 L ${sunX} ${sunY}`}
                  stroke="#F59E0B"
                  strokeWidth="1"
                  strokeOpacity="0.3"
                  strokeDasharray="3 3"
                />
              )}

              {/* Compass labels */}
              <text x="50" y="258" fill="#444" fontFamily="monospace" fontSize="11" textAnchor="middle">E</text>
              <text x="250" y="263" fill="#444" fontFamily="monospace" fontSize="11" textAnchor="middle">S</text>
              <text x="450" y="258" fill="#444" fontFamily="monospace" fontSize="11" textAnchor="middle">W</text>

              {/* Hour tick marks */}
              {[6, 8, 10, 12, 14, 16, 18].map(h => {
                const a = ((h - 6) / 12) * Math.PI;
                const tx = 250 - 200 * Math.cos(a);
                const ty = 240 - 200 * Math.sin(a);
                return (
                  <g key={h}>
                    <circle cx={tx} cy={ty} r="2" fill="#1e1e1e" />
                    <text
                      x={tx}
                      y={ty - 8}
                      fill="#2a2a2a"
                      fontFamily="monospace"
                      fontSize="8"
                      textAnchor="middle"
                    >{h}:00</text>
                  </g>
                );
              })}

              {isDaytime ? (
                <>
                  {/* Sun glow */}
                  <circle cx={sunX} cy={sunY} r="40" fill="url(#sunGlow)" />

                  {/* Sun body */}
                  <circle cx={sunX} cy={sunY} r="18" fill="#F59E0B" />

                  {/* Sun rays */}
                  <g style={{ transformOrigin: `${sunX}px ${sunY}px`, animation: 'spinSlow 8s linear infinite' }}>
                    {Array.from({ length: 8 }, (_, i) => {
                      const a = (i * 45 * Math.PI) / 180;
                      return (
                        <line
                          key={i}
                          x1={sunX + 22 * Math.cos(a)}
                          y1={sunY + 22 * Math.sin(a)}
                          x2={sunX + 30 * Math.cos(a)}
                          y2={sunY + 30 * Math.sin(a)}
                          stroke="#F59E0B"
                          strokeWidth={2}
                          opacity={0.7}
                        />
                      );
                    })}
                  </g>

                  {/* Elevation label */}
                  <text
                    x={sunX + 28}
                    y={sunY - 4}
                    fill="#F59E0B"
                    fontFamily="monospace"
                    fontSize="10"
                    opacity="0.8"
                  >{elevation.toFixed(1)}°</text>
                </>
              ) : (
                /* Moon icon when nighttime */
                <g transform={`translate(250, 120)`}>
                  <circle cx="0" cy="0" r="18" fill="#1a1a2e" stroke="#444" strokeWidth="1" />
                  <circle cx="6" cy="-4" r="13" fill="#0a0a0a" />
                  <text x="-4" y="5" fill="#888" fontFamily="monospace" fontSize="14">☽</text>
                </g>
              )}

              {/* Status label */}
              <text x="250" y="298" fill="#333" fontFamily="monospace" fontSize="9" textAnchor="middle" letterSpacing="2">
                {isDaytime ? `HOUR ${hour.toFixed(2)} · ELEVATION ${elevation.toFixed(1)}°` : 'NIGHT · SUN BELOW HORIZON'}
              </text>
            </svg>
          </div>
        </motion.div>

        {/* Panel Tracker */}
        <motion.div variants={itemVariants} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
          <div className="font-mono text-[10px] text-[#444] tracking-widest mb-3">PANEL TRACKER · DUAL-AXIS</div>
          <svg viewBox="0 0 300 300" className="w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="panelGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e3a5f" />
                <stop offset="100%" stopColor="#0f2040" />
              </linearGradient>
            </defs>

            {/* Ground */}
            <rect x="0" y="240" width="300" height="60" fill="#0d0d0d" />
            <line x1="0" y1="240" x2="300" y2="240" stroke="#1a1a1a" strokeWidth="1" />

            {/* Mounting post */}
            <rect x="146" y="180" width="8" height="60" rx="2" fill="#1a1a1a" />
            <ellipse cx="150" cy="240" rx="14" ry="4" fill="#111" />

            {/* Protractor arc */}
            <path
              d="M 110 200 A 40 40 0 0 1 190 200"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="1"
              strokeDasharray="3 3"
            />

            {/* Tilt angle indicator */}
            {isDaytime && panelTilt > 0 && (
              <path
                d={`M 150 200 L ${150 - 40 * Math.sin((panelTilt * Math.PI) / 180)} ${200 - 40 * Math.cos((panelTilt * Math.PI) / 180)}`}
                stroke="#F59E0B"
                strokeWidth="1.5"
                strokeOpacity="0.5"
              />
            )}

            {/* Solar panel */}
            <g transform={`rotate(${-panelTilt}, 150, 180)`}>
              {/* Panel body */}
              <rect x="110" y="155" width="80" height="50" rx="3" fill="url(#panelGrad)" stroke="#3B82F6" strokeWidth="1.5" />

              {/* Cell grid */}
              {[0, 1, 2, 3].map(col =>
                [0, 1].map(row => (
                  <rect
                    key={`${col}-${row}`}
                    x={113 + col * 19}
                    y={158 + row * 22}
                    width="17"
                    height="19"
                    rx="1"
                    fill="#0f2040"
                    stroke="#3B82F6"
                    strokeWidth="0.5"
                    strokeOpacity="0.4"
                  />
                ))
              )}

              {/* Anti-reflection coating shimmer */}
              <rect x="110" y="155" width="80" height="50" rx="3" fill="white" fillOpacity="0.03" />
            </g>

            {/* Azimuth compass base */}
            <ellipse cx="150" cy="268" rx="30" ry="8" fill="none" stroke="#1a1a1a" strokeWidth="1" />
            <text x="122" y="272" fill="#333" fontFamily="monospace" fontSize="7">W</text>
            <text x="174" y="272" fill="#333" fontFamily="monospace" fontSize="7">E</text>
            <text x="148" y="258" fill="#F59E0B" fontFamily="monospace" fontSize="7">N</text>

            {/* Azimuth needle */}
            <line
              x1="150"
              y1="268"
              x2={150 + 28 * Math.sin(((azimuth - 90) * Math.PI) / 180)}
              y2={268 - 8 * Math.cos(((azimuth - 90) * Math.PI) / 180)}
              stroke="#F59E0B"
              strokeWidth="1.5"
              opacity="0.8"
            />

            {/* Labels */}
            <text x="150" y="20" fill="#555" fontFamily="monospace" fontSize="9" textAnchor="middle">
              TILT: {panelTilt.toFixed(1)}°
            </text>
            <text x="150" y="33" fill="#555" fontFamily="monospace" fontSize="9" textAnchor="middle">
              AZ: {azimuth.toFixed(1)}°
            </text>
          </svg>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {STAT_CARDS.map(card => {
          const raw = { elevation, azimuth, irradiance, panelPower }[card.key];
          const value = typeof raw === 'number' && !Number.isInteger(raw) ? (raw as number).toFixed(1) : raw;
          return (
            <div key={card.key} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
              <div className="font-mono text-[9px] text-[#444] tracking-widest mb-1">{card.label.toUpperCase()}</div>
              <div className="font-heading font-black text-2xl text-frost">
                {value}
                <span className="text-sm text-[#F59E0B] font-mono font-normal">{card.unit}</span>
              </div>
            </div>
          );
        })}

        {/* Panel Tilt card */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
          <div className="font-mono text-[9px] text-[#444] tracking-widest mb-1">PANEL TILT</div>
          <div className="font-heading font-black text-2xl text-frost">
            {elevation.toFixed(1)}
            <span className="text-sm text-[#F59E0B] font-mono font-normal">°</span>
          </div>
        </div>

        {/* Tracking Mode card */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
          <div className="font-mono text-[9px] text-[#444] tracking-widest mb-1">TRACKING MODE</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 font-mono text-[10px] px-2 py-0.5 rounded tracking-widest">
              DUAL-AXIS
            </span>
          </div>
        </div>

        {/* Status card */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
          <div className="font-mono text-[9px] text-[#444] tracking-widest mb-1">STATUS</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isDaytime ? 'bg-[#10B981] animate-pulse' : 'bg-[#444]'}`} />
            <span className={`font-mono text-[10px] tracking-widest ${isDaytime ? 'text-[#10B981]' : 'text-[#444]'}`}>
              {isDaytime ? 'TRACKING' : 'STOWED'}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
