'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const ACCENT = '#06B6D4';

type RelayStatus = 'NORMAL' | 'PICKUP' | 'TRIP';

interface RelayState {
  status: RelayStatus;
  value: number;
  pickup: number;
  trip: number;
}

function statusColor(s: RelayStatus) {
  if (s === 'NORMAL') return '#22C55E';
  if (s === 'PICKUP') return '#F59E0B';
  return '#EF4444';
}

function GaugeBar({ value, max, color, threshold }: { value: number; max: number; color: string; threshold: number }) {
  const pct = Math.min(value / max, 1) * 100;
  const tPct = (threshold / max) * 100;
  return (
    <div className="relative h-3 bg-[#111] rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.3 }}
      />
      <div
        className="absolute top-0 bottom-0 w-px bg-[#EF4444]"
        style={{ left: `${tPct}%` }}
      />
    </div>
  );
}

function RelayCard({
  id, name, desc, relay, threshold, unit, firmware,
}: {
  id: string; name: string; desc: string;
  relay: RelayState; threshold: number; unit: string; firmware: string;
}) {
  const color = statusColor(relay.status);
  return (
    <div
      className="border rounded-xl p-5 bg-[#080808] transition-all"
      style={{ borderColor: relay.status !== 'NORMAL' ? `${color}40` : '#1a1a1a' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-mono text-[#444] text-[9px] tracking-widest uppercase">{id}</p>
          <p className="font-heading font-black text-frost text-lg mt-0.5">{name}</p>
          <p className="font-mono text-[#333] text-[9px] mt-0.5">{desc}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
            style={{ borderColor: `${color}40`, backgroundColor: `${color}10` }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-mono text-[9px]" style={{ color }}>{relay.status}</span>
          </div>
          <span className="font-mono text-[#333] text-[9px]">{firmware}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-mono text-[#444] text-[9px]">MEASURED VALUE</span>
            <span className="font-mono text-xs" style={{ color }}>{relay.value.toFixed(relay.value > 10 ? 0 : 2)} {unit}</span>
          </div>
          <GaugeBar value={relay.value} max={relay.trip * 1.5} color={color} threshold={relay.trip} />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="bg-[#0d0d0d] rounded-lg p-2">
            <p className="font-mono text-[#333] text-[8px] uppercase">Pickup</p>
            <p className="font-mono text-[#888] text-xs">{relay.pickup} {unit}</p>
          </div>
          <div className="bg-[#0d0d0d] rounded-lg p-2">
            <p className="font-mono text-[#333] text-[8px] uppercase">Trip</p>
            <p className="font-mono text-[#888] text-xs">{relay.trip} {unit}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProtectionTab() {
  const [ocRelay, setOcRelay] = useState<RelayState>({ status: 'NORMAL', value: 847, pickup: 1100, trip: 1275 });
  const [dvRelay, setDvRelay] = useState<RelayState>({ status: 'NORMAL', value: 0.2, pickup: 2.0, trip: 3.0 });
  const [dirRelay, setDirRelay] = useState<RelayState>({ status: 'NORMAL', value: 0.98, pickup: -0.1, trip: -0.3 });
  const [injecting, setInjecting] = useState<string | null>(null);
  const [ocThreshold, setOcThreshold] = useState(1275);
  const [dvThreshold, setDvThreshold] = useState(3.0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOcRelay(prev => {
        const val = prev.status === 'NORMAL'
          ? Math.max(800, Math.min(900, prev.value + (Math.random() - 0.5) * 12))
          : prev.value;
        const status: RelayStatus = val >= ocThreshold ? 'TRIP' : val >= 1100 ? 'PICKUP' : 'NORMAL';
        return { ...prev, value: val, status, trip: ocThreshold };
      });
      setDvRelay(prev => {
        const val = prev.status === 'NORMAL'
          ? Math.max(-0.5, Math.min(0.8, prev.value + (Math.random() - 0.5) * 0.15))
          : prev.value;
        const abs = Math.abs(val);
        const status: RelayStatus = abs >= dvThreshold ? 'TRIP' : abs >= 2.0 ? 'PICKUP' : 'NORMAL';
        return { ...prev, value: val, status, trip: dvThreshold };
      });
      setDirRelay(prev => {
        const val = Math.max(-1, Math.min(1, prev.value + (Math.random() - 0.5) * 0.02));
        const status: RelayStatus = val <= -0.3 ? 'TRIP' : val <= -0.1 ? 'PICKUP' : 'NORMAL';
        return { ...prev, value: val };
      });
    }, 500);
    return () => clearInterval(interval);
  }, [ocThreshold, dvThreshold]);

  const injectOvercurrent = () => {
    setInjecting('OCP');
    setOcRelay(prev => ({ ...prev, value: 2400, status: 'TRIP' }));
    setTimeout(() => {
      setOcRelay(prev => ({ ...prev, value: 847, status: 'NORMAL' }));
      setInjecting(null);
    }, 3000);
  };

  const injectRocov = () => {
    setInjecting('ROCOV');
    setDvRelay(prev => ({ ...prev, value: 8.5, status: 'TRIP' }));
    setTimeout(() => {
      setDvRelay(prev => ({ ...prev, value: 0.2, status: 'NORMAL' }));
      setInjecting(null);
    }, 3000);
  };

  const injectReverse = () => {
    setInjecting('DIR');
    setDirRelay(prev => ({ ...prev, value: -0.85, status: 'TRIP' }));
    setTimeout(() => {
      setDirRelay(prev => ({ ...prev, value: 0.98, status: 'NORMAL' }));
      setInjecting(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-black text-frost text-2xl">Protection</h2>
          <p className="font-mono text-[#444] text-xs mt-1">IEC 60255 · 3× relay functions · 50ms trip time</p>
        </div>
      </div>

      {/* Relay cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RelayCard
          id="50/51" name="Overcurrent" desc="Instantaneous + time-overcurrent"
          relay={ocRelay} threshold={ocThreshold} unit="A" firmware="v2.4.1"
        />
        <RelayCard
          id="ROCOV" name="Rate-of-Change" desc="dV/dt voltage derivative protection"
          relay={dvRelay} threshold={dvThreshold} unit="kV/s" firmware="v1.9.0"
        />
        <RelayCard
          id="67" name="Directional" desc="Reverse power / fault direction"
          relay={dirRelay} threshold={-0.3} unit="p.u." firmware="v3.1.2"
        />
      </div>

      {/* Settings + Injection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Threshold tuning */}
        <div className="border border-[#1a1a1a] rounded-xl p-5 bg-[#080808]">
          <p className="font-mono text-[#444] text-[9px] tracking-widest uppercase mb-4">PROTECTION SETTINGS</p>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-mono text-[#666] text-xs">OCP Trip Threshold</span>
                <span className="font-mono text-xs" style={{ color: ACCENT }}>{ocThreshold} A</span>
              </div>
              <input
                type="range" min={1000} max={2000} step={25}
                value={ocThreshold}
                onChange={e => setOcThreshold(+e.target.value)}
                className="w-full accent-[#06B6D4]"
              />
              <div className="flex justify-between mt-1">
                <span className="font-mono text-[#222] text-[8px]">1000 A</span>
                <span className="font-mono text-[#222] text-[8px]">2000 A</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-mono text-[#666] text-xs">ROCOV Trip Threshold</span>
                <span className="font-mono text-xs" style={{ color: ACCENT }}>{dvThreshold.toFixed(1)} kV/s</span>
              </div>
              <input
                type="range" min={1.0} max={8.0} step={0.5}
                value={dvThreshold}
                onChange={e => setDvThreshold(+e.target.value)}
                className="w-full accent-[#06B6D4]"
              />
              <div className="flex justify-between mt-1">
                <span className="font-mono text-[#222] text-[8px]">1.0 kV/s</span>
                <span className="font-mono text-[#222] text-[8px]">8.0 kV/s</span>
              </div>
            </div>
            <div className="border border-[#111] rounded-lg p-3">
              <p className="font-mono text-[#333] text-[8px] uppercase mb-2">Raspberry Pi GPIO Map</p>
              <div className="space-y-1">
                {[
                  { pin: 'GPIO 17', fn: 'B1 TRIP coil output' },
                  { pin: 'GPIO 27', fn: 'B2 TRIP coil output' },
                  { pin: 'GPIO 22', fn: 'B3 TRIP coil output' },
                  { pin: 'GPIO 5',  fn: 'OCP pickup indicator' },
                  { pin: 'GPIO 6',  fn: 'Fault LED output' },
                  { pin: 'ADS1115 A0', fn: 'V_DC measurement' },
                  { pin: 'ADS1115 A1', fn: 'I_DC (via Hall sensor)' },
                ].map(({ pin, fn }) => (
                  <div key={pin} className="flex gap-2">
                    <span className="font-mono text-[#444] text-[8px] w-24 shrink-0">{pin}</span>
                    <span className="font-mono text-[#333] text-[8px]">{fn}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fault injection */}
        <div className="border border-[#1a1a1a] rounded-xl p-5 bg-[#080808]">
          <p className="font-mono text-[#444] text-[9px] tracking-widest uppercase mb-4">FAULT INJECTION PANEL</p>
          <div className="space-y-3">
            {[
              { id: 'OCP', label: 'Overcurrent Fault', desc: '2.8× nominal (2,380 A) for 3s', color: '#EF4444', fn: injectOvercurrent },
              { id: 'ROCOV', label: 'dV/dt Fault', desc: '+8.5 kV/s rate-of-change event', color: '#F59E0B', fn: injectRocov },
              { id: 'DIR', label: 'Reverse Fault', desc: 'Power flow reversal — fault direction', color: '#8B5CF6', fn: injectReverse },
            ].map(({ id, label, desc, color, fn }) => (
              <button
                key={id}
                onClick={fn}
                disabled={injecting !== null}
                className="w-full flex items-center justify-between p-3 rounded-lg border transition-all disabled:opacity-30"
                style={{ borderColor: `${color}25`, backgroundColor: `${color}06` }}
              >
                <div className="text-left">
                  <p className="font-mono text-xs" style={{ color }}>{label}</p>
                  <p className="font-mono text-[#333] text-[9px] mt-0.5">{desc}</p>
                </div>
                {injecting === id ? (
                  <span className="font-mono text-[9px] text-[#444] animate-pulse">ACTIVE...</span>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" opacity="0.6">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          <div className="mt-4 border-t border-[#111] pt-4">
            <p className="font-mono text-[#333] text-[8px] uppercase mb-2">System Timings</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'DETECT TIME', val: '< 2 ms' },
                { label: 'TRIP TIME', val: '50 ms' },
                { label: 'ARC QUENCH', val: '< 5 ms' },
                { label: 'RECLOSE', val: '300 ms' },
              ].map(({ label, val }) => (
                <div key={label} className="bg-[#0d0d0d] rounded p-2">
                  <p className="font-mono text-[#333] text-[8px]">{label}</p>
                  <p className="font-mono text-[#888] text-xs">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
