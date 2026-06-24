import type { AIDriver, CarSetup, StrategyConfig, TireCompound } from './types';

export const DEFAULT_PLAYER_SETUP: CarSetup = {
  aeroPriority: 50,
  engineMode: 'race',
  suspensionStiffness: 50,
  tireManagement: 'balanced',
};

// Team car setups reflecting 2025 aerodynamic philosophies
const MCL_SETUP: CarSetup  = { aeroPriority: 30, engineMode: 'race', suspensionStiffness: 65, tireManagement: 'balanced' };
const FER_SETUP: CarSetup  = { aeroPriority: 65, engineMode: 'race', suspensionStiffness: 55, tireManagement: 'aggressive' };
const MER_SETUP: CarSetup  = { aeroPriority: 55, engineMode: 'race', suspensionStiffness: 45, tireManagement: 'conservative' };
const RBR_SETUP: CarSetup  = { aeroPriority: 35, engineMode: 'race', suspensionStiffness: 60, tireManagement: 'balanced' };
const WIL_SETUP: CarSetup  = { aeroPriority: 40, engineMode: 'conservation', suspensionStiffness: 50, tireManagement: 'conservative' };
const AMR_SETUP: CarSetup  = { aeroPriority: 60, engineMode: 'race', suspensionStiffness: 50, tireManagement: 'balanced' };
const RB_SETUP:  CarSetup  = { aeroPriority: 50, engineMode: 'race', suspensionStiffness: 50, tireManagement: 'balanced' };
const ALP_SETUP: CarSetup  = { aeroPriority: 55, engineMode: 'race', suspensionStiffness: 50, tireManagement: 'balanced' };
const HAA_SETUP: CarSetup  = { aeroPriority: 50, engineMode: 'race', suspensionStiffness: 50, tireManagement: 'balanced' };
const AUD_SETUP: CarSetup  = { aeroPriority: 50, engineMode: 'conservation', suspensionStiffness: 50, tireManagement: 'conservative' };

function oneStop(id: string, pitLap: number, c1: TireCompound = 'MEDIUM', c2: TireCompound = 'HARD', color: string): StrategyConfig {
  return {
    id,
    name: `1-Stop ${c1[0]}→${c2[0]}`,
    color,
    stints: [
      { compound: c1, startLap: 1, startTireAge: 0 },
      { compound: c2, startLap: pitLap, startTireAge: 0 },
    ],
  };
}

function twoStop(id: string, pit1: number, pit2: number, color: string): StrategyConfig {
  return {
    id,
    name: '2-Stop S→M→H',
    color,
    stints: [
      { compound: 'SOFT',   startLap: 1,    startTireAge: 0 },
      { compound: 'MEDIUM', startLap: pit1,  startTireAge: 0 },
      { compound: 'HARD',   startLap: pit2,  startTireAge: 0 },
    ],
  };
}

