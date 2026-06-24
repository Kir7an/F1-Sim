'use client';
import { useState, useCallback, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CIRCUITS, TIRE_MODELS } from '@/lib/f1/circuit-data';
import { simulateStrategy, formatRaceTime, formatLapTime, DEFAULT_STRATEGIES } from '@/lib/f1/simulator';
import type { Circuit, StrategyConfig, StintConfig, SimResult, TireCompound } from '@/lib/f1/types';
import { TrackScene } from './TrackScene';
import { LapChart } from './LapChart';

const COMPOUNDS: TireCompound[] = ['SOFT', 'MEDIUM', 'HARD'];

function CompoundBadge({ compound, size = 'md' }: { compound: TireCompound; size?: 'sm' | 'md' }) {
  const m = TIRE_MODELS[compound];
  const sz = size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-7 h-7 text-[10px]';
  return (
    <div
      className={`${sz} rounded-full border-2 flex items-center justify-center font-mono font-bold flex-shrink-0`}
      style={{ borderColor: m.color, color: m.color, backgroundColor: `${m.color}18` }}
      title={`${compound} (${m.label})`}
    >
      {compound[0]}
    </div>
  );
}

function StintRow({
  stint, index, totalLaps, onChange, onRemove, canRemove,
}: {
  stint: StintConfig;
  index: number;
  totalLaps: number;
  onChange: (s: StintConfig) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="font-mono text-[10px] text-[#444] w-4">{index + 1}</span>
      {/* Compound selector */}
      <div className="flex gap-1.5">
        {COMPOUNDS.map(c => {
          const m = TIRE_MODELS[c];
          return (
            <button
              key={c}
              onClick={() => onChange({ ...stint, compound: c })}
              className={`w-7 h-7 rounded-full border-2 font-mono text-[10px] font-bold transition-all ${
                stint.compound === c ? 'scale-110 shadow-lg' : 'opacity-40 hover:opacity-70'
              }`}
              style={{
                borderColor: m.color,
                color: m.color,
                backgroundColor: stint.compound === c ? `${m.color}25` : 'transparent',
              }}
              title={c}
            >
              {c[0]}
            </button>
          );
        })}
      </div>
      {/* Start lap */}
      <div className="flex-1">
        {index === 0 ? (
          <span className="font-mono text-[11px] text-[#444]">Start</span>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#444]">Pit L</span>
            <input
              type="range"
              min={1}
              max={totalLaps - 1}
              value={stint.startLap - 1}
              onChange={e => onChange({ ...stint, startLap: Number(e.target.value) + 1 })}
              className="flex-1 accent-[#E8002D] h-1"
            />
            <span className="font-mono text-xs text-frost w-6 text-right">{stint.startLap - 1}</span>
          </div>
        )}
      </div>
      {canRemove && (
        <button
          onClick={onRemove}
          className="w-5 h-5 rounded text-[#444] hover:text-[#E8002D] transition-colors font-mono text-sm leading-none"
        >
          ×
        </button>
      )}
    </div>
  );
}

