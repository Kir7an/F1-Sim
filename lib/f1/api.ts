import type { Meeting, Driver } from './types';

const BASE = 'https://api.openf1.org/v1';

export async function getMeetings(year: number): Promise<Meeting[]> {
  const res = await fetch(`${BASE}/meetings?year=${year}`, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.filter((m: Meeting) => m.meeting_name !== 'Pre-Season Testing');
}

export async function getSessionKey(meetingKey: number, sessionType = 'Race'): Promise<number | null> {
  const res = await fetch(`${BASE}/sessions?meeting_key=${meetingKey}&session_type=${sessionType}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data[0]?.session_key ?? null;
}

export async function getDrivers(sessionKey: number): Promise<Driver[]> {
  const res = await fetch(`${BASE}/drivers?session_key=${sessionKey}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((d: {
    driver_number: number; full_name: string; name_acronym: string;
    team_name: string; team_colour: string; headshot_url: string;
  }) => ({
    number: d.driver_number,
    name: d.full_name,
    acronym: d.name_acronym,
    team: d.team_name,
    teamColor: `#${d.team_colour}`,
    headshotUrl: d.headshot_url,
  }));
}

export interface StintData {
  driver_number: number;
  stint_number: number;
  compound: string;
  lap_start: number;
  lap_end: number;
  tyre_age_at_start: number;
}

export async function getStints(sessionKey: number): Promise<StintData[]> {
  const res = await fetch(`${BASE}/stints?session_key=${sessionKey}`);
  if (!res.ok) return [];
  return res.json();
}

export interface PitData {
  driver_number: number;
  lap_number: number;
  pit_duration: number;
}

export async function getPits(sessionKey: number): Promise<PitData[]> {
  const res = await fetch(`${BASE}/pit?session_key=${sessionKey}`);
  if (!res.ok) return [];
  return res.json();
}

export interface LapData {
  driver_number: number;
  lap_number: number;
  lap_duration: number | null;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  is_pit_out_lap: boolean;
}

export async function getLaps(sessionKey: number, driverNumber: number): Promise<LapData[]> {
  const res = await fetch(`${BASE}/laps?session_key=${sessionKey}&driver_number=${driverNumber}`);
  if (!res.ok) return [];
  return res.json();
}

// 2025 Driver standings (through Canadian GP, Jun 15 2025)
export const STANDINGS_2025 = [
  { pos: 1,  driver: 'Lando Norris',     acronym: 'NOR', team: 'McLaren',       color: '#F47600', points: 226 },
  { pos: 2,  driver: 'Oscar Piastri',    acronym: 'PIA', team: 'McLaren',       color: '#F47600', points: 195 },
  { pos: 3,  driver: 'Charles Leclerc',  acronym: 'LEC', team: 'Ferrari',       color: '#ED1131', points: 156 },
  { pos: 4,  driver: 'George Russell',   acronym: 'RUS', team: 'Mercedes',      color: '#00D7B6', points: 151 },
  { pos: 5,  driver: 'Lewis Hamilton',   acronym: 'HAM', team: 'Ferrari',       color: '#ED1131', points: 140 },
  { pos: 6,  driver: 'Max Verstappen',   acronym: 'VER', team: 'Red Bull',      color: '#4781D7', points: 136 },
  { pos: 7,  driver: 'Kimi Antonelli',   acronym: 'ANT', team: 'Mercedes',      color: '#00D7B6', points: 86  },
  { pos: 8,  driver: 'Carlos Sainz',     acronym: 'SAI', team: 'Williams',      color: '#1868DB', points: 72  },
  { pos: 9,  driver: 'Isack Hadjar',     acronym: 'HAD', team: 'Red Bull',      color: '#4781D7', points: 66  },
  { pos: 10, driver: 'Fernando Alonso',  acronym: 'ALO', team: 'Aston Martin',  color: '#229971', points: 44  },
];

export const CONSTRUCTORS_2025 = [
  { pos: 1, team: 'McLaren',      color: '#F47600', points: 421 },
  { pos: 2, team: 'Ferrari',      color: '#ED1131', points: 296 },
  { pos: 3, team: 'Mercedes',     color: '#00D7B6', points: 237 },
  { pos: 4, team: 'Red Bull',     color: '#4781D7', points: 202 },
  { pos: 5, team: 'Williams',     color: '#1868DB', points: 83  },
  { pos: 6, team: 'Aston Martin', color: '#229971', points: 50  },
  { pos: 7, team: 'Racing Bulls', color: '#6C98FF', points: 46  },
  { pos: 8, team: 'Alpine',       color: '#00A1E8', points: 22  },
  { pos: 9, team: 'Haas',         color: '#9C9FA2', points: 20  },
  { pos: 10, team: 'Audi',        color: '#F50537', points: 8   },
];

// Provisional 2026 calendar (official schedule subject to change)
export const CALENDAR_2026: Meeting[] = [
  { meeting_key: 2001, meeting_name: 'Australian Grand Prix',      circuit_short_name: 'Albert Park', location: 'Melbourne',    country_name: 'Australia',     date_start: '2026-03-15T05:00:00', year: 2026 },
  { meeting_key: 2002, meeting_name: 'Chinese Grand Prix',         circuit_short_name: 'Shanghai',     location: 'Shanghai',      country_name: 'China',         date_start: '2026-03-22T07:00:00', year: 2026 },
  { meeting_key: 2003, meeting_name: 'Japanese Grand Prix',        circuit_short_name: 'Suzuka',       location: 'Suzuka',        country_name: 'Japan',         date_start: '2026-04-05T05:00:00', year: 2026 },
  { meeting_key: 2004, meeting_name: 'Bahrain Grand Prix',         circuit_short_name: 'Sakhir',       location: 'Sakhir',        country_name: 'Bahrain',       date_start: '2026-04-19T15:00:00', year: 2026 },
  { meeting_key: 2005, meeting_name: 'Saudi Arabian Grand Prix',   circuit_short_name: 'Jeddah',       location: 'Jeddah',        country_name: 'Saudi Arabia',  date_start: '2026-04-26T18:00:00', year: 2026 },
  { meeting_key: 2006, meeting_name: 'Miami Grand Prix',           circuit_short_name: 'Miami',        location: 'Miami',         country_name: 'United States', date_start: '2026-05-10T20:00:00', year: 2026 },
  { meeting_key: 2007, meeting_name: 'Emilia-Romagna Grand Prix',  circuit_short_name: 'Imola',        location: 'Imola',         country_name: 'Italy',         date_start: '2026-05-24T13:00:00', year: 2026 },
  { meeting_key: 2008, meeting_name: 'Monaco Grand Prix',          circuit_short_name: 'Monte Carlo',  location: 'Monte Carlo',   country_name: 'Monaco',        date_start: '2026-05-31T13:00:00', year: 2026 },
  { meeting_key: 2009, meeting_name: 'Spanish Grand Prix',         circuit_short_name: 'Barcelona',    location: 'Barcelona',     country_name: 'Spain',         date_start: '2026-06-07T13:00:00', year: 2026 },
  { meeting_key: 2010, meeting_name: 'Canadian Grand Prix',        circuit_short_name: 'Montreal',     location: 'Montreal',      country_name: 'Canada',        date_start: '2026-06-14T18:00:00', year: 2026 },
  { meeting_key: 2011, meeting_name: 'Austrian Grand Prix',        circuit_short_name: 'Spielberg',    location: 'Spielberg',     country_name: 'Austria',       date_start: '2026-06-28T13:00:00', year: 2026 },
  { meeting_key: 2012, meeting_name: 'British Grand Prix',         circuit_short_name: 'Silverstone',  location: 'Silverstone',   country_name: 'United Kingdom',date_start: '2026-07-05T14:00:00', year: 2026 },
  { meeting_key: 2013, meeting_name: 'Belgian Grand Prix',         circuit_short_name: 'Spa',          location: 'Spa',           country_name: 'Belgium',       date_start: '2026-07-26T13:00:00', year: 2026 },
  { meeting_key: 2014, meeting_name: 'Hungarian Grand Prix',       circuit_short_name: 'Hungaroring',  location: 'Budapest',      country_name: 'Hungary',       date_start: '2026-08-02T13:00:00', year: 2026 },
  { meeting_key: 2015, meeting_name: 'Dutch Grand Prix',           circuit_short_name: 'Zandvoort',    location: 'Zandvoort',     country_name: 'Netherlands',   date_start: '2026-08-30T13:00:00', year: 2026 },
  { meeting_key: 2016, meeting_name: 'Italian Grand Prix',         circuit_short_name: 'Monza',        location: 'Monza',         country_name: 'Italy',         date_start: '2026-09-06T13:00:00', year: 2026 },
  { meeting_key: 2017, meeting_name: 'Azerbaijan Grand Prix',      circuit_short_name: 'Baku',         location: 'Baku',          country_name: 'Azerbaijan',    date_start: '2026-09-20T11:00:00', year: 2026 },
  { meeting_key: 2018, meeting_name: 'Singapore Grand Prix',       circuit_short_name: 'Marina Bay',   location: 'Singapore',     country_name: 'Singapore',     date_start: '2026-10-04T12:00:00', year: 2026 },
  { meeting_key: 2019, meeting_name: 'United States Grand Prix',   circuit_short_name: 'Austin',       location: 'Austin',        country_name: 'United States', date_start: '2026-10-18T19:00:00', year: 2026 },
  { meeting_key: 2020, meeting_name: 'Mexico City Grand Prix',     circuit_short_name: 'Mexico City',  location: 'Mexico City',   country_name: 'Mexico',        date_start: '2026-10-25T20:00:00', year: 2026 },
  { meeting_key: 2021, meeting_name: 'São Paulo Grand Prix',       circuit_short_name: 'Interlagos',   location: 'São Paulo',     country_name: 'Brazil',        date_start: '2026-11-08T17:00:00', year: 2026 },
  { meeting_key: 2022, meeting_name: 'Las Vegas Grand Prix',       circuit_short_name: 'Las Vegas',    location: 'Las Vegas',     country_name: 'United States', date_start: '2026-11-22T06:00:00', year: 2026 },
  { meeting_key: 2023, meeting_name: 'Qatar Grand Prix',           circuit_short_name: 'Lusail',       location: 'Lusail',        country_name: 'Qatar',         date_start: '2026-11-29T17:00:00', year: 2026 },
  { meeting_key: 2024, meeting_name: 'Abu Dhabi Grand Prix',       circuit_short_name: 'Yas Marina',   location: 'Yas Marina',    country_name: 'United Arab Emirates', date_start: '2026-12-06T13:00:00', year: 2026 },
];
