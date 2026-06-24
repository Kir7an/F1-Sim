'use client';
import { useEffect, useRef, useState } from 'react';

const ACCENT = '#06B6D4';
const W = 860;
const H = 120;
const BUFFER = 200;

function useWaveBuffer(initial: number, noise: number, drift?: () => number) {
  const buf = useRef<number[]>(Array(BUFFER).fill(initial));
  const update = (val: number) => {
    buf.current = [...buf.current.slice(1), val];
  };
  return { buf, update };
}

function WaveformPlot({
  label, unit, data, color, min, max, thresholdHigh, thresholdLow, yLabel,
}: {
  label: string; unit: string; data: number[]; color: string;
  min: number; max: number; thresholdHigh?: number; thresholdLow?: number; yLabel: string;
}) {
  const range = max - min;
  const toY = (v: number) => H - 8 - ((v - min) / range) * (H - 16);
  const points = data.map((v, i) => `${(i / (BUFFER - 1)) * W},${toY(v)}`).join(' ');
  const current = data[data.length - 1];

  return (
    <div className="border border-[#1a1a1a] rounded-xl bg-[#080808] p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-mono text-[#444] text-[9px] tracking-widest uppercase">{label}</p>
          <p className="font-heading font-black text-lg" style={{ color }}>{current.toFixed(unit === 'Hz' ? 3 : 1)} <span className="font-mono font-normal text-xs text-[#444]">{unit}</span></p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[#333] text-[8px]">MAX {max} {unit}</p>
          <p className="font-mono text-[#333] text-[8px]">MIN {min} {unit}</p>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {/* Grid */}
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f} x1="0" y1={H * f} x2={W} y2={H * f} stroke="#111" strokeWidth="1" />
        ))}
        {/* Thresholds */}
        {thresholdHigh !== undefined && (
          <>
            <line x1="0" y1={toY(thresholdHigh)} x2={W} y2={toY(thresholdHigh)}
              stroke="#EF4444" strokeWidth="1" strokeDasharray="6 4" opacity="0.6" />
            <text x={W - 2} y={toY(thresholdHigh) - 3} textAnchor="end" fill="#EF4444" fontSize="7" fontFamily="monospace">TRIP {thresholdHigh}{unit}</text>
          </>
        )}
        {thresholdLow !== undefined && (
          <>
            <line x1="0" y1={toY(thresholdLow)} x2={W} y2={toY(thresholdLow)}
              stroke="#EF4444" strokeWidth="1" strokeDasharray="6 4" opacity="0.6" />
            <text x={W - 2} y={toY(thresholdLow) + 9} textAnchor="end" fill="#EF4444" fontSize="7" fontFamily="monospace">TRIP {thresholdLow}{unit}</text>
          </>
        )}
        {/* Zero line */}
        {min < 0 && max > 0 && (
          <line x1="0" y1={toY(0)} x2={W} y2={toY(0)} stroke="#222" strokeWidth="1" />
        )}
        {/* Waveform */}
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Glow */}
        <polyline points={points} fill="none" stroke={color} strokeWidth="4" opacity="0.08" strokeLinecap="round" strokeLinejoin="round" />
        {/* Current value dot */}
        <circle cx={W} cy={toY(current)} r="3" fill={color} />
        <circle cx={W} cy={toY(current)} r="6" fill={color} opacity="0.2" />
        {/* Y label */}
        <text x="4" y="10" fill="#333" fontSize="7" fontFamily="monospace">{yLabel}</text>
        {/* Time label */}
        <text x={W - 4} y={H - 2} textAnchor="end" fill="#222" fontSize="7" fontFamily="monospace">← 20s</text>
      </svg>
    </div>
  );
}

