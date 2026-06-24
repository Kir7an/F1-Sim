import { TIRE_MODELS } from './circuit-data';
import type {
  Circuit, StrategyConfig, StintConfig, LapResult, SimResult,
  TireCompound, DegProfile, CarSetup, AIDriver, RaceCarResult, FullRaceResult,
} from './types';

const DEG_PROFILE_MULTIPLIER: Record<DegProfile, number> = {
  high: 1.45,
  medium: 1.0,
  low: 0.6,
};

export function getTireDegradation(
  compound: TireCompound,
  tireAge: number,
  profile: DegProfile,
  trackTempC: number
): number {
  const model = TIRE_MODELS[compound];
  const profileMult = DEG_PROFILE_MULTIPLIER[profile];
  const tempMult = 1 + (trackTempC - 30) * 0.008;
  const effectiveAge = tireAge * profileMult * tempMult;

  const linearDeg = effectiveAge * model.degradationRate;
  if (effectiveAge > model.cliffLap) {
    const extra = Math.pow(effectiveAge - model.cliffLap, 1.9) * 0.08;
    return linearDeg + extra;
  }
  return linearDeg;
}

function getTireWear(
  compound: TireCompound,
  tireAge: number,
  profile: DegProfile
): number {
  const model = TIRE_MODELS[compound];
  const profileMult = DEG_PROFILE_MULTIPLIER[profile];
  const [, maxLap] = model.optimalWindow;
  const wearPct = Math.min(100, (tireAge * profileMult) / maxLap * 100);
  if (tireAge > model.cliffLap) {
    return Math.min(100, wearPct + (tireAge - model.cliffLap) * 2.5);
  }
  return wearPct;
}

export function getCurrentStint(stints: StintConfig[], lap: number): StintConfig {
  let current = stints[0];
  for (const s of stints) {
    if (s.startLap <= lap) current = s;
    else break;
  }
  return current;
}

export function getNextStint(stints: StintConfig[], lap: number): StintConfig | null {
  for (const s of stints) {
    if (s.startLap > lap) return s;
  }
  return null;
}

export function simulateStrategy(
  circuit: Circuit,
  strategy: StrategyConfig,
  trackTempC = 30,
  safetyCarLap: number | null = null
): SimResult {
  const laps: LapResult[] = [];
  let cumulativeTime = 0;

  for (let lap = 1; lap <= circuit.laps; lap++) {
    const stint = getCurrentStint(strategy.stints, lap);
    const tireAge = lap - stint.startLap + stint.startTireAge;
    const model = TIRE_MODELS[stint.compound];

    const baseLapTime = circuit.basePace + model.basePaceDelta;
    const fuelEffect = (circuit.laps - lap) * 0.03;
    const degradation = getTireDegradation(stint.compound, tireAge, circuit.degProfile, trackTempC);
    const isPitOutLap = tireAge === 0 && lap > 1;
    const pitOutPenalty = isPitOutLap ? 1.8 : 0;
    const scEffect = (safetyCarLap && lap >= safetyCarLap && lap < safetyCarLap + 5) ? 35 : 0;

    const lapTime = baseLapTime - fuelEffect + degradation + pitOutPenalty + scEffect;
    const tireWear = getTireWear(stint.compound, tireAge, circuit.degProfile);

    const nextStint = getNextStint(strategy.stints, lap);
    const isPitLap = !!nextStint && nextStint.startLap === lap + 1 && lap < circuit.laps;

    cumulativeTime += lapTime;
    if (isPitLap) cumulativeTime += circuit.pitDelta;

    laps.push({
      lap,
      lapTime,
      compound: stint.compound,
      tireAge,
      tireWear,
      cumulativeTime,
      inPit: isPitLap,
      pitDuration: isPitLap ? circuit.pitDelta : undefined,
      degradation,
    });
  }

  const validTimes = laps.filter(l => !l.inPit).map(l => l.lapTime);
  const avgLapTime = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;

  return {
    strategy,
    laps,
    totalRaceTime: cumulativeTime,
    stops: strategy.stints.length - 1,
    avgLapTime,
  };
}

