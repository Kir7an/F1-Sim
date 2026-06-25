'use client';

const INK = '#0D0D0D';
const GRAY = '#555';
const LGRAY = '#888';
const CREAM = '#FFFEF6';
const HILITE = '#E8E6DC';

/* ── IEC 60617 reusable symbols ───────────────────────── */

/** IEC 60617-7 · Circuit breaker in series (box + diagonal) */
function CB({ x, y, id }: { x: number; y: number; id: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="-14" y="-14" width="28" height="28" fill={CREAM} stroke={INK} strokeWidth="1.5" />
      <line x1="-9" y1="9" x2="9" y2="-9" stroke={INK} strokeWidth="1.5" />
      <text x="0" y="24" textAnchor="middle" fontSize="9" fontFamily="Courier New" fill={INK} fontWeight="bold">{id}</text>
    </g>
  );
}

/** IEC 60617-6 · Current transformer (circle on line) */
function CT({ x, y, id }: { x: number; y: number; id: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle cx="0" cy="0" r="12" fill={CREAM} stroke={INK} strokeWidth="1.4" />
      <text x="0" y="4" textAnchor="middle" fontSize="7" fontFamily="Courier New" fill={INK}>CT</text>
      <text x="0" y="-16" textAnchor="middle" fontSize="8" fontFamily="Courier New" fill={GRAY}>{id}</text>
    </g>
  );
}

/** IEC 60617-6 · Voltage transformer (small coupled circles) */
function VT({ x, y, id }: { x: number; y: number; id: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle cx="-8" cy="0" r="8" fill={CREAM} stroke={INK} strokeWidth="1.2" />
      <circle cx="8" cy="0" r="8" fill={CREAM} stroke={INK} strokeWidth="1.2" />
      <text x="0" y="-13" textAnchor="middle" fontSize="8" fontFamily="Courier New" fill={GRAY}>{id}</text>
    </g>
  );
}

/** IEC 60617-4 · Smoothing reactor (inductor bumps above line) */
function Reactor({ x, y, label }: { x: number; y: number; label: string }) {
  // 4 bumps, r=9, width = 72px
  const d = `M0,0 a9,9 0 0,1 18,0 a9,9 0 0,1 18,0 a9,9 0 0,1 18,0 a9,9 0 0,1 18,0`;
  return (
    <g transform={`translate(${x},${y})`}>
      <path d={d} fill="none" stroke={INK} strokeWidth="1.6" />
      <text x="36" y="-12" textAnchor="middle" fontSize="8" fontFamily="Courier New" fill={INK} fontWeight="bold">{label}</text>
    </g>
  );
}

/** IEC 60617-12 · Surge arrester */
function SA({ x, y, id }: { x: number; y: number; id: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="-8" y="-14" width="16" height="28" fill={CREAM} stroke={INK} strokeWidth="1.2" />
      {/* Arrow down inside */}
      <line x1="0" y1="-9" x2="0" y2="5" stroke={INK} strokeWidth="1" />
      <polygon points="0,9 -3,3 3,3" fill={INK} />
      {/* Earth below */}
      <line x1="0" y1="14" x2="0" y2="22" stroke={INK} strokeWidth="1.2" />
      <line x1="-10" y1="22" x2="10" y2="22" stroke={INK} strokeWidth="1.5" />
      <line x1="-7" y1="26" x2="7" y2="26" stroke={INK} strokeWidth="1.5" />
      <line x1="-4" y1="30" x2="4" y2="30" stroke={INK} strokeWidth="1.5" />
      <text x="14" y="-10" fontSize="8" fontFamily="Courier New" fill={GRAY}>{id}</text>
    </g>
  );
}

/** Earth symbol */
function Earth({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <line x1="0" y1="-8" x2="0" y2="0" stroke={INK} strokeWidth="1.2" />
      <line x1="-14" y1="0" x2="14" y2="0" stroke={INK} strokeWidth="1.8" />
      <line x1="-10" y1="6" x2="10" y2="6" stroke={INK} strokeWidth="1.8" />
      <line x1="-6" y1="12" x2="6" y2="12" stroke={INK} strokeWidth="1.8" />
    </g>
  );
}

/** Transformer (two coupled circles) */
function Transformer({ x, y, label, sub }: { x: number; y: number; label: string; sub: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle cx="-18" cy="0" r="18" fill="none" stroke={INK} strokeWidth="1.6" />
      <circle cx="18" cy="0" r="18" fill="none" stroke={INK} strokeWidth="1.6" />
      {/* Star point on primary */}
      <line x1="-18" y1="-18" x2="-18" y2="-26" stroke={INK} strokeWidth="1" />
      <line x1="-24" y1="-26" x2="-12" y2="-26" stroke={INK} strokeWidth="1.4" />
      <line x1="-22" y1="-30" x2="-14" y2="-30" stroke={INK} strokeWidth="1.4" />
      <line x1="-20" y1="-34" x2="-16" y2="-34" stroke={INK} strokeWidth="1.4" />
      <text x="0" y="28" textAnchor="middle" fontSize="9" fontFamily="Courier New" fill={INK} fontWeight="bold">{label}</text>
      <text x="0" y="38" textAnchor="middle" fontSize="8" fontFamily="Courier New" fill={GRAY}>{sub}</text>
    </g>
  );
}

