import type { Circuit, TireModel } from './types';

export const TIRE_MODELS: Record<string, TireModel> = {
  SOFT: {
    compound: 'SOFT',
    color: '#E8002D',
    label: 'C5',
    basePaceDelta: -0.7,
    degradationRate: 0.12,
    cliffLap: 18,
    optimalWindow: [8, 22],
  },
  MEDIUM: {
    compound: 'MEDIUM',
    color: '#FFF200',
    label: 'C3',
    basePaceDelta: 0,
    degradationRate: 0.07,
    cliffLap: 28,
    optimalWindow: [15, 35],
  },
  HARD: {
    compound: 'HARD',
    color: '#f3f3f3',
    label: 'C2',
    basePaceDelta: 0.6,
    degradationRate: 0.04,
    cliffLap: 45,
    optimalWindow: [25, 55],
  },
  INTER: {
    compound: 'INTER',
    color: '#39B54A',
    label: 'C1',
    basePaceDelta: 3.0,
    degradationRate: 0.06,
    cliffLap: 30,
    optimalWindow: [10, 40],
  },
  WET: {
    compound: 'WET',
    color: '#0067FF',
    label: 'W',
    basePaceDelta: 8.0,
    degradationRate: 0.03,
    cliffLap: 50,
    optimalWindow: [1, 60],
  },
};