export const AI_DRIVERS: AIDriver[] = [
  {
    id: 'nor', driverName: 'Lando Norris',    driverNumber: 4,  acronym: 'NOR',
    teamName: 'McLaren', teamColor: '#F47600',
    basePaceOffset: 0.00, driverSkill: 97,
    setup: MCL_SETUP,
    pitStrategy: twoStop('nor-s', 15, 32, '#F47600'),
  },
  {
    id: 'pia', driverName: 'Oscar Piastri',   driverNumber: 81, acronym: 'PIA',
    teamName: 'McLaren', teamColor: '#F47600',
    basePaceOffset: 0.08, driverSkill: 95,
    setup: MCL_SETUP,
    pitStrategy: oneStop('pia-s', 22, 'MEDIUM', 'HARD', '#F47600'),
  },
  {
    id: 'lec', driverName: 'Charles Leclerc',  driverNumber: 16, acronym: 'LEC',
    teamName: 'Ferrari', teamColor: '#ED1131',
    basePaceOffset: 0.15, driverSkill: 96,
    setup: FER_SETUP,
    pitStrategy: twoStop('lec-s', 16, 33, '#ED1131'),
  },
  {
    id: 'ham', driverName: 'Lewis Hamilton',   driverNumber: 44, acronym: 'HAM',
    teamName: 'Ferrari', teamColor: '#ED1131',
    basePaceOffset: 0.18, driverSkill: 95,
    setup: FER_SETUP,
    pitStrategy: oneStop('ham-s', 24, 'MEDIUM', 'HARD', '#ED1131'),
  },
  {
    id: 'rus', driverName: 'George Russell',   driverNumber: 63, acronym: 'RUS',
    teamName: 'Mercedes', teamColor: '#00D7B6',
    basePaceOffset: 0.28, driverSkill: 94,
    setup: MER_SETUP,
    pitStrategy: oneStop('rus-s', 28, 'MEDIUM', 'HARD', '#00D7B6'),
  },
  {
    id: 'ant', driverName: 'Kimi Antonelli',   driverNumber: 12, acronym: 'ANT',
    teamName: 'Mercedes', teamColor: '#00D7B6',
    basePaceOffset: 0.45, driverSkill: 88,
    setup: MER_SETUP,
    pitStrategy: oneStop('ant-s', 26, 'MEDIUM', 'HARD', '#00D7B6'),
  },
  {
    id: 'ver', driverName: 'Max Verstappen',   driverNumber: 1,  acronym: 'VER',
    teamName: 'Red Bull', teamColor: '#4781D7',
    basePaceOffset: 0.38, driverSkill: 99,
    setup: RBR_SETUP,
    pitStrategy: twoStop('ver-s', 14, 30, '#4781D7'),
  },
  {
    id: 'tsu', driverName: 'Yuki Tsunoda',    driverNumber: 22, acronym: 'TSU',
    teamName: 'Red Bull', teamColor: '#4781D7',
    basePaceOffset: 0.58, driverSkill: 87,
    setup: RBR_SETUP,
    pitStrategy: oneStop('tsu-s', 22, 'MEDIUM', 'HARD', '#4781D7'),
  },
  {
    id: 'sai', driverName: 'Carlos Sainz',    driverNumber: 55, acronym: 'SAI',
    teamName: 'Williams', teamColor: '#1868DB',
    basePaceOffset: 0.55, driverSkill: 93,
    setup: WIL_SETUP,
    pitStrategy: oneStop('sai-s', 30, 'HARD', 'MEDIUM', '#1868DB'),
  },
  {
    id: 'alb', driverName: 'Alex Albon',      driverNumber: 23, acronym: 'ALB',
    teamName: 'Williams', teamColor: '#1868DB',
    basePaceOffset: 0.68, driverSkill: 88,
    setup: WIL_SETUP,
    pitStrategy: oneStop('alb-s', 28, 'HARD', 'MEDIUM', '#1868DB'),
  },
  {
    id: 'alo', driverName: 'Fernando Alonso',  driverNumber: 14, acronym: 'ALO',
    teamName: 'Aston Martin', teamColor: '#229971',
    basePaceOffset: 0.52, driverSkill: 95,
    setup: AMR_SETUP,
    pitStrategy: twoStop('alo-s', 18, 35, '#229971'),
  },
  {
    id: 'str', driverName: 'Lance Stroll',    driverNumber: 18, acronym: 'STR',
    teamName: 'Aston Martin', teamColor: '#229971',
    basePaceOffset: 0.82, driverSkill: 79,
    setup: AMR_SETUP,
    pitStrategy: oneStop('str-s', 24, 'MEDIUM', 'HARD', '#229971'),
  },
  {
    id: 'gas', driverName: 'Pierre Gasly',    driverNumber: 10, acronym: 'GAS',
    teamName: 'Alpine', teamColor: '#00A1E8',
    basePaceOffset: 0.75, driverSkill: 89,
    setup: ALP_SETUP,
    pitStrategy: oneStop('gas-s', 22, 'MEDIUM', 'HARD', '#00A1E8'),
  },
  {
    id: 'col', driverName: 'Franco Colapinto', driverNumber: 43, acronym: 'COL',
    teamName: 'Alpine', teamColor: '#00A1E8',
    basePaceOffset: 0.92, driverSkill: 83,
    setup: ALP_SETUP,
    pitStrategy: oneStop('col-s', 20, 'MEDIUM', 'HARD', '#00A1E8'),
  },
  {
    id: 'law', driverName: 'Liam Lawson',     driverNumber: 30, acronym: 'LAW',
    teamName: 'Racing Bulls', teamColor: '#6C98FF',
    basePaceOffset: 0.80, driverSkill: 85,
    setup: RB_SETUP,
    pitStrategy: oneStop('law-s', 22, 'MEDIUM', 'HARD', '#6C98FF'),
  },
  {
    id: 'had', driverName: 'Isack Hadjar',    driverNumber: 6,  acronym: 'HAD',
    teamName: 'Racing Bulls', teamColor: '#6C98FF',
    basePaceOffset: 0.78, driverSkill: 84,
    setup: RB_SETUP,
    pitStrategy: twoStop('had-s', 17, 34, '#6C98FF'),
  },
  {
    id: 'ocon', driverName: 'Esteban Ocon',   driverNumber: 31, acronym: 'OCO',
    teamName: 'Haas', teamColor: '#9C9FA2',
    basePaceOffset: 1.02, driverSkill: 84,
    setup: HAA_SETUP,
    pitStrategy: oneStop('ocon-s', 22, 'MEDIUM', 'HARD', '#9C9FA2'),
  },
  {
    id: 'bea', driverName: 'Oliver Bearman',  driverNumber: 87, acronym: 'BEA',
    teamName: 'Haas', teamColor: '#9C9FA2',
    basePaceOffset: 1.08, driverSkill: 82,
    setup: HAA_SETUP,
    pitStrategy: oneStop('bea-s', 22, 'MEDIUM', 'HARD', '#9C9FA2'),
  },
  {
    id: 'hul', driverName: 'Nico Hulkenberg',  driverNumber: 27, acronym: 'HUL',
    teamName: 'Audi', teamColor: '#F50537',
    basePaceOffset: 0.98, driverSkill: 85,
    setup: AUD_SETUP,
    pitStrategy: oneStop('hul-s', 25, 'HARD', 'MEDIUM', '#F50537'),
  },
];
