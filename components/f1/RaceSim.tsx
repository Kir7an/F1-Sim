'use client';
import { useState, useCallback, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CIRCUITS } from '@/lib/f1/circuit-data';
import { AI_DRIVERS, DEFAULT_PLAYER_SETUP } from '@/lib/f1/car-presets';
import { simulateFullRace, formatLapTime, formatRaceTime, DEFAULT_STRATEGIES } from '@/lib/f1/simulator';
import type { CarSetup, StrategyConfig, FullRaceResult, EngineMode, TireManagement, RaceCarResult } from '@/lib/f1/types';

// ── SVG Circuit Map ──────────────────────────────────────────────────────────

function CircuitSVGMap({
  circuit,
  result,
}: {
  circuit: { coords: [number, number][]; laps: number; basePace: number };
  result: FullRaceResult;
}) {
  const xs = circuit.coords.map(([x]) => x);
  const zs = circuit.coords.map(([, z]) => z);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minZ = Math.min(...zs), maxZ = Math.max(...zs);
  const W = 340, H = 220, M = 22;
  const scaleX = maxX - minX || 1;
  const scaleZ = maxZ - minZ || 1;

  const toSVG = ([x, z]: [number, number]) => ({
    x: ((x - minX) / scaleX) * W + M,
    y: (1 - (z - minZ) / scaleZ) * H + M,
  });

  const pathD = circuit.coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${toSVG(c).x.toFixed(1)} ${toSVG(c).y.toFixed(1)}`)
    .join(' ') + ' Z';

  // Compute car positions from final race gaps
  const leaderTime = result.cars[0].totalTime;
  const avgLap = circuit.basePace;

  const carDots = result.cars.map(car => {
    const gap = car.totalTime - leaderTime;
    const fracBehind = (gap / avgLap) % 1;
    const trackFrac = (1 - fracBehind + Math.ceil(fracBehind)) % 1;
    const idx = Math.min(
      Math.floor(trackFrac * circuit.coords.length),
      circuit.coords.length - 1
    );
    const pt = toSVG(circuit.coords[idx]);
    return { ...car, svgX: pt.x, svgY: pt.y };
  });

  return (
    <svg viewBox={`0 0 ${W + 2 * M} ${H + 2 * M}`} className="w-full h-full">
      {/* Track shadow */}
      <path d={pathD} stroke="#111" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Track tarmac */}
      <path d={pathD} stroke="#2a2a2a" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Track centerline */}
      <path d={pathD} stroke="#444" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 6" />
      {/* Start/finish mark */}
      {(() => {
        const pt = toSVG(circuit.coords[0]);
        return <circle cx={pt.x} cy={pt.y} r={5} fill="#E8002D" opacity={0.8} />;
      })()}
      {/* Car dots — draw non-player first, then player on top */}
      {carDots.filter(c => !c.isPlayer).map(car => (
        <g key={car.driverId}>
          <circle cx={car.svgX} cy={car.svgY} r={4} fill={car.teamColor} />
        </g>
      ))}
      {carDots.filter(c => c.isPlayer).map(car => (
        <g key={car.driverId}>
          <circle cx={car.svgX} cy={car.svgY} r={7} fill="none" stroke="#FFD700" strokeWidth={2} opacity={0.6} />
          <circle cx={car.svgX} cy={car.svgY} r={5} fill="#FFD700" />
          <text x={car.svgX + 9} y={car.svgY + 4} fill="#FFD700" fontSize={8} fontFamily="monospace" fontWeight="bold">YOU</text>
        </g>
      ))}
    </svg>
  );
}

// ── Position ladder ──────────────────────────────────────────────────────────

function ResultsLadder({ result }: { result: FullRaceResult }) {
  const leader = result.cars[0];

  return (
    <div className="space-y-1">
      {result.cars.map((car, i) => {
        const gap = car.totalTime - leader.totalTime;
        const isPlayer = car.isPlayer;
        return (
          <motion.div
            key={car.driverId}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isPlayer
                ? 'bg-[#FFD700]/10 border border-[#FFD700]/30'
                : 'hover:bg-[#111]'
            }`}
          >
            <span className={`font-mono text-xs w-6 text-right ${i < 3 ? 'text-amber' : 'text-[#444]'}`}>
              P{car.finalPosition}
            </span>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: car.teamColor }} />
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-mono truncate ${isPlayer ? 'text-[#FFD700] font-bold' : 'text-frost'}`}>
                {isPlayer ? '★ YOU' : car.driverName}
              </p>
              <p className="text-[10px] text-[#444] font-mono truncate">{car.teamName}</p>
            </div>
            <div className="text-right flex-shrink-0">
              {i === 0 ? (
                <p className="font-mono text-[10px] text-amber">{formatRaceTime(car.totalTime)}</p>
              ) : (
                <p className="font-mono text-[10px] text-[#555]">+{gap.toFixed(3)}s</p>
              )}
              <p className="font-mono text-[9px] text-[#333]">{car.stops}-stop · FL {formatLapTime(car.fastestLap)}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Setup slider ─────────────────────────────────────────────────────────────

function SetupSlider({
  label, leftLabel, rightLabel, value, onChange, color = '#E8002D',
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (v: number) => void;
  color?: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="font-mono text-[10px] text-[#555] tracking-widest">{label}</span>
        <span className="font-mono text-[10px]" style={{ color }}>{value}</span>
      </div>
      <input
        type="range" min={0} max={100} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: color }}
      />
      <div className="flex justify-between mt-0.5">
        <span className="font-mono text-[9px] text-[#333]">{leftLabel}</span>
        <span className="font-mono text-[9px] text-[#333]">{rightLabel}</span>
      </div>
    </div>
  );
}

function TogglePicker<T extends string>({
  label, value, options, onChange,
}: {
  label: string;
  value: T;
  options: { val: T; label: string; color: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] text-[#555] tracking-widest mb-1.5">{label}</p>
      <div className="flex gap-1">
        {options.map(o => (
          <button
            key={o.val}
            onClick={() => onChange(o.val)}
            className="flex-1 py-1.5 rounded-lg border font-mono text-[10px] tracking-wider transition-all"
            style={{
              borderColor: value === o.val ? o.color + '80' : '#222',
              backgroundColor: value === o.val ? o.color + '18' : 'transparent',
              color: value === o.val ? o.color : '#555',
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Player strategy picker (simplified) ─────────────────────────────────────

const PLAYER_STRATEGIES: StrategyConfig[] = [
  {
    id: 'p1', name: '1-Stop M→H', color: '#e7c59a',
    stints: [
      { compound: 'MEDIUM', startLap: 1, startTireAge: 0 },
      { compound: 'HARD', startLap: 22, startTireAge: 0 },
    ],
  },
  {
    id: 'p2', name: '2-Stop S→M→H', color: '#00D7B6',
    stints: [
      { compound: 'SOFT', startLap: 1, startTireAge: 0 },
      { compound: 'MEDIUM', startLap: 16, startTireAge: 0 },
      { compound: 'HARD', startLap: 33, startTireAge: 0 },
    ],
  },
  {
    id: 'p3', name: '1-Stop H→S (undercut)', color: '#ED1131',
    stints: [
      { compound: 'HARD', startLap: 1, startTireAge: 0 },
      { compound: 'SOFT', startLap: 32, startTireAge: 0 },
    ],
  },
];

// ── Main component ───────────────────────────────────────────────────────────

export function RaceSim() {
  const [circuitId, setCircuitId]     = useState('silverstone');
  const [trackTemp, setTrackTemp]     = useState(32);
  const [safetyCarLap, setSafetyCarLap] = useState<number | null>(null);
  const [playerSetup, setPlayerSetup] = useState<CarSetup>(DEFAULT_PLAYER_SETUP);
  const [playerStrategy, setPlayerStrategy] = useState<StrategyConfig>(PLAYER_STRATEGIES[0]);
  const [result, setResult]           = useState<FullRaceResult | null>(null);
  const [isPending, startTransition]  = useTransition();

  const circuit = CIRCUITS.find(c => c.id === circuitId) ?? CIRCUITS[0];

  const setSetup = (patch: Partial<CarSetup>) =>
    setPlayerSetup(s => ({ ...s, ...patch }));

  const runRace = useCallback(() => {
    startTransition(() => {
      const r = simulateFullRace(circuit, playerSetup, playerStrategy, AI_DRIVERS, trackTemp, safetyCarLap);
      setResult(r);
    });
  }, [circuit, playerSetup, playerStrategy, trackTemp, safetyCarLap]);

  const playerResult = result?.cars.find(c => c.isPlayer);

  return (
    <div className="space-y-5">
      {/* Row 1: Setup + Circuit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Car Setup */}
        <div className="lg:col-span-2 border border-[#222] rounded-xl bg-[#0d0d0d] p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-3 h-3 rounded-full bg-[#FFD700]" />
            <p className="font-mono text-[10px] text-[#FFD700] tracking-widest">MY CAR SETUP</p>
            <span className="font-mono text-[9px] text-[#333] ml-auto">Tune before the race</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <SetupSlider
              label="AERO BALANCE"
              leftLabel="Low Drag (Straights)"
              rightLabel="High DF (Corners)"
              value={playerSetup.aeroPriority}
              onChange={v => setSetup({ aeroPriority: v })}
              color="#00D7B6"
            />
            <SetupSlider
              label="SUSPENSION STIFFNESS"
              leftLabel="Soft (Tire Life)"
              rightLabel="Stiff (Lap Time)"
              value={playerSetup.suspensionStiffness}
              onChange={v => setSetup({ suspensionStiffness: v })}
              color="#6C98FF"
            />
            <TogglePicker<EngineMode>
              label="ENGINE MODE"
              value={playerSetup.engineMode}
              onChange={v => setSetup({ engineMode: v })}
              options={[
                { val: 'conservation', label: 'ECO', color: '#39B54A' },
                { val: 'race',         label: 'RACE', color: '#e7c59a' },
                { val: 'qualify',      label: 'PUSH', color: '#E8002D' },
              ]}
            />
            <TogglePicker<TireManagement>
              label="TIRE MANAGEMENT"
              value={playerSetup.tireManagement}
              onChange={v => setSetup({ tireManagement: v })}
              options={[
                { val: 'conservative', label: 'EASY', color: '#39B54A' },
                { val: 'balanced',     label: 'BALANCED', color: '#e7c59a' },
                { val: 'aggressive',   label: 'PUSH', color: '#E8002D' },
              ]}
            />
          </div>

          {/* Pit Strategy */}
          <div className="mt-5 pt-4 border-t border-[#1a1a1a]">
            <p className="font-mono text-[10px] text-[#444] tracking-widest mb-3">PIT STRATEGY</p>
            <div className="flex gap-2 flex-wrap">
              {PLAYER_STRATEGIES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setPlayerStrategy(s)}
                  className="px-3 py-1.5 rounded-lg border font-mono text-[10px] tracking-wider transition-all"
                  style={{
                    borderColor: playerStrategy.id === s.id ? s.color + '80' : '#222',
                    backgroundColor: playerStrategy.id === s.id ? s.color + '15' : 'transparent',
                    color: playerStrategy.id === s.id ? s.color : '#555',
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Circuit + Run */}
        <div className="border border-[#222] rounded-xl bg-[#0d0d0d] p-5 flex flex-col gap-4">
          <div>
            <p className="font-mono text-[10px] text-[#444] tracking-widest mb-2">CIRCUIT</p>
            <select
              value={circuitId}
              onChange={e => { setCircuitId(e.target.value); setResult(null); }}
              className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-frost text-sm font-mono appearance-none cursor-pointer focus:outline-none focus:border-[#E8002D]/50"
            >
              {CIRCUITS.map(c => (
                <option key={c.id} value={c.id}>{c.flag} {c.shortName}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-1.5 mt-2">
              {[
                { label: 'LAPS', val: circuit.laps },
                { label: 'LAP', val: `${circuit.lapLengthKm}km` },
                { label: 'DEG', val: circuit.degProfile.toUpperCase() },
                { label: 'OVT', val: circuit.overtaking.toUpperCase() },
              ].map(({ label, val }) => (
                <div key={label} className="bg-[#111] rounded-lg px-2 py-1.5">
                  <p className="font-mono text-[9px] text-[#444]">{label}</p>
                  <p className="font-mono text-xs text-frost">{val}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-mono text-[10px] text-[#444] tracking-widest">TRACK TEMP</span>
              <span className="font-mono text-xs text-amber">{trackTemp}°C</span>
            </div>
            <input
              type="range" min={15} max={55} value={trackTemp}
              onChange={e => setTrackTemp(Number(e.target.value))}
              className="w-full accent-amber"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#444] tracking-widest">SAFETY CAR</span>
            <button
              onClick={() => setSafetyCarLap(safetyCarLap ? null : 20)}
              className={`font-mono text-[10px] px-3 py-1.5 rounded-lg border transition-all ${
                safetyCarLap ? 'border-amber/60 bg-amber/10 text-amber' : 'border-[#222] text-[#444] hover:border-[#333]'
              }`}
            >
              {safetyCarLap ? `LAP ${safetyCarLap}` : 'OFF'}
            </button>
          </div>

          <button
            onClick={runRace}
            disabled={isPending}
            className="w-full py-3.5 rounded-xl bg-[#E8002D] text-white font-heading font-black text-sm tracking-wide hover:bg-[#c0001f] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-auto relative overflow-hidden"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                RUNNING RACE...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21"/></svg>
                START RACE
              </span>
            )}
          </button>
        </div>
      </div>

      {/* AI Grid preview */}
      <div className="border border-[#222] rounded-xl bg-[#0d0d0d] p-5">
        <p className="font-mono text-[10px] text-[#444] tracking-widest mb-4">
          RACE GRID — 19 AI OPPONENTS · 2025 SEASON
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {/* Player car slot */}
          <div className="border border-[#FFD700]/30 bg-[#FFD700]/05 rounded-lg px-3 py-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-2 h-2 rounded-full bg-[#FFD700]" />
              <span className="font-mono text-[9px] text-[#FFD700] tracking-wider">★ P?</span>
            </div>
            <p className="font-mono text-xs text-[#FFD700] font-bold">YOU</p>
            <p className="font-mono text-[9px] text-[#555]">Custom Setup</p>
          </div>
          {AI_DRIVERS.map((d, i) => (
            <div key={d.id} className="border border-[#1a1a1a] rounded-lg px-3 py-2 hover:border-[#333] transition-colors">
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.teamColor }} />
                <span className="font-mono text-[9px] text-[#444] tracking-wider">#{d.driverNumber}</span>
              </div>
              <p className="font-mono text-xs text-frost truncate">{d.acronym}</p>
              <p className="font-mono text-[9px] text-[#555] truncate">{d.teamName}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Race Results */}
      <AnimatePresence>
        {result && playerResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Player headline result */}
            <div
              className="border rounded-2xl p-5 mb-4 relative overflow-hidden"
              style={{ borderColor: '#FFD700' + '40', background: '#0d0d0d' }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#FFD700]/60 to-transparent" />
              <div className="flex items-center gap-6 flex-wrap">
                <div>
                  <p className="font-mono text-[10px] text-[#555] tracking-widest mb-1">YOUR RESULT</p>
                  <p className="font-heading font-black text-5xl" style={{ color: '#FFD700' }}>
                    P{playerResult.finalPosition}
                  </p>
                  <p className="font-mono text-sm text-[#888] mt-1">
                    {playerResult.finalPosition === 1 ? 'RACE WIN!' :
                     playerResult.finalPosition <= 3 ? 'PODIUM!' :
                     playerResult.finalPosition <= 10 ? 'POINTS FINISH' : 'OUT OF POINTS'}
                  </p>
                </div>
                <div className="flex gap-6 flex-wrap">
                  {[
                    { label: 'RACE TIME', val: formatRaceTime(playerResult.totalTime) },
                    { label: 'FASTEST LAP', val: formatLapTime(playerResult.fastestLap) },
                    { label: 'PIT STOPS', val: playerResult.stops },
                    { label: 'GAP TO LEADER', val: playerResult.finalPosition === 1 ? 'LEADER' : `+${(playerResult.totalTime - result.cars[0].totalTime).toFixed(3)}s` },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <p className="font-mono text-[9px] text-[#444] tracking-widest">{label}</p>
                      <p className="font-mono text-sm text-frost font-bold">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Full results */}
              <div className="border border-[#222] rounded-2xl bg-[#0d0d0d] overflow-hidden">
                <div className="border-b border-[#1a1a1a] px-4 py-3">
                  <span className="font-mono text-[10px] text-[#444] tracking-widest">RACE CLASSIFICATION</span>
                </div>
                <div className="p-3 max-h-[400px] overflow-y-auto">
                  <ResultsLadder result={result} />
                </div>
              </div>

              {/* Track map */}
              <div className="border border-[#222] rounded-2xl bg-[#050508] overflow-hidden">
                <div className="border-b border-[#1a1a1a] px-4 py-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#444] tracking-widest">TRACK POSITIONS</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#FFD700]" />
                      <span className="font-mono text-[9px] text-[#444]">You</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#E8002D]" />
                      <span className="font-mono text-[9px] text-[#333]">S/F line</span>
                    </span>
                  </div>
                </div>
                <div className="p-4 h-72">
                  <CircuitSVGMap circuit={circuit} result={result} />
                </div>
                <div className="px-4 pb-3">
                  <p className="font-mono text-[9px] text-[#333]">
                    Positions shown at race end · {circuit.flag} {circuit.shortName} · {circuit.laps} laps
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && (
        <div className="border border-dashed border-[#1a1a1a] rounded-2xl py-16 text-center">
          <p className="font-mono text-[#333] text-sm">Set up your car and click START RACE</p>
          <p className="font-mono text-[#222] text-xs mt-1">Race against 19 AI opponents from the 2025 F1 grid</p>
        </div>
      )}
    </div>
  );
}