/** VSC Converter box */
function VSC({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <rect x="-42" y="-22" width="84" height="44" fill={CREAM} stroke={INK} strokeWidth="1.6" />
      {/* AC ~ on left half */}
      <text x="-22" y="4" textAnchor="middle" fontSize="14" fontFamily="serif" fill={INK}>≈</text>
      {/* divider */}
      <line x1="0" y1="-22" x2="0" y2="22" stroke={INK} strokeWidth="0.7" strokeDasharray="2,2" />
      {/* DC = on right half */}
      <text x="22" y="-3" textAnchor="middle" fontSize="8" fontFamily="Courier New" fill={INK}>=</text>
      <text x="22" y="8" textAnchor="middle" fontSize="8" fontFamily="Courier New" fill={INK}>=</text>
      <text x="0" y="36" textAnchor="middle" fontSize="9" fontFamily="Courier New" fill={INK} fontWeight="bold">{label}</text>
      <text x="0" y="46" textAnchor="middle" fontSize="7" fontFamily="Courier New" fill={GRAY}>2-LEVEL VSC</text>
    </g>
  );
}

export function SchematicTab() {
  // Layout constants
  const PY = 210;   // +320kV DC bus y
  const NY = 390;   // -320kV DC bus y
  const EY = 300;   // Earth return y
  const BX = 340;   // Bus start x
  const BE = 1080;  // Bus end x

  // Breaker x positions
  const B1 = 460, B2 = 650, B3 = 840;

  // CT secondary line drops (to relay panel)
  const RELAY_TOP = 490;
  const RELAY_BOT = 740;
  const RELAY_L = 285;
  const RELAY_R = 1080;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-black text-frost text-2xl">Engineering Schematic</h2>
          <p className="font-mono text-[#444] text-xs mt-1">IEC 60617 · IEC 60255 · Protection Relay Scheme · HVDC-PRD-001 Rev.A</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-[#333] border border-[#1a1a1a] px-2 py-1 rounded">BIPOLAR ±320 kV · VSC TOPOLOGY</span>
        </div>
      </div>

      {/* Drawing container — horizontal scroll on small screens */}
      <div className="border border-[#222] rounded-xl overflow-auto">
        <svg
          viewBox="0 0 1560 880"
          style={{ display: 'block', width: '100%', minWidth: 1100, background: CREAM }}
          fontFamily="'Courier New', 'Lucida Console', monospace"
        >
          {/* ═══════════════════════════════════════════════════
              DRAWING BORDER & FRAME
          ═══════════════════════════════════════════════════ */}
          <rect width="1560" height="880" fill={CREAM} />
          {/* Outer border */}
          <rect x="10" y="10" width="1540" height="860" fill="none" stroke={INK} strokeWidth="2.5" />
          {/* Inner frame */}
          <rect x="38" y="38" width="1484" height="804" fill="none" stroke={INK} strokeWidth="0.8" />

          {/* ── Grid column markers ── */}
          {Array.from({ length: 9 }, (_, i) => (
            <g key={i}>
              <line x1={38 + (i + 1) * 165} y1="38" x2={38 + (i + 1) * 165} y2="10" stroke={LGRAY} strokeWidth="0.5" />
              <line x1={38 + (i + 1) * 165} y1="842" x2={38 + (i + 1) * 165} y2="870" stroke={LGRAY} strokeWidth="0.5" />
              <text x={38 + i * 165 + 82} y="28" textAnchor="middle" fontSize="9" fill={LGRAY}>{i + 1}</text>
              <text x={38 + i * 165 + 82} y="876" textAnchor="middle" fontSize="9" fill={LGRAY}>{i + 1}</text>
            </g>
          ))}
          {/* ── Grid row markers ── */}
          {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((l, i) => (
            <g key={l}>
              <line x1="38" y1={38 + (i + 1) * 115} x2="10" y2={38 + (i + 1) * 115} stroke={LGRAY} strokeWidth="0.5" />
              <line x1="1522" y1={38 + (i + 1) * 115} x2="1550" y2={38 + (i + 1) * 115} stroke={LGRAY} strokeWidth="0.5" />
              <text x="28" y={38 + i * 115 + 62} textAnchor="middle" fontSize="9" fill={LGRAY}>{l}</text>
              <text x="1548" y={38 + i * 115 + 62} textAnchor="middle" fontSize="9" fill={LGRAY}>{l}</text>
            </g>
          ))}

          {/* ── Drawing title header band ── */}
          <rect x="38" y="38" width="1484" height="26" fill={HILITE} stroke={INK} strokeWidth="0.8" />
          <text x="760" y="56" textAnchor="middle" fontSize="12" fontWeight="bold" letterSpacing="1.5" fill={INK}>
            HVDC BIPOLAR LINK — PROTECTION RELAY SCHEME (IEC 60617 / IEC 60255)
          </text>
          <text x="1510" y="56" textAnchor="end" fontSize="9" fill={GRAY}>HVDC-PRD-001 Rev.A</text>

          {/* ═══════════════════════════════════════════════════
              LEFT SIDE — AC GRID A
          ═══════════════════════════════════════════════════ */}
          <text x="55" y="95" fontSize="9" fontWeight="bold" fill={INK}>AC GRID A</text>
          <text x="55" y="107" fontSize="8" fill={GRAY}>33 kV · 50 Hz</text>
          {/* Three phase lines */}
          {[130, 145, 160].map((y, i) => (
            <g key={y}>
              <line x1="48" y1={y} x2="88" y2={y} stroke={INK} strokeWidth="1.8" />
              <text x="45" y={y + 4} textAnchor="end" fontSize="8" fill={INK}>{`L${i + 1}`}</text>
            </g>
          ))}
          {/* 3-phase tick marks → single line to transformer */}
          <line x1="88" y1="145" x2="100" y2="145" stroke={INK} strokeWidth="1.8" />
          <line x1="91" y1="139" x2="95" y2="151" stroke={INK} strokeWidth="1.2" />
          <line x1="95" y1="139" x2="99" y2="151" stroke={INK} strokeWidth="1.2" />
          <line x1="99" y1="139" x2="103" y2="151" stroke={INK} strokeWidth="1.2" />
          {/* Neutral earthed */}
          <line x1="68" y1="160" x2="68" y2="178" stroke={INK} strokeWidth="0.9" />
          <Earth x={68} y={178} />

          {/* ═══ TR-A ═══ */}
          <Transformer x={152} y={145} label="TR-A" sub="33/320 kV · 300 MVA Yn-D" />
          {/* Connections */}
          <line x1="100" y1="145" x2="134" y2="145" stroke={INK} strokeWidth="1.8" />
          <line x1="170" y1="145" x2="198" y2="145" stroke={INK} strokeWidth="1.8" />
          {/* HV ticks */}
          <line x1="173" y1="139" x2="177" y2="151" stroke={INK} strokeWidth="1.2" />
          <line x1="177" y1="139" x2="181" y2="151" stroke={INK} strokeWidth="1.2" />
          <line x1="181" y1="139" x2="185" y2="151" stroke={INK} strokeWidth="1.2" />

          {/* ═══ VSC-A ═══ */}
          <VSC x={240} y={145} label="VSC-A" />
          <line x1="282" y1="145" x2="302" y2="145" stroke={INK} strokeWidth="1.8" />
          {/* Drop to negative pole */}
          <line x1="240" y1="167" x2="240" y2={NY} stroke={INK} strokeWidth="1" strokeDasharray="4,3" />
          <line x1="240" y1={NY} x2="302" y2={NY} stroke={INK} strokeWidth="1.8" />

          {/* ═══ REACTOR L1 (positive pole) ═══ */}
          <Reactor x={302} y={PY} label="L1+" />
          <line x1="295" y1={PY} x2="302" y2={PY} stroke={INK} strokeWidth="1.8" />
          <line x1="374" y1={PY} x2={BX} y2={PY} stroke={INK} strokeWidth="1.8" />

          {/* ═══ REACTOR L1 (negative pole) ═══ */}
          <Reactor x={302} y={NY} label="L1-" />
          <line x1="295" y1={NY} x2="302" y2={NY} stroke={INK} strokeWidth="1.8" />
          <line x1="374" y1={NY} x2={BX} y2={NY} stroke={INK} strokeWidth="1.8" />

          {/* ═══════════════════════════════════════════════════
              DC BUSES
          ═══════════════════════════════════════════════════ */}
          {/* +320kV bus (horizontal) */}
          <line x1={BX} y1={PY} x2={BE} y2={PY} stroke={INK} strokeWidth="2.8" />
          <text x={BX + 10} y={PY - 10} fontSize="10" fontWeight="bold" fill={INK}>+320 kV</text>

          {/* -320kV bus (horizontal) */}
          <line x1={BX} y1={NY} x2={BE} y2={NY} stroke={INK} strokeWidth="2.8" />
          <text x={BX + 10} y={NY + 18} fontSize="10" fontWeight="bold" fill={INK}>-320 kV</text>

          {/* Earth return (dashed) */}
          <line x1={BX} y1={EY} x2={BE} y2={EY} stroke={GRAY} strokeWidth="0.8" strokeDasharray="8,5" />
          <text x={(BX + BE) / 2} y={EY - 6} textAnchor="middle" fontSize="8" fill={GRAY}>EARTH RETURN</text>
          {/* Earth at centre */}
          <Earth x={(BX + BE) / 2} y={EY + 2} />

          {/* ═══════════════════════════════════════════════════
              BREAKER BAYS B1 / B2 / B3
          ═══════════════════════════════════════════════════ */}
          {[
            { x: B1, bus: 'B1', ct: 'CT1', vt: 'VT1', sa: 'SA1/SA4' },
            { x: B2, bus: 'B2', ct: 'CT2', vt: 'VT2', sa: 'SA2/SA5' },
            { x: B3, bus: 'B3', ct: 'CT3', vt: 'VT3', sa: 'SA3/SA6' },
          ].map(({ x, bus, ct, vt, sa }) => (
            <g key={bus}>
              {/* Vertical bus connections (+) */}
              <line x1={x} y1={PY} x2={x} y2={EY} stroke={INK} strokeWidth="1.4" />
              {/* Vertical bus connections (-) */}
              <line x1={x} y1={EY} x2={x} y2={NY} stroke={INK} strokeWidth="1.4" />

              {/* CB on positive pole */}
              <CB x={x} y={PY} id="" />
              {/* CB label */}
              <text x={x} y={PY - 22} textAnchor="middle" fontSize="9" fontWeight="bold" fill={INK}>{bus}+</text>

              {/* CB on negative pole */}
              <CB x={x} y={NY} id="" />
              <text x={x} y={NY + 36} textAnchor="middle" fontSize="9" fontWeight="bold" fill={INK}>{bus}-</text>

              {/* CT on positive side (above bus) */}
              <CT x={x} y={PY - 48} id={`${ct}P`} />
              <line x1={x} y1={PY - 14} x2={x} y2={PY - 36} stroke={INK} strokeWidth="1.4" />
              {/* CT secondary terminal going DOWN */}
              <line x1={x + 12} y1={PY - 48} x2={x + 18} y2={PY - 48} stroke={INK} strokeWidth="0.9" strokeDasharray="3,2" />

              {/* CT on negative side (below bus) */}
              <CT x={x} y={NY + 48} id={`${ct}N`} />
              <line x1={x} y1={NY + 14} x2={x} y2={NY + 36} stroke={INK} strokeWidth="1.4" />
              {/* CT secondary terminal */}
              <line x1={x + 12} y1={NY + 48} x2={x + 18} y2={NY + 48} stroke={INK} strokeWidth="0.9" strokeDasharray="3,2" />

              {/* VT on positive bus */}
              <VT x={x - 70} y={PY} id={`${vt}P`} />
              {/* VT secondary */}
              <line x1={x - 70} y1={PY + 8} x2={x - 70} y2={PY + 30} stroke={INK} strokeWidth="0.9" strokeDasharray="3,2" />

              {/* Surge Arrester positive */}
              <SA x={x + 55} y={PY - 25} id="" />
              {/* Surge Arrester negative */}
              <SA x={x + 55} y={NY - 25} id="" />

              {/* Bus label above breaker bay */}
              <rect x={x - 30} y="68" width="60" height="16" fill={HILITE} stroke={GRAY} strokeWidth="0.7" />
              <text x={x} y="80" textAnchor="middle" fontSize="9" fontWeight="bold" fill={INK}>BAY {bus.replace('B', '')}</text>

              {/* CT secondary lines down to relay panel */}
              <line x1={x} y1={PY - 36} x2={x} y2={RELAY_TOP} stroke={INK} strokeWidth="0.8" strokeDasharray="5,4" />
              <line x1={x} y1={NY + 60} x2={x} y2={RELAY_TOP} stroke={INK} strokeWidth="0.8" strokeDasharray="5,4" />
            </g>
          ))}

          {/* SA labels (grouped) */}
          <text x={B1 + 68} y={PY - 40} fontSize="7" fill={GRAY}>SA1</text>
          <text x={B1 + 68} y={NY - 40} fontSize="7" fill={GRAY}>SA4</text>
          <text x={B2 + 68} y={PY - 40} fontSize="7" fill={GRAY}>SA2</text>
          <text x={B2 + 68} y={NY - 40} fontSize="7" fill={GRAY}>SA5</text>
          <text x={B3 + 68} y={PY - 40} fontSize="7" fill={GRAY}>SA3</text>
          <text x={B3 + 68} y={NY - 40} fontSize="7" fill={GRAY}>SA6</text>

          {/* ═══ VT on negative bus ═══ */}
          {[B1, B2, B3].map((x, i) => (
            <g key={`vtn-${i}`}>
              <VT x={x - 70} y={NY} id={`VT${i + 1}N`} />
              <line x1={x - 70} y1={NY - 8} x2={x - 70} y2={NY - 28} stroke={INK} strokeWidth="0.9" strokeDasharray="3,2" />
              <line x1={x - 70} y1={NY - 28} x2={x - 70} y2={RELAY_TOP} stroke={INK} strokeWidth="0.8" strokeDasharray="5,4" />
            </g>
          ))}

          {/* ═══════════════════════════════════════════════════
              RIGHT SIDE COMPONENTS
          ═══════════════════════════════════════════════════ */}
          {/* Reactor L2 positive */}
          <Reactor x={BE} y={PY} label="L2+" />
          <line x1={BE + 72} y1={PY} x2={BE + 95} y2={PY} stroke={INK} strokeWidth="1.8" />

          {/* Reactor L2 negative */}
          <Reactor x={BE} y={NY} label="L2-" />
          <line x1={BE + 72} y1={NY} x2={BE + 95} y2={NY} stroke={INK} strokeWidth="1.8" />

          {/* VSC-B */}
          <VSC x={BE + 137} y={145} label="VSC-B" />
          <line x1={BE + 95} y1={PY} x2={BE + 95} y2={145} stroke={INK} strokeWidth="1.8" />
          <line x1={BE + 95} y1={NY} x2={BE + 95} y2={145} stroke={INK} strokeWidth="0.9" strokeDasharray="4,3" />
          <line x1={BE + 179} y1={145} x2={BE + 200} y2={145} stroke={INK} strokeWidth="1.8" />
          <line x1={BE + 175} y1={139} x2={BE + 179} y2={151} stroke={INK} strokeWidth="1.2" />
          <line x1={BE + 179} y1={139} x2={BE + 183} y2={151} stroke={INK} strokeWidth="1.2" />
          <line x1={BE + 183} y1={139} x2={BE + 187} y2={151} stroke={INK} strokeWidth="1.2" />

          {/* TR-B */}
          <Transformer x={BE + 238} y={145} label="TR-B" sub="320/33 kV · 300 MVA D-Yn" />
          <line x1={BE + 200} y1={145} x2={BE + 220} y2={145} stroke={INK} strokeWidth="1.8" />
          <line x1={BE + 256} y1={145} x2={BE + 278} y2={145} stroke={INK} strokeWidth="1.8" />
          <line x1={BE + 259} y1={139} x2={BE + 263} y2={151} stroke={INK} strokeWidth="1.2" />
          <line x1={BE + 263} y1={139} x2={BE + 267} y2={151} stroke={INK} strokeWidth="1.2" />
          <line x1={BE + 267} y1={139} x2={BE + 271} y2={151} stroke={INK} strokeWidth="1.2" />

          {/* AC Grid B */}
          <text x={BE + 285} y={95} fontSize="9" fontWeight="bold" fill={INK}>AC GRID B</text>
          <text x={BE + 285} y={107} fontSize="8" fill={GRAY}>33 kV · 50 Hz</text>
          {[130, 145, 160].map((y, i) => (
            <g key={y}>
              <line x1={BE + 278} y1={y} x2={BE + 320} y2={y} stroke={INK} strokeWidth="1.8" />
              <text x={BE + 325} y={y + 4} fontSize="8" fill={INK}>{`L${i + 1}`}</text>
            </g>
          ))}
          <Earth x={BE + 298} y={178} />

          {/* ═══════════════════════════════════════════════════
              PROTECTION RELAY PANEL
          ═══════════════════════════════════════════════════ */}
          {/* Outer panel box */}
          <rect x={RELAY_L} y={RELAY_TOP} width={RELAY_R - RELAY_L} height={RELAY_BOT - RELAY_TOP}
            fill={CREAM} stroke={INK} strokeWidth="1.8" />
          <rect x={RELAY_L} y={RELAY_TOP} width={RELAY_R - RELAY_L} height="22"
            fill={HILITE} stroke={INK} strokeWidth="0.8" />
          <text x={(RELAY_L + RELAY_R) / 2} y={RELAY_TOP + 14} textAnchor="middle" fontSize="10" fontWeight="bold" fill={INK}>
            PROTECTION RELAY CONTROLLER — RASPBERRY PI 4B
          </text>
          <text x={(RELAY_L + RELAY_R) / 2} y={RELAY_TOP + 24} textAnchor="middle" fontSize="8" fill={GRAY}>
            IEC 60255 · ADS1115 16-bit ADC · GPIO RELAY OUTPUTS
          </text>

          {/* Terminal board (top of panel) */}
          <rect x={RELAY_L + 10} y={RELAY_TOP + 34} width={RELAY_R - RELAY_L - 20} height="36"
            fill="none" stroke={INK} strokeWidth="0.9" />
          <text x={RELAY_L + 18} y={RELAY_TOP + 46} fontSize="8" fill={GRAY}>TERMINAL BOARD  —  CT / VT SECONDARY INPUTS</text>
          {/* Terminal markers */}
          {[B1, B2, B3].map((x, i) => (
            <g key={`tb-${i}`}>
              <rect x={x - 8} y={RELAY_TOP + 50} width="16" height="14" fill="none" stroke={INK} strokeWidth="0.9" />
              <text x={x} y={RELAY_TOP + 61} textAnchor="middle" fontSize="7" fill={INK}>{`X${i + 1}`}</text>
            </g>
          ))}

          {/* RPi 4B sub-panel */}
          <rect x={RELAY_L + 10} y={RELAY_TOP + 78} width={370} height={RELAY_BOT - RELAY_TOP - 88}
            fill={CREAM} stroke={INK} strokeWidth="1.2" />
          <text x={RELAY_L + 195} y={RELAY_TOP + 92} textAnchor="middle" fontSize="9" fontWeight="bold" fill={INK}>Raspberry Pi 4B</text>
          {/* Pi internals (schematic representation) */}
          <rect x={RELAY_L + 20} y={RELAY_TOP + 100} width={80} height={50} fill={CREAM} stroke={GRAY} strokeWidth="0.8" />
          <text x={RELAY_L + 60} y={RELAY_TOP + 120} textAnchor="middle" fontSize="7" fill={GRAY}>CPU</text>
          <text x={RELAY_L + 60} y={RELAY_TOP + 132} textAnchor="middle" fontSize="7" fill={GRAY}>BCM2711</text>
          <rect x={RELAY_L + 115} y={RELAY_TOP + 100} width={70} height={50} fill={CREAM} stroke={GRAY} strokeWidth="0.8" />
          <text x={RELAY_L + 150} y={RELAY_TOP + 120} textAnchor="middle" fontSize="7" fill={GRAY}>GPIO</text>
          <text x={RELAY_L + 150} y={RELAY_TOP + 132} textAnchor="middle" fontSize="7" fill={GRAY}>40-PIN</text>
          <rect x={RELAY_L + 200} y={RELAY_TOP + 100} width={80} height={50} fill={CREAM} stroke={GRAY} strokeWidth="0.8" />
          <text x={RELAY_L + 240} y={RELAY_TOP + 120} textAnchor="middle" fontSize="7" fill={GRAY}>I²C BUS</text>
          <text x={RELAY_L + 240} y={RELAY_TOP + 132} textAnchor="middle" fontSize="7" fill={GRAY}>400kHz</text>
          {/* Protection function labels */}
          <text x={RELAY_L + 20} y={RELAY_TOP + 168} fontSize="8" fill={INK}>PROTECTION FUNCTIONS:</text>
          {['50/51 — Overcurrent (OCP)', 'ROCOV — Rate-of-Change dV/dt', '67 — Directional power flow'].map((fn, i) => (
            <text key={i} x={RELAY_L + 30} y={RELAY_TOP + 182 + i * 13} fontSize="8" fill={GRAY}>• {fn}</text>
          ))}

          {/* Trip outputs vertical lines (dashed, going up from panel to breakers) */}
          {[B1, B2, B3].map((x, i) => (
            <g key={`trip-${i}`}>
              <line x1={x} y1={RELAY_TOP} x2={x} y2={NY + 14} stroke={INK} strokeWidth="1" strokeDasharray="4,3" />
              {/* Arrow at CB */}
              <polygon points={`${x},${NY + 18} ${x - 4},${NY + 28} ${x + 4},${NY + 28}`} fill={INK} />
              <text x={x + 5} y={NY + 24} fontSize="7" fill={GRAY}>TRIP</text>
            </g>
          ))}

          {/* ADS1115 sub-panel */}
          <rect x={RELAY_L + 395} y={RELAY_TOP + 78} width="200" height="120"
            fill={CREAM} stroke={INK} strokeWidth="1.2" />
          <text x={RELAY_L + 495} y={RELAY_TOP + 92} textAnchor="middle" fontSize="9" fontWeight="bold" fill={INK}>ADS1115 ADC</text>
          <text x={RELAY_L + 495} y={RELAY_TOP + 104} textAnchor="middle" fontSize="7" fill={GRAY}>16-bit · 4-ch · I²C</text>
          {/* ADC channels */}
          {[
            ['A0', 'V_DC measurement'],
            ['A1', 'I_DC (Hall sensor)'],
            ['A2', 'V+ pole'],
            ['A3', 'V- pole'],
          ].map(([ch, fn], i) => (
            <g key={ch}>
              <text x={RELAY_L + 406} y={RELAY_TOP + 118 + i * 14} fontSize="7" fill={GRAY}>{ch}</text>
              <text x={RELAY_L + 425} y={RELAY_TOP + 118 + i * 14} fontSize="7" fill={INK}>{fn}</text>
            </g>
          ))}

          {/* GPIO Relay board sub-panel */}
          <rect x={RELAY_L + 395} y={RELAY_TOP + 205} width="200" height="110"
            fill={CREAM} stroke={INK} strokeWidth="1.2" />
          <text x={RELAY_L + 495} y={RELAY_TOP + 219} textAnchor="middle" fontSize="9" fontWeight="bold" fill={INK}>GPIO RELAY BOARD</text>
          <text x={RELAY_L + 495} y={RELAY_TOP + 231} textAnchor="middle" fontSize="7" fill={GRAY}>TRIP COIL OUTPUTS</text>
          {[
            ['GPIO17', 'B1 TRIP coil'],
            ['GPIO27', 'B2 TRIP coil'],
            ['GPIO22', 'B3 TRIP coil'],
            ['GPIO5', 'OCP pickup LED'],
            ['GPIO6', 'FAULT indicator'],
          ].map(([pin, fn], i) => (
            <g key={pin}>
              <text x={RELAY_L + 406} y={RELAY_TOP + 246 + i * 13} fontSize="7" fill={GRAY}>{pin}</text>
              <text x={RELAY_L + 456} y={RELAY_TOP + 246 + i * 13} fontSize="7" fill={INK}>{fn}</text>
            </g>
          ))}

          {/* Communication sub-panel */}
          <rect x={RELAY_L + 612} y={RELAY_TOP + 78} width="210" height="237"
            fill={CREAM} stroke={INK} strokeWidth="1.2" />
          <text x={RELAY_L + 717} y={RELAY_TOP + 92} textAnchor="middle" fontSize="9" fontWeight="bold" fill={INK}>COMMUNICATIONS</text>
          <text x={RELAY_L + 717} y={RELAY_TOP + 104} textAnchor="middle" fontSize="7" fill={GRAY}>IEC 61850 GOOSE · SSH</text>
          {[
            ['MODBUS', 'RTU via USB serial'],
            ['IEC 61850', 'GOOSE messaging'],
            ['SSH', 'Remote access port 22'],
            ['MQTT', 'Telemetry broker'],
            ['GPIO PWM', 'Sync pulse out'],
          ].map(([proto, desc], i) => (
            <g key={proto}>
              <text x={RELAY_L + 622} y={RELAY_TOP + 122 + i * 18} fontSize="8" fontWeight="bold" fill={INK}>{proto}</text>
              <text x={RELAY_L + 622} y={RELAY_TOP + 133 + i * 18} fontSize="7" fill={GRAY}>{desc}</text>
            </g>
          ))}

          {/* ═══════════════════════════════════════════════════
              SEPARATOR LINE (drawing / title block)
          ═══════════════════════════════════════════════════ */}
          <line x1="38" y1="754" x2="1522" y2="754" stroke={INK} strokeWidth="1.2" />

          {/* ═══════════════════════════════════════════════════
              NOTES SECTION (bottom left)
          ═══════════════════════════════════════════════════ */}
          <text x="50" y="770" fontSize="9" fontWeight="bold" fill={INK}>NOTES:</text>
          {[
            '1. All symbols per IEC 60617 (2024 edition).',
            '2. Protection relay functions per IEC 60255.',
            '3. GOOSE communications per IEC 61850-8-1.',
            '4. Rated DC voltage: ±320 kV. Rated current: 850 A.',
            '5. Surge arresters: IEC 60099-4, class C2, 370 kV Uc.',
            '6. CTs: class 5P20, 1A secondary. VTs: class 0.5, 110V.',
            '7. Trip time: ≤50 ms from fault detection to CB open.',
          ].map((note, i) => (
            <text key={i} x="50" y={782 + i * 11} fontSize="8" fill={GRAY}>{note}</text>
          ))}

          {/* ═══════════════════════════════════════════════════
              LEGEND / SYMBOL KEY (bottom centre)
          ═══════════════════════════════════════════════════ */}
          <line x1="490" y1="754" x2="490" y2="842" stroke={INK} strokeWidth="0.8" />
          <text x="500" y="770" fontSize="9" fontWeight="bold" fill={INK}>LEGEND — IEC 60617 SYMBOLS:</text>
          {/* CB */}
          <g transform="translate(510, 784)">
            <rect x="0" y="-8" width="16" height="16" fill={CREAM} stroke={INK} strokeWidth="1.2" />
            <line x1="3" y1="6" x2="13" y2="-6" stroke={INK} strokeWidth="1.2" />
            <text x="22" y="4" fontSize="8" fill={INK}>Circuit Breaker (CB)</text>
          </g>
          {/* CT */}
          <g transform="translate(510, 802)">
            <circle cx="8" cy="0" r="8" fill={CREAM} stroke={INK} strokeWidth="1.2" />
            <text x="22" y="4" fontSize="8" fill={INK}>Current Transformer (CT)</text>
          </g>
          {/* VT */}
          <g transform="translate(510, 820)">
            <circle cx="3" cy="0" r="5" fill={CREAM} stroke={INK} strokeWidth="1" />
            <circle cx="13" cy="0" r="5" fill={CREAM} stroke={INK} strokeWidth="1" />
            <text x="22" y="4" fontSize="8" fill={INK}>Voltage Transformer (VT)</text>
          </g>
          {/* SA */}
          <g transform="translate(700, 784)">
            <rect x="0" y="-8" width="14" height="22" fill={CREAM} stroke={INK} strokeWidth="1.2" />
            <polygon points="7,12 4,6 10,6" fill={INK} />
            <text x="20" y="4" fontSize="8" fill={INK}>Surge Arrester (SA)</text>
          </g>
          {/* Reactor */}
          <g transform="translate(700, 802)">
            <path d="M0,0 a5,5 0 0,1 10,0 a5,5 0 0,1 10,0 a5,5 0 0,1 10,0" fill="none" stroke={INK} strokeWidth="1.2" />
            <text x="35" y="4" fontSize="8" fill={INK}>Smoothing Reactor (L)</text>
          </g>
          {/* Transformer */}
          <g transform="translate(700, 820)">
            <circle cx="5" cy="0" r="6" fill="none" stroke={INK} strokeWidth="1.2" />
            <circle cx="17" cy="0" r="6" fill="none" stroke={INK} strokeWidth="1.2" />
            <text x="28" y="4" fontSize="8" fill={INK}>Power Transformer (TR)</text>
          </g>
          {/* Earth */}
          <g transform="translate(900, 784)">
            <line x1="6" y1="-6" x2="6" y2="0" stroke={INK} strokeWidth="1.2" />
            <line x1="0" y1="0" x2="12" y2="0" stroke={INK} strokeWidth="1.5" />
            <line x1="2" y1="4" x2="10" y2="4" stroke={INK} strokeWidth="1.5" />
            <line x1="4" y1="8" x2="8" y2="8" stroke={INK} strokeWidth="1.5" />
            <text x="18" y="4" fontSize="8" fill={INK}>Earth (protective ground)</text>
          </g>
          {/* Trip coil dashed line */}
          <g transform="translate(900, 810)">
            <line x1="0" y1="0" x2="16" y2="0" stroke={INK} strokeWidth="1" strokeDasharray="4,3" />
            <text x="22" y="4" fontSize="8" fill={INK}>Trip coil / secondary circuit</text>
          </g>

          {/* ═══════════════════════════════════════════════════
              TITLE BLOCK (bottom right — standard IEC format)
          ═══════════════════════════════════════════════════ */}
          <line x1="1120" y1="754" x2="1120" y2="842" stroke={INK} strokeWidth="0.8" />
          {/* Title block outer */}
          <rect x="1120" y="754" width="402" height="88" fill={CREAM} stroke={INK} strokeWidth="1.2" />
          {/* Horizontal dividers */}
          <line x1="1120" y1="772" x2="1522" y2="772" stroke={INK} strokeWidth="0.8" />
          <line x1="1120" y1="795" x2="1522" y2="795" stroke={INK} strokeWidth="0.8" />
          <line x1="1120" y1="814" x2="1522" y2="814" stroke={INK} strokeWidth="0.8" />
          <line x1="1120" y1="830" x2="1522" y2="830" stroke={INK} strokeWidth="0.8" />
          {/* Vertical dividers */}
          <line x1="1280" y1="795" x2="1280" y2="842" stroke={INK} strokeWidth="0.8" />
          <line x1="1380" y1="795" x2="1380" y2="842" stroke={INK} strokeWidth="0.8" />
          <line x1="1450" y1="795" x2="1450" y2="842" stroke={INK} strokeWidth="0.8" />

          {/* Company / project header */}
          <text x="1310" y="766" textAnchor="middle" fontSize="10" fontWeight="bold" fill={INK}>KIRTAN SAMJI — BEng MECHATRONICS</text>
          <text x="1310" y="788" fontSize="8" fill={GRAY} x1="1128">PROJECT: HVDC BIPOLAR LINK PROTECTION SYSTEM</text>
          <text x="1128" y="788" fontSize="8" fill={GRAY}>PROJECT: HVDC BIPOLAR LINK PROTECTION SYSTEM</text>

          {/* Title row */}
          <text x="1128" y="807" fontSize="8" fontWeight="bold" fill={INK}>TITLE:</text>
          <text x="1165" y="807" fontSize="8" fill={INK}>Protection Relay Scheme — Bipolar ±320kV VSC HVDC Link</text>

          {/* Data cells */}
          <text x="1128" y="823" fontSize="7" fill={GRAY}>DOC NO.</text>
          <text x="1128" y="832" fontSize="8" fontWeight="bold" fill={INK}>HVDC-PRD-001</text>
          <text x="1288" y="823" fontSize="7" fill={GRAY}>REV.</text>
          <text x="1295" y="832" fontSize="9" fontWeight="bold" fill={INK}>A</text>
          <text x="1388" y="823" fontSize="7" fill={GRAY}>DATE</text>
          <text x="1388" y="832" fontSize="8" fill={INK}>2026-06-25</text>
          <text x="1458" y="823" fontSize="7" fill={GRAY}>SCALE</text>
          <text x="1458" y="832" fontSize="8" fill={INK}>NTS</text>
          <text x="1128" y="841" fontSize="7" fill={GRAY}>STANDARDS: IEC 60617 · IEC 60255 · IEC 61850 · IEC 60099</text>

          {/* Sheet box */}
          <text x="1388" y="841" fontSize="7" fill={GRAY}>SHEET</text>
          <text x="1412" y="841" fontSize="8" fill={INK}>1 of 1</text>
        </svg>
      </div>
    </div>
  );
}