export function formatRaceTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = (seconds % 60).toFixed(3);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${s.padStart(6, '0')}`;
  return `${m}:${s.padStart(6, '0')}`;
}

export function formatLapTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(3);
  return `${m}:${s.padStart(6, '0')}`;
}

export const DEFAULT_STRATEGIES: StrategyConfig[] = [
  {
    id: 'a',
    name: '1-Stop: M → H',
    color: '#e7c59a',
    stints: [
      { compound: 'MEDIUM', startLap: 1, startTireAge: 0 },
      { compound: 'HARD',   startLap: 22, startTireAge: 0 },
    ],
  },
  {
    id: 'b',
    name: '2-Stop: S → M → H',
    color: '#00D7B6',
    stints: [
      { compound: 'SOFT',   startLap: 1,  startTireAge: 0 },
      { compound: 'MEDIUM', startLap: 16, startTireAge: 0 },
      { compound: 'HARD',   startLap: 33, startTireAge: 0 },
    ],
  },
  {
    id: 'c',
    name: '1-Stop: H → S',
    color: '#ED1131',
    stints: [
      { compound: 'HARD', startLap: 1,  startTireAge: 0 },
      { compound: 'SOFT', startLap: 35, startTireAge: 0 },
    ],
  },
];

// ── Multi-car full race simulation ──────────────────────────────────────

function getCircuitStraightWeight(circuit: Circuit): number {
  const drsNorm = Math.min(circuit.drsZones / 3, 1);
  const ovtMap: Record<string, number> = { easy: 0.8, medium: 0.5, hard: 0.2 };
  return (drsNorm + ovtMap[circuit.overtaking]) / 2;
}

function getAeroPaceEffect(aeroPriority: number, circuit: Circuit): number {
  const straightW = getCircuitStraightWeight(circuit);
  const cornerW = 1 - straightW;
  const straightBonus = (50 - aeroPriority) * 0.004;
  const cornerBonus   = (aeroPriority - 50) * 0.004;
  return straightBonus * straightW + cornerBonus * cornerW;
}

const ENGINE_EFFECT: Record<string, number> = { conservation: 0.28, race: 0, qualify: -0.22 };
const TIRE_MGMT_EFFECT: Record<string, number>  = { conservative: 0.14, balanced: 0, aggressive: -0.14 };
const TIRE_MGMT_DEG: Record<string, number>     = { conservative: 0.80, balanced: 1.0, aggressive: 1.28 };
const SUSP_DEG: (s: number) => number = (s) => 1 + (s - 50) * 0.003;

// Seeded pseudo-random (deterministic sim)
function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function simulateFullRace(
  circuit: Circuit,
  playerSetup: CarSetup,
  playerStrategy: StrategyConfig,
  aiDrivers: AIDriver[],
  trackTempC = 30,
  safetyCarLap: number | null = null
): FullRaceResult {
  const aeroPacePlayer  = getAeroPaceEffect(playerSetup.aeroPriority, circuit);
  const engEffect       = ENGINE_EFFECT[playerSetup.engineMode];
  const suspEffect      = (playerSetup.suspensionStiffness - 50) * -0.0008;
  const tireMgmtEffect  = TIRE_MGMT_EFFECT[playerSetup.tireManagement];
  const playerDegMult   = SUSP_DEG(playerSetup.suspensionStiffness) * TIRE_MGMT_DEG[playerSetup.tireManagement];
  const playerBasePace  = circuit.basePace + 0.30 + aeroPacePlayer + engEffect + suspEffect + tireMgmtEffect;

  interface CarState {
    id: string;
    name: string;
    acronym: string;
    team: string;
    color: string;
    isPlayer: boolean;
    basePace: number;
    degMult: number;
    skill: number;
    strategy: StrategyConfig;
  }

  const cars: CarState[] = [
    {
      id: 'player',
      name: 'You',
      acronym: 'YOU',
      team: 'My Car',
      color: '#FFD700',
      isPlayer: true,
      basePace: playerBasePace,
      degMult: playerDegMult,
      skill: 80,
      strategy: playerStrategy,
    },
    ...aiDrivers.map(d => ({
      id: d.id,
      name: d.driverName,
      acronym: d.acronym,
      team: d.teamName,
      color: d.teamColor,
      isPlayer: false,
      basePace: circuit.basePace + d.basePaceOffset + getAeroPaceEffect(d.setup.aeroPriority, circuit),
      degMult: 1.0,
      skill: d.driverSkill,
      strategy: d.pitStrategy,
    })),
  ];

  const cumTimes   = new Array(cars.length).fill(0);
  const lapTimesAll: number[][] = cars.map(() => []);
  const compoundLog: TireCompound[][] = cars.map(() => []);

  for (let lap = 1; lap <= circuit.laps; lap++) {
    const scEffect = (safetyCarLap && lap >= safetyCarLap && lap < safetyCarLap + 5) ? 35 : 0;

    for (let ci = 0; ci < cars.length; ci++) {
      const car = cars[ci];
      const stintNow  = getCurrentStint(car.strategy.stints, lap);
      const tireAge   = lap - stintNow.startLap + stintNow.startTireAge;
      const model     = TIRE_MODELS[stintNow.compound];
      const deg       = getTireDegradation(stintNow.compound, tireAge, circuit.degProfile, trackTempC) * car.degMult;
      const fuelSave  = (circuit.laps - lap) * 0.03;
      const pitOut    = tireAge === 0 && lap > 1 ? 1.8 : 0;
      // Deterministic variation based on driver skill and lap
      const variation = (seededRand(ci * 1000 + lap) - 0.5) * (100 - car.skill) * 0.004;
      const nextStint = getNextStint(car.strategy.stints, lap);
      const isPitLap  = !!nextStint && nextStint.startLap === lap + 1 && lap < circuit.laps;

      const lapTime = car.basePace + model.basePaceDelta - fuelSave + deg + pitOut + variation + scEffect;

      cumTimes[ci] += lapTime;
      if (isPitLap) cumTimes[ci] += circuit.pitDelta;
      lapTimesAll[ci].push(lapTime);
      compoundLog[ci].push(stintNow.compound);
    }
  }

  // Determine positions at each lap
  const positionsPerLap: number[][] = cars.map(() => []);
  const gapsPerLap: number[][] = cars.map(() => []);

  // Re-simulate lap-by-lap cumulative times to get per-lap ordering
  const perLapCum = cars.map(() => 0);
  for (let lap = 1; lap <= circuit.laps; lap++) {
    for (let ci = 0; ci < cars.length; ci++) {
      perLapCum[ci] += lapTimesAll[ci][lap - 1];
      const stintNow = getCurrentStint(cars[ci].strategy.stints, lap);
      const nextStint = getNextStint(cars[ci].strategy.stints, lap);
      const isPitLap = !!nextStint && nextStint.startLap === lap + 1 && lap < circuit.laps;
      if (isPitLap) perLapCum[ci] += circuit.pitDelta;
    }
    const sorted = cars
      .map((_, i) => ({ i, t: perLapCum[i] }))
      .sort((a, b) => a.t - b.t);
    const leaderTime = sorted[0].t;
    sorted.forEach((item, pos) => {
      positionsPerLap[item.i].push(pos + 1);
      gapsPerLap[item.i].push(item.t - leaderTime);
    });
  }

  const finalOrder = cars
    .map((car, i) => ({ car, i, total: cumTimes[i] }))
    .sort((a, b) => a.total - b.total);

  const results: RaceCarResult[] = finalOrder.map((item, pos) => {
    const ci = item.i;
    const car = item.car;
    const lts = lapTimesAll[ci];
    const fastestLap = Math.min(...lts.filter(t => t < circuit.basePace + 5));
    const stops = car.strategy.stints.length - 1;

    return {
      driverId: car.id,
      driverName: car.name,
      acronym: car.acronym,
      teamName: car.team,
      teamColor: car.color,
      isPlayer: car.isPlayer,
      finalPosition: pos + 1,
      totalTime: item.total,
      fastestLap,
      stops,
      lapTimes: lts,
      positions: positionsPerLap[ci],
      gapsToLeader: gapsPerLap[ci],
      compounds: compoundLog[ci],
    };
  });

  return { cars: results, circuit, trackTempC, safetyCarLap };
}
