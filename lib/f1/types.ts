export type TireCompound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTER' | 'WET';
export type DegProfile = 'high' | 'medium' | 'low';
export type EngineMode = 'conservation' | 'race' | 'qualify';
export type TireManagement = 'conservative' | 'balanced' | 'aggressive';

export interface Driver {
  number: number;
  name: string;
  acronym: string;
  team: string;
  teamColor: string;
  headshotUrl: string;
}

export interface Meeting {
  meeting_key: number;
  meeting_name: string;
  circuit_short_name: string;
  date_start: string;
  location: string;
  country_name: string;
  year: number;
}

export interface TireModel {
  compound: TireCompound;
  color: string;
  label: string;
  basePaceDelta: number;
  degradationRate: number;
  cliffLap: number;
  optimalWindow: [number, number];
}

export interface Circuit {
  id: string;
  name: string;
  shortName: string;
  country: string;
  flag: string;
  laps: number;
  lapLengthKm: number;
  pitDelta: number;
  basePace: number;
  degProfile: DegProfile;
  overtaking: 'easy' | 'medium' | 'hard';
  drsZones: number;
  coords: [number, number][];
  meetingKey?: number;
  raceDate?: string;
}

export interface StintConfig {
  compound: TireCompound;
  startLap: number;
  startTireAge: number;
}

export interface StrategyConfig {
  id: string;
  name: string;
  color: string;
  stints: StintConfig[];
}

export interface LapResult {
  lap: number;
  lapTime: number;
  compound: TireCompound;
  tireAge: number;
  tireWear: number;
  cumulativeTime: number;
  inPit: boolean;
  pitDuration?: number;
  degradation: number;
}

export interface SimResult {
  strategy: StrategyConfig;
  laps: LapResult[];
  totalRaceTime: number;
  stops: number;
  avgLapTime: number;
}

// Multi-car race simulation types
export interface CarSetup {
  aeroPriority: number;        // 0-100 (0=low drag/fast straights, 100=high downforce/fast corners)
  engineMode: EngineMode;
  suspensionStiffness: number; // 0-100 (0=soft, 100=stiff)
  tireManagement: TireManagement;
}

export interface AIDriver {
  id: string;
  driverName: string;
  driverNumber: number;
  acronym: string;
  teamName: string;
  teamColor: string;
  basePaceOffset: number;  // seconds per lap behind McLaren reference pace
  driverSkill: number;     // 0-100, affects lap time consistency
  setup: CarSetup;
  pitStrategy: StrategyConfig;
}

export interface RaceCarResult {
  driverId: string;
  driverName: string;
  acronym: string;
  teamName: string;
  teamColor: string;
  isPlayer: boolean;
  finalPosition: number;
  totalTime: number;
  fastestLap: number;
  stops: number;
  lapTimes: number[];
  positions: number[];     // position at end of each lap
  gapsToLeader: number[];  // gap to race leader in seconds at end of each lap
  compounds: TireCompound[];
}

export interface FullRaceResult {
  cars: RaceCarResult[];
  circuit: Circuit;
  trackTempC: number;
  safetyCarLap: number | null;
}