export const CIRCUITS: Circuit[] = [
  {
    id: 'silverstone',
    name: 'British Grand Prix',
    shortName: 'Silverstone',
    country: 'United Kingdom',
    flag: '🇬🇧',
    laps: 52,
    lapLengthKm: 5.891,
    pitDelta: 21.5,
    basePace: 90.8,
    degProfile: 'medium',
    overtaking: 'medium',
    drsZones: 2,
    meetingKey: 1277,
    raceDate: '2025-07-06',
    // Clockwise — S/F at bottom, infield left, Wing section right
    coords: [
      [0.0, -2.8],   // S/F line
      [0.4, -2.5],   // Abbey approach
      [0.7, -2.1],   // Farm (right)
      [1.0, -1.7],   // Village (left)
      [1.2, -1.2],   // Loop entry
      [0.9, -0.8],   // The Loop hairpin (left)
      [0.4, -0.6],   // After Loop
      [0.1, -0.3],   // Aintree (right)
      [0.4, 0.0],    // Wellington
      [0.8, 0.2],    // Brooklands
      [1.2, 0.3],    // Luffield entry
      [1.6, 0.1],    // Luffield exit (right)
      [1.8, -0.4],   // Woodcote
      [1.8, -1.0],   // Woodcote exit
      [2.2, -1.5],   // Copse approach
      [2.8, -1.8],   // Copse (fast right)
      [3.0, -1.3],   // After Copse
      [2.8, -0.6],   // Maggotts (left)
      [2.4, -0.1],   // Maggotts through
      [2.7, 0.4],    // Becketts (right)
      [3.0, 0.8],    // Becketts exit
      [2.8, 1.3],    // Chapel (left exit)
      [2.2, 1.6],    // Hangar straight start
      [1.0, 1.6],    // Hangar straight mid
      [-0.2, 1.6],   // Approaching Stowe
      [-1.2, 1.4],   // Stowe entry
      [-1.8, 0.9],   // Stowe (right)
      [-2.2, 0.4],   // Vale (left)
      [-2.4, -0.2],  // After Vale
      [-2.1, -0.8],  // Club (right)
      [-1.6, -1.4],  // After Club
      [-1.0, -2.0],  // Returning to Abbey section
      [-0.4, -2.5],  // Back straight
      [0.0, -2.8],   // S/F
    ],
  },
  {
    id: 'spa',
    name: 'Belgian Grand Prix',
    shortName: 'Spa',
    country: 'Belgium',
    flag: '🇧🇪',
    laps: 44,
    lapLengthKm: 7.004,
    pitDelta: 20.8,
    basePace: 107.5,
    degProfile: 'medium',
    overtaking: 'easy',
    drsZones: 2,
    meetingKey: 1265,
    raceDate: '2025-07-27',
    // Clockwise — famous Eau Rouge valley at bottom-left, Kemmel straight top
    coords: [
      [0.0, -2.8],   // S/F line
      [-0.4, -2.5],  // La Source right
      [-0.8, -2.1],  // La Source hairpin
      [-1.0, -1.6],  // Down to Eau Rouge
      [-0.8, -1.1],  // Eau Rouge valley (low point)
      [-0.4, -0.5],  // Raidillon climb (right)
      [0.0, 0.1],    // Top of Raidillon
      [0.4, 0.6],    // Kemmel straight
      [0.9, 1.2],    // Kemmel continues
      [1.4, 1.8],    // Approaching Les Combes
      [1.9, 2.4],    // Les Combes left
      [1.6, 2.8],    // Les Combes right
      [1.0, 2.6],    // After Les Combes
      [0.4, 2.2],    // Rivage (right-left)
      [-0.2, 1.8],   // After Rivage
      [-0.8, 1.3],   // Pouhon entry (fast left)
      [-1.5, 0.6],   // Pouhon
      [-2.0, 0.0],   // Pouhon exit
      [-2.5, -0.6],  // Campus
      [-2.8, -1.2],  // Stavelot (right)
      [-2.6, -1.8],  // After Stavelot
      [-2.0, -2.3],  // Blanchimont (fast left)
      [-1.3, -2.7],  // Bus Stop entry
      [-0.8, -2.4],  // Bus Stop right
      [-0.4, -2.7],  // Bus Stop left
      [0.0, -2.8],   // S/F
    ],
  },
  {
    id: 'monza',
    name: 'Italian Grand Prix',
    shortName: 'Monza',
    country: 'Italy',
    flag: '🇮🇹',
    laps: 53,
    lapLengthKm: 5.793,
    pitDelta: 19.5,
    basePace: 82.0,
    degProfile: 'low',
    overtaking: 'easy',
    drsZones: 2,
    meetingKey: 1268,
    raceDate: '2025-09-07',
    // Clockwise — main straight at bottom, chicanes interrupt long straights
    coords: [
      [-0.5, -3.0],  // S/F line
      [0.5, -3.0],   // Main straight
      [1.5, -3.0],   // Main straight continues
      [2.2, -2.8],   // Prima Variante right
      [2.6, -2.4],   // Prima Variante left
      [2.4, -2.0],   // Prima Variante exit
      [2.9, -1.3],   // Curva Grande (fast right)
      [3.1, -0.6],   // Curva Grande
      [3.0, 0.0],    // After Curva Grande
      [2.7, 0.5],    // Seconda Variante right
      [2.4, 0.8],    // Seconda Variante left
      [2.6, 1.2],    // Seconda Variante exit
      [2.2, 1.8],    // Variante della Roggia right
      [1.8, 2.1],    // Roggia left
      [1.4, 2.4],    // After Roggia
      [0.8, 2.6],    // Lesmo 1 (right)
      [0.2, 2.5],    // Between Lesmos
      [-0.4, 2.2],   // Lesmo 2 (right)
      [-0.9, 1.6],   // After Lesmo 2
      [-1.3, 0.9],   // Variante Ascari right
      [-1.0, 0.4],   // Ascari left
      [-1.3, -0.1],  // Ascari exit
      [-1.6, -0.8],  // After Ascari
      [-1.8, -1.6],  // Approaching Parabolica
      [-2.0, -2.2],  // Parabolica entry (right)
      [-1.5, -2.8],  // Parabolica mid
      [-0.5, -3.0],  // S/F
    ],
  },
  {
    id: 'monaco',
    name: 'Monaco Grand Prix',
    shortName: 'Monte Carlo',
    country: 'Monaco',
    flag: '🇲🇨',
    laps: 78,
    lapLengthKm: 3.337,
    pitDelta: 23.0,
    basePace: 74.5,
    degProfile: 'low',
    overtaking: 'hard',
    drsZones: 1,
    meetingKey: 1261,
    raceDate: '2025-05-25',
    // Clockwise — harbor front at bottom, Casino hill top-left, tunnel bottom-right
    coords: [
      [0.0, -2.5],   // S/F line (harbor front)
      [0.6, -2.2],   // Sainte Dévote (right)
      [1.0, -1.6],   // Up the hill
      [1.3, -0.8],   // Casino Square (left)
      [1.0, -0.2],   // Mirabeau (right)
      [0.7, 0.3],    // Before hairpin
      [0.4, 0.7],    // Grand Hotel hairpin (tight left — slowest corner)
      [0.2, 1.2],    // Portier approach
      [0.5, 1.7],    // Portier (right)
      [0.8, 2.0],    // Tunnel entry
      [1.3, 2.2],    // Tunnel (east side)
      [1.8, 2.2],    // Tunnel exit
      [2.2, 1.9],    // Nouvelle Chicane right
      [2.4, 1.4],    // Nouvelle Chicane left
      [2.6, 0.8],    // Tabac (right)
      [2.8, 0.2],    // Swimming Pool S1 (left)
      [2.5, -0.4],   // Swimming Pool S2 (right)
      [2.7, -1.0],   // Swimming Pool S3 (left)
      [2.5, -1.6],   // La Rascasse (left)
      [1.8, -2.0],   // Anthony Noghes (right)
      [1.0, -2.3],   // Harbor front return
      [0.0, -2.5],   // S/F
    ],
  },
  {
    id: 'suzuka',
    name: 'Japanese Grand Prix',
    shortName: 'Suzuka',
    country: 'Japan',
    flag: '🇯🇵',
    laps: 53,
    lapLengthKm: 5.807,
    pitDelta: 21.0,
    basePace: 91.8,
    degProfile: 'medium',
    overtaking: 'medium',
    drsZones: 2,
    meetingKey: 1256,
    raceDate: '2025-04-06',
    // Clockwise — famous figure-8 crossover, esses in the middle
    coords: [
      [0.0, -2.5],   // S/F line
      [0.3, -2.1],   // T1 (right)
      [0.6, -1.6],   // T2
      [0.8, -1.0],   // Esses entry
      [0.5, -0.5],   // S-curve left (T3)
      [0.9, -0.1],   // S-curve right (T4)
      [0.5, 0.4],    // S-curve left (T5)
      [0.9, 0.8],    // S-curve right (T6) exit
      [1.3, 1.2],    // After Esses
      [1.7, 1.7],    // Degner 1 (right)
      [2.0, 2.2],    // Degner 2
      [1.7, 2.6],    // After Degner
      [1.0, 2.8],    // Approaching hairpin
      [0.4, 2.6],    // Before hairpin
      [0.0, 2.2],    // Hairpin (right — tightest corner)
      [-0.4, 2.6],   // After hairpin
      [-0.8, 2.8],   // Spoon entry
      [-1.4, 2.6],   // Spoon curve (right)
      [-2.0, 2.0],   // Spoon exit
      [-2.5, 1.4],   // 130R entry (fast right)
      [-2.7, 0.7],   // 130R
      [-2.5, 0.1],   // After 130R
      [-2.1, -0.4],  // Chicane right (T15)
      [-2.5, -0.9],  // Chicane left (T16)
      [-2.2, -1.4],  // After chicane
      [-1.7, -1.9],  // Crossover section (underpass)
      [-0.9, -2.2],  // Under bridge
      [-0.3, -2.4],  // Approaching pit straight
      [0.0, -2.5],   // S/F
    ],
  },
  {
    id: 'interlagos',
    name: 'São Paulo Grand Prix',
    shortName: 'Interlagos',
    country: 'Brazil',
    flag: '🇧🇷',
    laps: 71,
    lapLengthKm: 4.309,
    pitDelta: 20.5,
    basePace: 73.8,
    degProfile: 'high',
    overtaking: 'easy',
    drsZones: 2,
    meetingKey: 1273,
    raceDate: '2025-11-09',
    // ANTI-CLOCKWISE — famous for Senna S at start, Subida dos Boxes straight
    coords: [
      [0.0, -2.5],   // S/F (pit straight, going anti-clockwise)
      [-0.5, -2.2],  // Senna S right (T1)
      [-0.8, -1.8],  // Senna S left (T2)
      [-1.0, -1.2],  // After Senna S
      [-1.3, -0.6],  // Descida do Lago start
      [-1.5, 0.2],   // Reta Oposta (long uphill straight)
      [-1.5, 1.0],   // Reta Oposta continues
      [-1.3, 1.6],   // Descida do Lago (T4, left)
      [-0.9, 2.1],   // After Descida
      [-0.4, 2.4],   // Ferradura entry (T5, right)
      [0.2, 2.6],    // Ferradura (horseshoe right)
      [0.8, 2.4],    // Ferradura exit (T6)
      [1.3, 2.0],    // After Ferradura
      [1.7, 1.5],    // Mergulho (T7, left)
      [2.0, 0.8],    // Junção (T8, left)
      [2.2, 0.1],    // Subida dos Boxes
      [2.0, -0.8],   // T9
      [1.7, -1.4],   // After T9
      [1.2, -2.0],   // Bico de Pato (T11)
      [0.6, -2.3],   // Pinheirinho (T12)
      [0.0, -2.5],   // S/F
    ],
  },
  {
    id: 'cota',
    name: 'United States Grand Prix',
    shortName: 'Austin',
    country: 'United States',
    flag: '🇺🇸',
    laps: 56,
    lapLengthKm: 5.516,
    pitDelta: 21.2,
    basePace: 96.5,
    degProfile: 'high',
    overtaking: 'medium',
    drsZones: 2,
    meetingKey: 1271,
    raceDate: '2025-10-19',
    // ANTI-CLOCKWISE — big hill at T1, complex esses section
    coords: [
      [0.0, -3.0],   // S/F
      [-0.3, -2.6],  // T1 big hill climb (right)
      [-0.7, -2.2],  // Down from T1 hill
      [-1.0, -1.6],  // T2 (left) - esses begin
      [-0.6, -1.1],  // T3 (right)
      [-1.0, -0.7],  // T4 (left)
      [-0.6, -0.2],  // T5 (right)
      [-1.0, 0.3],   // T6 (left)
      [-0.6, 0.7],   // T7 (right) - esses end
      [-1.0, 1.2],   // Long run to T12
      [-1.5, 1.8],   // T12 entry
      [-1.9, 2.3],   // T12 hairpin (right)
      [-2.4, 2.0],   // After hairpin
      [-2.7, 1.4],   // T13 (right)
      [-2.8, 0.7],   // T14
      [-2.5, 0.0],   // T15 (right)
      [-2.2, -0.6],  // Back section
      [-2.5, -1.2],  // T16 chicane right
      [-2.2, -1.7],  // T17 chicane left
      [-1.8, -2.2],  // T18 (right)
      [-1.2, -2.6],  // T19 (right)
      [-0.6, -2.9],  // Approaching S/F
      [0.0, -3.0],   // S/F
    ],
  },
  {
    id: 'abudhabi',
    name: 'Abu Dhabi Grand Prix',
    shortName: 'Yas Marina',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    laps: 58,
    lapLengthKm: 5.281,
    pitDelta: 21.8,
    basePace: 87.5,
    degProfile: 'low',
    overtaking: 'medium',
    drsZones: 2,
    meetingKey: 1276,
    raceDate: '2025-12-07',
    // ANTI-CLOCKWISE — distinctive Yas Viceroy Hotel underpass section
    coords: [
      [0.0, -2.8],   // S/F
      [-0.5, -2.4],  // T1 (right)
      [-1.0, -2.0],  // T2-T3 esses
      [-1.5, -1.5],  // T4 (right)
      [-2.0, -1.0],  // T5 (left)
      [-2.5, -0.5],  // T6 (right)
      [-2.8, 0.1],   // T7 (right)
      [-2.5, 0.6],   // Hotel section
      [-2.0, 1.0],   // T9 (right, under hotel)
      [-1.4, 1.4],   // T10 (left)
      [-0.7, 1.8],   // T11 (right)
      [0.1, 2.3],    // Into high-speed sector
      [0.9, 2.7],    // T12 (right)
      [1.8, 2.5],    // T13
      [2.4, 1.9],    // T14 (right)
      [2.8, 1.1],    // T15
      [2.6, 0.4],    // T16
      [2.0, -0.2],   // T17
      [1.5, -0.8],   // T18 (right)
      [0.8, -1.5],   // T19
      [0.4, -2.1],   // Final section
      [0.0, -2.8],   // S/F
    ],
  },
  {
    id: 'bahrain',
    name: 'Bahrain Grand Prix',
    shortName: 'Sakhir',
    country: 'Bahrain',
    flag: '🇧🇭',
    laps: 57,
    lapLengthKm: 5.412,
    pitDelta: 22.0,
    basePace: 93.2,
    degProfile: 'high',
    overtaking: 'easy',
    drsZones: 3,
    meetingKey: 1257,
    raceDate: '2025-04-13',
    // Clockwise — many hairpins, three long DRS straights
    coords: [
      [0.0, -2.5],   // S/F
      [0.6, -2.2],   // T1 (right)
      [1.2, -1.8],   // T2 (right)
      [1.7, -1.4],   // T3 (left-right chicane)
      [1.4, -1.0],   // T3 exit
      [2.0, -0.5],   // T4 (right)
      [2.6, 0.0],    // T5 (left)
      [2.9, 0.6],    // T6
      [2.6, 1.0],    // T7 (right hairpin)
      [2.0, 1.2],    // T8 (right)
      [1.4, 1.6],    // T9-T10 (left-right)
      [0.8, 2.0],    // T11 (right)
      [0.2, 2.3],    // T12
      [-0.4, 2.5],   // T13 (tight)
      [-1.0, 2.3],   // T14
      [-1.6, 1.8],   // T15
      [-2.2, 1.2],   // After T15
      [-2.6, 0.4],   // T16 section
      [-2.8, -0.4],  //
      [-2.4, -1.0],  // T17 (right)
      [-1.8, -1.5],  // T18 (left-right chicane)
      [-1.2, -2.0],  // T19-T20
      [-0.6, -2.3],  //
      [0.0, -2.5],   // S/F
    ],
  },
  {
    id: 'canada',
    name: 'Canadian Grand Prix',
    shortName: 'Montreal',
    country: 'Canada',
    flag: '🇨🇦',
    laps: 70,
    lapLengthKm: 4.361,
    pitDelta: 22.5,
    basePace: 75.1,
    degProfile: 'medium',
    overtaking: 'easy',
    drsZones: 2,
    meetingKey: 1263,
    raceDate: '2025-06-15',
    // Clockwise — Île Notre-Dame island circuit, Wall of Champions at end
    coords: [
      [0.0, -2.6],   // S/F
      [0.5, -2.3],   // Virage Senna chicane right (T1)
      [0.8, -1.9],   // T2 (left)
      [0.5, -1.5],   // After chicane
      [0.3, -1.0],   // T3 approach
      [0.6, -0.5],   // T3-T4 section
      [0.9, 0.0],    // T5 (right-left)
      [1.3, 0.5],    // Hairpin approach
      [1.6, 0.9],    // T6 hairpin (right-left)
      [1.2, 1.3],    // After hairpin
      [0.7, 1.7],    // T7 (left)
      [0.9, 2.1],    // T8 (right)
      [1.2, 2.5],    // T9-T10
      [0.8, 2.8],    // T10 (right)
      [-0.2, 2.9],   // Back section
      [-1.0, 2.7],   // T11-T12
      [-1.8, 2.2],   // T12
      [-2.4, 1.5],   // Wall of Champions T13 (left)
      [-2.6, 0.6],   // T14 (left)
      [-2.4, -0.2],  // After Wall
      [-2.0, -0.8],  //
      [-1.5, -1.6],  // Final chicane approach
      [-0.9, -2.1],  // Final chicane
      [-0.4, -2.4],  //
      [0.0, -2.6],   // S/F
    ],
  },
];

export function getCircuitById(id: string): Circuit | undefined {
  return CIRCUITS.find(c => c.id === id);
}
