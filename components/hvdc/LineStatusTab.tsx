'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type BreakerState = 'CLOSED' | 'OPEN' | 'TRIPPING';

interface Breaker {
  id: string;
  label: string;
  state: BreakerState;
}

interface LinkData {
  voltage: number;
  current: number;
  power: number;
  frequency: number;
}

const ACCENT = '#06B6D4';

function getBreakerColor(state: BreakerState) {
  if (state === 'CLOSED')   return '#22C55E';
  if (state === 'TRIPPING') return '#F59E0B';
  return '#EF4444';
}

function BreakerSymbol({ state, label, onClick }: { state: BreakerState; label: string; onClick: () => void }) {
  const color = getBreakerColor(state);
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <rect x="-22" y="-18" width="44" height="36" fill="transparent" />
      {/* Contacts */}
      <line x1="-22" y1="0" x2="-8" y2="0" stroke={color} strokeWidth="2.5" />
      <line x1="8" y1="0" x2="22" y2="0" stroke={color} strokeWidth="2.5" />
      {/* Movable contact */}
      {state === 'CLOSED' && (
        <line x1="-8" y1="0" x2="8" y2="0" stroke={color} strokeWidth="2.5" />
      )}
      {state === 'TRIPPING' && (
        <motion.line
          x1="-8" y1="0" x2="8" y2="-12"
          stroke={color} strokeWidth="2.5"
          animate={{ rotate: [0, -30, 0] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        />
      )}
      {state === 'OPEN' && (
        <line x1="-8" y1="0" x2="5" y2="-10" stroke={color} strokeWidth="2.5" />
      )}
      {/* Box */}
      <rect x="-10" y="-14" width="20" height="28" fill="#111" stroke={color} strokeWidth="1"
        rx="3" opacity="0.9" />
      <text x="0" y="20" textAnchor="middle" fill={color} fontSize="8" fontFamily="monospace">{label}</text>
      {/* State glow */}
      {state === 'TRIPPING' && (
        <circle cx="0" cy="0" r="18" fill="none" stroke={color} strokeWidth="1" opacity="0.3" className="animate-glow" />
      )}
    </g>
  );
}

export function LineStatusTab() {
  const [breakers, setBreakers] = useState<Breaker[]>([
    { id: 'B1', label: 'B1', state: 'CLOSED' },
    { id: 'B2', label: 'B2', state: 'CLOSED' },
    { id: 'B3', label: 'B3', state: 'CLOSED' },
  ]);
  const [link, setLink] = useState<LinkData>({ voltage: 320.4, current: 847, power: 271.4, frequency: 50.0 });
  const [faultActive, setFaultActive] = useState(false);
  const [tripLog, setTripLog] = useState<{ time: string; msg: string; color: string }[]>([]);
  const tickRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current++;
      setLink(prev => ({
        voltage:   +( prev.voltage + (Math.random() - 0.5) * 0.8 ).toFixed(1),
        current:   +( prev.current + (Math.random() - 0.5) * 12  ).toFixed(0),
        power:     +( (prev.voltage * prev.current / 1000) ).toFixed(1),
        frequency: +( 50 + (Math.random() - 0.5) * 0.04 ).toFixed(3),
      }));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const tripBreaker = (id: string) => {
    setBreakers(prev => prev.map(b => b.id === id ? { ...b, state: 'TRIPPING' } : b));
    setTimeout(() => {
      setBreakers(prev => prev.map(b => b.id === id ? { ...b, state: 'OPEN' } : b));
      const now = new Date().toLocaleTimeString();
      setTripLog(prev => [{ time: now, msg: `${id} TRIPPED — Manual command`, color: '#EF4444' }, ...prev.slice(0, 9)]);
    }, 800);
  };

  const closeBreaker = (id: string) => {
    setBreakers(prev => prev.map(b => b.id === id ? { ...b, state: 'CLOSED' } : b));
    const now = new Date().toLocaleTimeString();
    setTripLog(prev => [{ time: now, msg: `${id} CLOSED — Remote command`, color: '#22C55E' }, ...prev.slice(0, 9)]);
  };

  const triggerFault = () => {
    if (faultActive) return;
    setFaultActive(true);
    setBreakers(prev => prev.map(b => ({ ...b, state: 'TRIPPING' as BreakerState })));
    const now = new Date().toLocaleTimeString();
    setTripLog(prev => [
      { time: now, msg: 'B1 TRIPPED — OCP: 2.8× nominal', color: '#EF4444' },
      { time: now, msg: 'B2 TRIPPED — OCP: 2.8× nominal', color: '#EF4444' },
      { time: now, msg: 'B3 TRIPPED — OCP: 2.8× nominal', color: '#EF4444' },
      { time: now, msg: 'FAULT DETECTED: Overcurrent event', color: '#F59E0B' },
      ...prev.slice(0, 6),
    ]);
    setTimeout(() => {
      setBreakers(prev => prev.map(b => ({ ...b, state: 'OPEN' as BreakerState })));
      setTimeout(() => setFaultActive(false), 3000);
    }, 1000);
  };

  const resetAll = () => {
    setBreakers(prev => prev.map(b => ({ ...b, state: 'CLOSED' as BreakerState })));
    const now = new Date().toLocaleTimeString();
    setTripLog(prev => [{ time: now, msg: 'ALL BREAKERS — Auto-reclose sequence', color: '#22C55E' }, ...prev.slice(0, 9)]);
  };

  const allClosed  = breakers.every(b => b.state === 'CLOSED');
  const anyTripped = breakers.some(b => b.state === 'OPEN' || b.state === 'TRIPPING');
  const linkStatus = faultActive ? 'FAULT' : anyTripped ? 'OPEN' : 'NOMINAL';
  const statusColor = linkStatus === 'NOMINAL' ? '#22C55E' : linkStatus === 'FAULT' ? '#EF4444' : '#F59E0B';

  // Flow lines dash animation
  const flowActive = allClosed && !faultActive;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-black text-frost text-2xl">Line Status</h2>
          <p className="font-mono text-[#444] text-xs mt-1">bipolar HVDC link · ±320 kV · VSC topology</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColor, boxShadow: `0 0 8px ${statusColor}` }}
          />
          <span className="font-mono text-xs" style={{ color: statusColor }}>{linkStatus}</span>
        </div>
      </div>

      {/* SVG Diagram */}
      <div className="border border-[#1a1a1a] rounded-xl bg-[#080808] p-4 overflow-x-auto">
        <p className="font-mono text-[#333] text-[9px] mb-3 uppercase tracking-widest">HVDC Single-Line Diagram</p>
        <svg viewBox="0 0 900 240" className="w-full min-w-[700px]" style={{ height: 240 }}>
          {/* Grid lines */}
          {[60, 120, 180].map(y => (
            <line key={y} x1="0" y1={y} x2="900" y2={y} stroke="#111" strokeWidth="1" strokeDasharray="4 8" />
          ))}

          {/* ===== POSITIVE POLE (+320kV) ===== */}
          {/* Left AC Grid */}
          <text x="20" y="55" fill="#555" fontSize="8" fontFamily="monospace">AC GRID A</text>
          {[58, 68, 78].map((y, i) => (
            <line key={i} x1="18" y1={y} x2="30" y2={y} stroke="#555" strokeWidth="1.5" />
          ))}
          {/* Transformer A */}
          <circle cx="55" cy="74" r="16" fill="none" stroke="#444" strokeWidth="1.5" />
          <circle cx="75" cy="74" r="16" fill="none" stroke="#444" strokeWidth="1.5" />
          <text x="65" y="100" textAnchor="middle" fill="#444" fontSize="7" fontFamily="monospace">TR-A</text>

          {/* VSC Converter A */}
          <rect x="100" y="58" width="40" height="32" rx="4" fill="#111" stroke={ACCENT} strokeWidth="1.5" />
          <text x="120" y="77" textAnchor="middle" fill={ACCENT} fontSize="7" fontFamily="monospace">VSC-A</text>
          <text x="120" y="100" textAnchor="middle" fill="#333" fontSize="6" fontFamily="monospace">RECT</text>

          {/* Smoothing Reactor A */}
          {[0,1,2,3].map(i => (
            <path key={i} d={`M ${152 + i*8} 74 a4 4 0 0 1 8 0`} fill="none" stroke={ACCENT} strokeWidth="1.5" />
          ))}

          {/* +320kV DC line */}
          <text x="450" y="48" textAnchor="middle" fill={ACCENT} fontSize="8" fontFamily="monospace">+320 kV</text>
          <line x1="185" y1="74" x2="715" y2="74"
            stroke={flowActive ? ACCENT : '#333'}
            strokeWidth={flowActive ? 2.5 : 1.5}
            strokeDasharray={flowActive ? '12 8' : '4 4'}
            className={flowActive ? 'animate-dash' : ''}
          />

          {/* Breakers on positive pole */}
          <g transform="translate(320, 74)"><BreakerSymbol state={breakers[0].state} label="B1+" onClick={() => breakers[0].state === 'CLOSED' ? tripBreaker('B1') : closeBreaker('B1')} /></g>
          <g transform="translate(450, 74)"><BreakerSymbol state={breakers[1].state} label="B2+" onClick={() => breakers[1].state === 'CLOSED' ? tripBreaker('B2') : closeBreaker('B2')} /></g>
          <g transform="translate(580, 74)"><BreakerSymbol state={breakers[2].state} label="B3+" onClick={() => breakers[2].state === 'CLOSED' ? tripBreaker('B3') : closeBreaker('B3')} /></g>

          {/* Smoothing Reactor B */}
          {[0,1,2,3].map(i => (
            <path key={i} d={`M ${715 + i*8} 74 a4 4 0 0 1 8 0`} fill="none" stroke={ACCENT} strokeWidth="1.5" />
          ))}

          {/* VSC Converter B */}
          <rect x="758" y="58" width="40" height="32" rx="4" fill="#111" stroke={ACCENT} strokeWidth="1.5" />
          <text x="778" y="77" textAnchor="middle" fill={ACCENT} fontSize="7" fontFamily="monospace">VSC-B</text>
          <text x="778" y="100" textAnchor="middle" fill="#333" fontSize="6" fontFamily="monospace">INV</text>

          {/* Transformer B */}
          <circle cx="808" cy="74" r="16" fill="none" stroke="#444" strokeWidth="1.5" />
          <circle cx="828" cy="74" r="16" fill="none" stroke="#444" strokeWidth="1.5" />
          <text x="820" y="100" textAnchor="middle" fill="#444" fontSize="7" fontFamily="monospace">TR-B</text>

          {/* Right AC Grid */}
          <text x="848" y="55" fill="#555" fontSize="8" fontFamily="monospace">AC GRID B</text>
          {[58, 68, 78].map((y, i) => (
            <line key={i} x1="845" y1={y} x2="857" y2={y} stroke="#555" strokeWidth="1.5" />
          ))}

          {/* ===== NEGATIVE POLE (-320kV) ===== */}
          <text x="450" y="145" textAnchor="middle" fill="#8B5CF6" fontSize="8" fontFamily="monospace">-320 kV</text>
          <line x1="91" y1="160" x2="810" y2="160"
            stroke={flowActive ? '#8B5CF6' : '#333'}
            strokeWidth={flowActive ? 2.5 : 1.5}
            strokeDasharray={flowActive ? '12 8' : '4 4'}
            className={flowActive ? 'animate-dash' : ''}
            style={flowActive ? { animationDirection: 'reverse' } : {}}
          />

          {/* Breakers on negative pole */}
          <g transform="translate(320, 160)"><BreakerSymbol state={breakers[0].state} label="B1-" onClick={() => breakers[0].state === 'CLOSED' ? tripBreaker('B1') : closeBreaker('B1')} /></g>
          <g transform="translate(450, 160)"><BreakerSymbol state={breakers[1].state} label="B2-" onClick={() => breakers[1].state === 'CLOSED' ? tripBreaker('B2') : closeBreaker('B2')} /></g>
          <g transform="translate(580, 160)"><BreakerSymbol state={breakers[2].state} label="B3-" onClick={() => breakers[2].state === 'CLOSED' ? tripBreaker('B3') : closeBreaker('B3')} /></g>

          {/* Vertical connections at converters */}
          <line x1="120" y1="90" x2="120" y2="160" stroke="#333" strokeWidth="1" />
          <line x1="91" y1="74" x2="91" y2="160" stroke="#333" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="778" y1="90" x2="778" y2="160" stroke="#333" strokeWidth="1" />
          <line x1="810" y1="74" x2="810" y2="160" stroke="#333" strokeWidth="1" strokeDasharray="3 3" />

          {/* Ground */}
          <line x1="450" y1="195" x2="450" y2="210" stroke="#333" strokeWidth="1.5" />
          {[0,1,2].map(i => (
            <line key={i} x1={450 - 12 + i*12} y1={210 + i*4} x2={450 + 12 - i*12} y2={210 + i*4} stroke="#333" strokeWidth="1.5" />
          ))}
          <text x="450" y="230" textAnchor="middle" fill="#333" fontSize="7" fontFamily="monospace">EARTH RETURN</text>

          {/* Voltage measurements */}
          {[320, 450, 580].map((x, i) => (
            <g key={i}>
              <line x1={x} y1="86" x2={x} y2="148" stroke="#222" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx={x} cy="117" r="6" fill="#111" stroke="#222" strokeWidth="1" />
              <text x={x} y="121" textAnchor="middle" fill="#444" fontSize="5" fontFamily="monospace">V</text>
            </g>
          ))}

          {/* Raspberry Pi symbol */}
          <rect x="390" y="195" width="120" height="32" rx="4" fill="#111" stroke="#333" strokeWidth="1" />
          <text x="450" y="208" textAnchor="middle" fill="#888" fontSize="7" fontFamily="monospace">Raspberry Pi 4B</text>
          <text x="450" y="220" textAnchor="middle" fill="#444" fontSize="6" fontFamily="monospace">PROTECTION RELAY CONTROLLER</text>
          {/* GPIO lines */}
          {[320, 450, 580].map(x => (
            <line key={x} x1={x} y1="160" x2={x} y2="195" stroke="#222" strokeWidth="1" strokeDasharray="2 3" />
          ))}
        </svg>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'DC LINK VOLTAGE', value: `${link.voltage} kV`, sub: 'bipolar ±320kV nominal', color: ACCENT },
          { label: 'DC CURRENT', value: `${link.current} A`, sub: 'nominal 850 A rated', color: '#22C55E' },
          { label: 'POWER TRANSFER', value: `${link.power} MW`, sub: 'rated 272 MW', color: '#F59E0B' },
          { label: 'AC FREQUENCY', value: `${link.frequency} Hz`, sub: '50.0 Hz nominal', color: '#8B5CF6' },
        ].map(card => (
          <div key={card.label} className="border border-[#1a1a1a] rounded-xl p-4 bg-[#080808]">
            <p className="font-mono text-[#444] text-[9px] tracking-widest uppercase mb-2">{card.label}</p>
            <p className="font-heading font-black text-2xl" style={{ color: card.color }}>{card.value}</p>
            <p className="font-mono text-[#333] text-[9px] mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Controls + Log */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Breaker controls */}
        <div className="border border-[#1a1a1a] rounded-xl p-4 bg-[#080808]">
          <p className="font-mono text-[#444] text-[9px] tracking-widest uppercase mb-4">REMOTE CONTROL · GPIO OUTPUT</p>
          <div className="space-y-3">
            {breakers.map(b => (
              <div key={b.id} className="flex items-center gap-3">
                <span className="font-mono text-xs text-[#666] w-8">{b.id}</span>
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getBreakerColor(b.state) }} />
                  <span className="font-mono text-xs" style={{ color: getBreakerColor(b.state) }}>{b.state}</span>
                </div>
                <button
                  onClick={() => b.state === 'CLOSED' ? tripBreaker(b.id) : closeBreaker(b.id)}
                  disabled={b.state === 'TRIPPING'}
                  className="px-3 py-1 rounded font-mono text-[10px] tracking-wider border transition-colors disabled:opacity-30"
                  style={b.state === 'CLOSED'
                    ? { borderColor: '#EF444440', color: '#EF4444', backgroundColor: '#EF444408' }
                    : { borderColor: '#22C55E40', color: '#22C55E', backgroundColor: '#22C55E08' }}
                >
                  {b.state === 'CLOSED' ? 'TRIP' : 'CLOSE'}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#111] flex gap-2">
            <button
              onClick={triggerFault}
              disabled={faultActive}
              className="flex-1 py-2 rounded-lg font-mono text-[10px] tracking-widest border border-[#EF444430] text-[#EF4444] bg-[#EF444408] hover:bg-[#EF444415] transition-colors disabled:opacity-30"
            >
              INJECT FAULT
            </button>
            <button
              onClick={resetAll}
              className="flex-1 py-2 rounded-lg font-mono text-[10px] tracking-widest border border-[#06B6D430] text-[#06B6D4] bg-[#06B6D408] hover:bg-[#06B6D415] transition-colors"
            >
              AUTO-RECLOSE
            </button>
          </div>
        </div>

        {/* Trip log */}
        <div className="border border-[#1a1a1a] rounded-xl p-4 bg-[#080808]">
          <p className="font-mono text-[#444] text-[9px] tracking-widest uppercase mb-4">SCADA EVENT LOG</p>
          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            <AnimatePresence>
              {tripLog.length === 0 && (
                <p className="font-mono text-[#333] text-xs">No events recorded.</p>
              )}
              {tripLog.map((entry, i) => (
                <motion.div
                  key={`${entry.time}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2"
                >
                  <span className="font-mono text-[#333] text-[9px] mt-0.5 shrink-0">{entry.time}</span>
                  <span className="font-mono text-[10px]" style={{ color: entry.color }}>{entry.msg}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
