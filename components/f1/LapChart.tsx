'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { SimResult } from '@/lib/f1/types';
import { formatLapTime } from '@/lib/f1/simulator';

interface Props {
  results: SimResult[];
  onLapHover?: (lap: number) => void;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: number;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111] border border-[#222] rounded-lg p-3 text-xs font-mono shadow-xl">
      <p className="text-[#888] mb-1">LAP {label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatLapTime(p.value)}
        </p>
      ))}
    </div>
  );
};

export function LapChart({ results, onLapHover }: Props) {
  if (!results.length) return null;

  const totalLaps = results[0].laps.length;
  const data = Array.from({ length: totalLaps }, (_, i) => {
    const row: Record<string, number | null> = { lap: i + 1 };
    for (const r of results) {
      const lap = r.laps[i];
      row[r.strategy.name] = lap?.inPit ? null : lap?.lapTime ?? null;
    }
    return row;
  });

  // Find pit laps for reference lines
  const pitLaps = new Set<number>();
  for (const r of results) {
    r.laps.filter(l => l.inPit).forEach(l => pitLaps.add(l.lap));
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
          onMouseMove={e => {
            if (e.activeLabel && onLapHover) onLapHover(Number(e.activeLabel));
          }}
        >
          <XAxis
            dataKey="lap"
            tick={{ fill: '#555', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={{ stroke: '#222' }}
            tickLine={false}
            label={{ value: 'LAP', position: 'insideBottom', fill: '#444', fontSize: 10, dy: 8, fontFamily: 'monospace' }}
          />
          <YAxis
            tick={{ fill: '#555', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
            domain={['auto', 'auto']}
            tickFormatter={formatLapTime}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          {Array.from(pitLaps).map(lap => (
            <ReferenceLine key={lap} x={lap} stroke="#ffffff22" strokeDasharray="3 3" />
          ))}
          {results.map(r => (
            <Line
              key={r.strategy.id}
              type="monotone"
              dataKey={r.strategy.name}
              stroke={r.strategy.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: r.strategy.color }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