export function WaveformsTab() {
  const [tick, setTick] = useState(0);
  const [faultMode, setFaultMode] = useState(false);
  const faultModeRef = useRef(false);

  const vBuf   = useRef<number[]>(Array(BUFFER).fill(320.4));
  const iBuf   = useRef<number[]>(Array(BUFFER).fill(847));
  const dvBuf  = useRef<number[]>(Array(BUFFER).fill(0));
  const pwrBuf = useRef<number[]>(Array(BUFFER).fill(271.5));

  useEffect(() => {
    const interval = setInterval(() => {
      let newV: number, newI: number;
      if (faultModeRef.current) {
        newV = 290 + (Math.random() - 0.5) * 30;
        newI = 1900 + (Math.random() - 0.5) * 200;
      } else {
        const prevV = vBuf.current[vBuf.current.length - 1];
        const prevI = iBuf.current[iBuf.current.length - 1];
        newV = Math.max(315, Math.min(325, prevV + (Math.random() - 0.5) * 0.6));
        newI = Math.max(800, Math.min(900, prevI + (Math.random() - 0.5) * 10));
      }
      const prevV = vBuf.current[vBuf.current.length - 1];
      const dvdt  = (newV - prevV) / 0.1;
      const pwr   = (newV * newI) / 1000;

      vBuf.current   = [...vBuf.current.slice(1), newV];
      iBuf.current   = [...iBuf.current.slice(1), newI];
      dvBuf.current  = [...dvBuf.current.slice(1), dvdt];
      pwrBuf.current = [...pwrBuf.current.slice(1), pwr];
      setTick(t => t + 1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const triggerFault = () => {
    faultModeRef.current = true;
    setFaultMode(true);
    setTimeout(() => {
      faultModeRef.current = false;
      setFaultMode(false);
    }, 4000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-black text-frost text-2xl">Waveforms</h2>
          <p className="font-mono text-[#444] text-xs mt-1">100 ms sample rate · ADS1115 16-bit ADC · 20s scrolling window</p>
        </div>
        <div className="flex items-center gap-3">
          {faultMode && (
            <span className="font-mono text-[10px] text-[#EF4444] border border-[#EF444430] px-2 py-1 rounded animate-glow">
              OVERCURRENT FAULT
            </span>
          )}
          <button
            onClick={triggerFault}
            disabled={faultMode}
            className="px-4 py-2 rounded-lg font-mono text-[10px] tracking-widest border border-[#EF444430] text-[#EF4444] bg-[#EF444408] hover:bg-[#EF444415] transition-colors disabled:opacity-30"
          >
            INJECT OVERCURRENT
          </button>
        </div>
      </div>

      <WaveformPlot
        label="DC Link Voltage" unit="kV" data={vBuf.current} color={ACCENT}
        min={280} max={330} thresholdHigh={326} thresholdLow={295}
        yLabel="V_dc (kV)"
      />
      <WaveformPlot
        label="DC Current" unit="A" data={iBuf.current} color="#22C55E"
        min={600} max={2200} thresholdHigh={1275}
        yLabel="I_dc (A)"
      />
      <WaveformPlot
        label="dV/dt Rate-of-Change" unit="kV/s" data={dvBuf.current.map(v => v / 1000)} color="#F59E0B"
        min={-5} max={5} thresholdHigh={3} thresholdLow={-3}
        yLabel="dV/dt (kV/s)"
      />
      <WaveformPlot
        label="Power Transfer" unit="MW" data={pwrBuf.current} color="#8B5CF6"
        min={200} max={650} thresholdHigh={550}
        yLabel="P (MW)"
      />

      {/* Legend */}
      <div className="border border-[#1a1a1a] rounded-xl p-3 bg-[#080808]">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-px border-t border-dashed border-[#EF4444]" />
            <span className="font-mono text-[#444] text-[9px]">TRIP THRESHOLD</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-px bg-[#06B6D4]" />
            <span className="font-mono text-[#444] text-[9px]">V_DC</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-px bg-[#22C55E]" />
            <span className="font-mono text-[#444] text-[9px]">I_DC</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-px bg-[#F59E0B]" />
            <span className="font-mono text-[#444] text-[9px]">dV/dt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-px bg-[#8B5CF6]" />
            <span className="font-mono text-[#444] text-[9px]">POWER</span>
          </div>
        </div>
      </div>
    </div>
  );
}
