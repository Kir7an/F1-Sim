'use client';
import dynamic from 'next/dynamic';
import type { Circuit, SimResult, TireCompound } from '@/lib/f1/types';
import { TIRE_MODELS } from '@/lib/f1/circuit-data';

interface TrackSceneProps {
  circuit: Circuit;
  results: SimResult[];
  activeLap: number;
  activeStrategy: string;
}

const TrackSceneInner = dynamic(() => import('./TrackSceneInner'), { ssr: false, loading: () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="text-muted font-mono text-xs tracking-widest animate-pulse">INITIALISING 3D ENGINE...</div>
  </div>
)});

export function TrackScene(props: TrackSceneProps) {
  return <TrackSceneInner {...props} />;
}