function StrategyCard({
  strategy, onUpdate, result, rank,
}: {
  strategy: StrategyConfig;
  onUpdate: (s: StrategyConfig) => void;
  result: SimResult | null;
  rank: number;
}) {
  const addStint = () => {
    const lastStint = strategy.stints[strategy.stints.length - 1];
    const newStart = Math.min(lastStint.startLap + 15, 60);
    const nextCompound = COMPOUNDS.find(c => !strategy.stints.some(s => s.compound === c)) || 'HARD';
    onUpdate({
      ...strategy,
      stints: [...strategy.stints, { compound: nextCompound, startLap: newStart, startTireAge: 0 }],
    });
  };

  const updateStint = (i: number, s: StintConfig) => {
    const stints = [...strategy.stints];
    stints[i] = s;
    // Keep stints sorted by startLap
    stints.sort((a, b) => a.startLap - b.startLap);
    onUpdate({ ...strategy, stints });
  };

  const removeStint = (i: number) => {
    onUpdate({ ...strategy, stints: strategy.stints.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="border border-[#222] rounded-xl bg-[#0d0d0d] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a]">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: strategy.color }} />
        <span className="font-mono text-xs text-frost flex-1">{strategy.name}</span>
        {result && (
          <span className="font-mono text-xs" style={{ color: strategy.color }}>
            {formatRaceTime(result.totalRaceTime)}
          </span>
        )}
      </div>

      {/* Stint visual bar */}
      {result && (
        <div className="flex h-2 mx-4 mt-3 rounded-full overflow-hidden gap-0.5">
          {result.laps.map((lap, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ backgroundColor: TIRE_MODELS[lap.compound].color + (lap.inPit ? '30' : '90') }}
            />
          ))}
        </div>
      )}

      {/* Stints */}
      <div className="px-4 py-2 divide-y divide-[#111]">
        {strategy.stints.map((s, i) => (
          <StintRow
            key={i}
            stint={s}
            index={i}
            totalLaps={70}
            onChange={ns => updateStint(i, ns)}
            onRemove={() => removeStint(i)}
            canRemove={strategy.stints.length > 1 && i > 0}
          />
        ))}
      </div>

      {strategy.stints.length < 4 && (
        <button
          onClick={addStint}
          className="w-full py-2 text-[#444] hover:text-[#888] font-mono text-[11px] tracking-wider hover:bg-[#111] transition-all border-t border-[#111]"
        >
          + ADD STOP
        </button>
      )}

      {/* Result stats */}
      {result && (
        <div className="px-4 py-3 border-t border-[#1a1a1a] grid grid-cols-3 gap-2">
          {[
            { label: 'STOPS', val: result.stops },
            { label: 'AVG LAP', val: formatLapTime(result.avgLapTime) },
            { label: 'RANK', val: `P${rank}` },
          ].map(({ label, val }) => (
            <div key={label}>
              <p className="font-mono text-[9px] text-[#444] tracking-wider">{label}</p>
              <p className="font-mono text-xs text-frost">{val}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StrategyLab() {
  const [circuitId, setCircuitId] = useState('silverstone');
  const [trackTemp, setTrackTemp] = useState(32);
  const [safetyCarLap, setSafetyCarLap] = useState<number | null>(null);
  const [strategies, setStrategies] = useState<StrategyConfig[]>(DEFAULT_STRATEGIES);
  const [results, setResults] = useState<SimResult[]>([]);
  const [activeLap, setActiveLap] = useState(1);
  const [hasRun, setHasRun] = useState(false);
  const [isPending, startTransition] = useTransition();

  const circuit = CIRCUITS.find(c => c.id === circuitId) ?? CIRCUITS[0];

  const runSimulation = useCallback(() => {
    startTransition(() => {
      const sims = strategies.map(s => simulateStrategy(circuit, s, trackTemp, safetyCarLap));
      const sorted = [...sims].sort((a, b) => a.totalRaceTime - b.totalRaceTime);
      setResults(sorted);
      setHasRun(true);
      setActiveLap(1);
    });
  }, [circuit, strategies, trackTemp, safetyCarLap]);

  const updateStrategy = (i: number, s: StrategyConfig) => {
    const next = [...strategies];
    next[i] = s;
    setStrategies(next);
    setHasRun(false);
  };

  const ranked = results.map(r => ({
    ...r,
    rank: results.indexOf(r) + 1,
  }));

  return (
    <div className="space-y-6">
      {/* Circuit + controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Circuit selector */}
        <div className="border border-[#222] rounded-xl bg-[#0d0d0d] p-4">
          <p className="font-mono text-[10px] text-[#444] tracking-widest mb-3">CIRCUIT</p>
          <select
            value={circuitId}
            onChange={e => { setCircuitId(e.target.value); setHasRun(false); }}
            className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-frost text-sm font-mono appearance-none cursor-pointer focus:outline-none focus:border-[#E8002D]/50"
          >
            {CIRCUITS.map(c => (
              <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
            ))}
          </select>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { label: 'LAPS', val: circuit.laps },
              { label: 'LAP', val: `${circuit.lapLengthKm}km` },
              { label: 'PIT Δ', val: `${circuit.pitDelta}s` },
              { label: 'DEG', val: circuit.degProfile.toUpperCase() },
            ].map(({ label, val }) => (
              <div key={label} className="bg-[#111] rounded-lg p-2">
                <p className="font-mono text-[9px] text-[#444]">{label}</p>
                <p className="font-mono text-xs text-frost">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Track temp */}
        <div className="border border-[#222] rounded-xl bg-[#0d0d0d] p-4">
          <p className="font-mono text-[10px] text-[#444] tracking-widest mb-3">CONDITIONS</p>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-mono text-[11px] text-[#666]">Track Temp</span>
                <span className="font-mono text-sm text-amber">{trackTemp}°C</span>
              </div>
              <input
                type="range" min={15} max={55} value={trackTemp}
                onChange={e => { setTrackTemp(Number(e.target.value)); setHasRun(false); }}
                className="w-full accent-amber"
              />
              <div className="flex justify-between mt-0.5">
                <span className="font-mono text-[9px] text-[#333]">15°C Cold</span>
                <span className="font-mono text-[9px] text-[#333]">55°C Hot</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[11px] text-[#666]">Safety Car</span>
                <button
                  onClick={() => { setSafetyCarLap(safetyCarLap ? null : 20); setHasRun(false); }}
                  className={`font-mono text-[10px] px-2 py-1 rounded border transition-all ${
                    safetyCarLap
                      ? 'border-amber/60 bg-amber/10 text-amber'
                      : 'border-[#222] text-[#444] hover:border-[#333]'
                  }`}
                >
                  {safetyCarLap ? 'ON' : 'OFF'}
                </button>
              </div>
              {safetyCarLap && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-mono text-[10px] text-[#555]">Deploy on lap</span>
                    <span className="font-mono text-xs text-amber">{safetyCarLap}</span>
                  </div>
                  <input
                    type="range" min={1} max={circuit.laps - 10} value={safetyCarLap}
                    onChange={e => { setSafetyCarLap(Number(e.target.value)); setHasRun(false); }}
                    className="w-full accent-amber"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Run button + summary */}
        <div className="border border-[#222] rounded-xl bg-[#0d0d0d] p-4 flex flex-col">
          <p className="font-mono text-[10px] text-[#444] tracking-widest mb-3">SIMULATION</p>
          <button
            onClick={runSimulation}
            disabled={isPending}
            className="w-full py-3 rounded-lg bg-[#E8002D] text-white font-heading font-black text-sm tracking-wide hover:bg-[#c0001f] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4 relative overflow-hidden"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                RUNNING SIM...
              </span>
            ) : 'RUN SIMULATION'}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </button>

          {hasRun && results.length > 0 && (
            <div className="space-y-2 flex-1">
              <p className="font-mono text-[10px] text-[#444] tracking-wider">RESULTS</p>
              {ranked.map((r, i) => (
                <div key={r.strategy.id} className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#444] w-4">P{i + 1}</span>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.strategy.color }} />
                  <span className="text-[#666] text-xs font-mono flex-1 truncate">{r.strategy.name}</span>
                  <span className="font-mono text-xs text-frost">{formatRaceTime(r.totalRaceTime)}</span>
                </div>
              ))}
              {results.length > 1 && (
                <p className="font-mono text-[10px] text-amber mt-2">
                  Gap: +{(results[results.length - 1].totalRaceTime - results[0].totalRaceTime).toFixed(1)}s
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Strategy cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {strategies.map((s, i) => (
          <StrategyCard
            key={s.id}
            strategy={s}
            onUpdate={ns => updateStrategy(i, ns)}
            result={results.find(r => r.strategy.id === s.id) ?? null}
            rank={ranked.findIndex(r => r.strategy.id === s.id) + 1}
          />
        ))}
      </div>

      {/* 3D + Chart */}
      <AnimatePresence>
        {hasRun && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {/* 3D Visualization */}
            <div className="border border-[#222] rounded-2xl bg-[#050508] overflow-hidden">
              <div className="border-b border-[#1a1a1a] px-4 py-2.5 flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#444] tracking-widest">3D STRATEGY HELIX</span>
                <div className="flex gap-3">
                  {(['SOFT', 'MEDIUM', 'HARD'] as TireCompound[]).map(c => (
                    <div key={c} className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: TIRE_MODELS[c].color }} />
                      <span className="font-mono text-[9px] text-[#444]">{c[0]}</span>
                    </div>
                  ))}
                  <span className="font-mono text-[9px] text-[#333]">● PIT STOP</span>
                </div>
              </div>
              <div className="h-80">
                <TrackScene
                  circuit={circuit}
                  results={results}
                  activeLap={activeLap}
                  activeStrategy={strategies[0].id}
                />
              </div>
              <div className="px-4 py-2 border-t border-[#1a1a1a] flex items-center gap-3">
                <span className="font-mono text-[10px] text-[#444]">LAP</span>
                <input
                  type="range" min={1} max={circuit.laps} value={activeLap}
                  onChange={e => setActiveLap(Number(e.target.value))}
                  className="flex-1 accent-[#E8002D]"
                />
                <span className="font-mono text-xs text-frost w-8 text-right">{activeLap}</span>
              </div>
            </div>

            {/* Lap time chart */}
            <div className="border border-[#222] rounded-2xl bg-[#0d0d0d] overflow-hidden">
              <div className="border-b border-[#1a1a1a] px-4 py-2.5 flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#444] tracking-widest">LAP TIME PACE TRACE</span>
                <span className="font-mono text-[9px] text-[#333]">│ white lines = pit stops</span>
              </div>
              <div className="p-4">
                <LapChart results={results} onLapHover={setActiveLap} />
              </div>

              {/* Tire wear at selected lap */}
              <div className="px-4 pb-4">
                <p className="font-mono text-[10px] text-[#444] tracking-widest mb-2">TIRE WEAR AT LAP {activeLap}</p>
                <div className="space-y-2">
                  {results.map(r => {
                    const lap = r.laps[activeLap - 1];
                    if (!lap) return null;
                    return (
                      <div key={r.strategy.id} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.strategy.color }} />
                        <CompoundBadge compound={lap.compound} size="sm" />
                        <div className="flex-1 h-1.5 bg-[#111] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, lap.tireWear)}%`,
                              backgroundColor: lap.tireWear > 80 ? '#E8002D' : lap.tireWear > 50 ? '#FFD700' : '#39B54A',
                            }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-[#555] w-8 text-right">{lap.tireWear.toFixed(0)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!hasRun && (
        <div className="border border-dashed border-[#1a1a1a] rounded-2xl py-16 text-center">
          <p className="font-mono text-[#333] text-sm">Configure strategies above and click RUN SIMULATION</p>
          <p className="font-mono text-[#222] text-xs mt-1">3D visualization and lap pace trace will appear here</p>
        </div>
      )}
    </div>
  );
}
