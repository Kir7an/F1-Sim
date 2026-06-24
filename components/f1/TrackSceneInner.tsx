'use client';
import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import type { Circuit, SimResult, TireCompound } from '@/lib/f1/types';
import { TIRE_MODELS } from '@/lib/f1/circuit-data';

const COMPOUND_COLOR: Record<TireCompound, string> = {
  SOFT: '#E8002D',
  MEDIUM: '#FFD700',
  HARD: '#f0f0f0',
  INTER: '#39B54A',
  WET: '#0067FF',
};

function CircuitTube({ circuit }: { circuit: Circuit }) {
  const tube = useMemo(() => {
    const pts = [...circuit.coords, circuit.coords[0]].map(
      ([x, z]) => new THREE.Vector3(x * 1.2, 0, z * 1.2)
    );
    const curve = new THREE.CatmullRomCurve3(pts, true);
    return new THREE.TubeGeometry(curve, circuit.coords.length * 6, 0.04, 8, true);
  }, [circuit]);

  return (
    <mesh geometry={tube}>
      <meshStandardMaterial color="#333333" emissive="#222222" emissiveIntensity={0.3} roughness={0.4} metalness={0.6} />
    </mesh>
  );
}

function StrategyHelix({ result, totalLaps, offset = 0 }: {
  result: SimResult;
  totalLaps: number;
  offset?: number;
}) {
  // Group laps by compound to create colored segments
  const segments = useMemo(() => {
    const groups: { compound: TireCompound; laps: number[] }[] = [];
    let cur: { compound: TireCompound; laps: number[] } | null = null;

    for (const lap of result.laps) {
      if (!cur || cur.compound !== lap.compound) {
        cur = { compound: lap.compound, laps: [] };
        groups.push(cur);
      }
      cur.laps.push(lap.lap);
    }
    return groups;
  }, [result.laps]);

  const helixPt = (lap: number) => {
    const t = lap / totalLaps;
    const angle = t * Math.PI * 2 * 3.5;
    const r = 1.4 + offset * 0.25;
    return new THREE.Vector3(Math.cos(angle) * r, t * 6 - 3, Math.sin(angle) * r);
  };

  return (
    <group>
      {segments.map((seg, i) => {
        if (seg.laps.length < 2) return null;
        const pts = seg.laps.map(l => helixPt(l));
        const curve = new THREE.CatmullRomCurve3(pts);
        const geo = new THREE.TubeGeometry(curve, pts.length * 3, 0.045, 8, false);
        const col = COMPOUND_COLOR[seg.compound];
        return (
          <mesh key={i} geometry={geo}>
            <meshStandardMaterial
              color={col}
              emissive={col}
              emissiveIntensity={0.6}
              roughness={0.1}
              metalness={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function PitMarkers({ result, totalLaps, offset = 0 }: {
  result: SimResult;
  totalLaps: number;
  offset?: number;
}) {
  const pitLaps = result.laps.filter(l => l.inPit);

  return (
    <>
      {pitLaps.map(lap => {
        const t = lap.lap / totalLaps;
        const angle = t * Math.PI * 2 * 3.5;
        const r = 1.4 + offset * 0.25;
        const x = Math.cos(angle) * r;
        const y = t * 6 - 3;
        const z = Math.sin(angle) * r;
        return (
          <group key={lap.lap} position={[x, y, z]}>
            <mesh>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.5} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

function LapMarker({ result, activeLap, totalLaps, offset = 0, color }: {
  result: SimResult;
  activeLap: number;
  totalLaps: number;
  offset?: number;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.position.y += Math.sin(clock.getElapsedTime() * 3) * 0.001;
  });

  const t = Math.min(activeLap, totalLaps) / totalLaps;
  const angle = t * Math.PI * 2 * 3.5;
  const r = 1.4 + offset * 0.25;

  return (
    <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
      <mesh
        ref={meshRef}
        position={[Math.cos(angle) * r, t * 6 - 3, Math.sin(angle) * r]}
      >
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
    </Float>
  );
}

function GridLines() {
  const lines = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const verts: number[] = [];
    for (let i = -5; i <= 5; i++) {
      verts.push(i, -4, -5, i, -4, 5);
      verts.push(-5, -4, i, 5, -4, i);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    return geo;
  }, []);

  return (
    <lineSegments geometry={lines}>
      <lineBasicMaterial color="#111111" transparent opacity={0.6} />
    </lineSegments>
  );
}

interface Props {
  circuit: Circuit;
  results: SimResult[];
  activeLap: number;
  activeStrategy: string;
}

function Scene({ circuit, results, activeLap, activeStrategy }: Props) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(5, 4, 6);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <color attach="background" args={['#050508']} />
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 8, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-5, -2, -5]} intensity={0.8} color="#4781D7" />
      <GridLines />

      {/* Strategy helices */}
      {results.map((result, i) => (
        <group key={result.strategy.id}>
          <StrategyHelix result={result} totalLaps={circuit.laps} offset={i} />
          <PitMarkers result={result} totalLaps={circuit.laps} offset={i} />
          <LapMarker
            result={result}
            activeLap={activeLap}
            totalLaps={circuit.laps}
            offset={i}
            color={result.strategy.color}
          />
        </group>
      ))}

      {/* Compound legend spheres */}
      {(['SOFT', 'MEDIUM', 'HARD'] as TireCompound[]).map((c, i) => (
        <Float key={c} speed={1.5 + i * 0.3} floatIntensity={0.2}>
          <mesh position={[-3.5, -2 + i * 1.2, 0]}>
            <sphereGeometry args={[0.18, 32, 32]} />
            <meshStandardMaterial
              color={COMPOUND_COLOR[c]}
              emissive={COMPOUND_COLOR[c]}
              emissiveIntensity={0.8}
              roughness={0.1}
              metalness={0.7}
            />
          </mesh>
        </Float>
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={14}
        autoRotate
        autoRotateSpeed={0.4}
      />
    </>
  );
}

export default function TrackSceneInner(props: Props) {
  return (
    <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
      <Scene {...props} />
    </Canvas>
  );
}
