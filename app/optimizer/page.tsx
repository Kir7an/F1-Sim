'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CursorDot } from '@/components/CursorDot';

const ACCENT = '#8B5CF6';

type Tab = 'optimizer' | 'frontier' | 'correlation';
const TABS: { id: Tab; label: string }[] = [
  { id: 'optimizer',   label: 'Optimiser' },
  { id: 'frontier',    label: 'Frontier' },
  { id: 'correlation', label: 'Correlation' },
];

const ASSETS = [
  { name:'S&P 500',  ticker:'SPY',  ret:0.12, vol:0.16, color:'#3B82F6' },
  { name:'Nasdaq',   ticker:'QQQ',  ret:0.15, vol:0.22, color:'#8B5CF6' },
  { name:'Gold',     ticker:'GLD',  ret:0.07, vol:0.14, color:'#F59E0B' },
  { name:'Bonds',    ticker:'TLT',  ret:0.04, vol:0.09, color:'#22C55E' },
  { name:'Bitcoin',  ticker:'BTC',  ret:0.28, vol:0.62, color:'#F97316' },
  { name:'REIT',     ticker:'VNQ',  ret:0.09, vol:0.18, color:'#EC4899' },
];

// Corr matrix (symmetric)
const CORR = [
  [1.00, 0.87, 0.02,-0.35, 0.41, 0.62],
  [0.87, 1.00,-0.04,-0.42, 0.48, 0.55],
  [0.02,-0.04, 1.00, 0.28, 0.08,-0.11],
  [-0.35,-0.42, 0.28, 1.00,-0.19,-0.22],
  [0.41, 0.48, 0.08,-0.19, 1.00, 0.33],
  [0.62, 0.55,-0.11,-0.22, 0.33, 1.00],
];

function computePortfolio(risk: number) {
  // As risk increases: more equities/BTC, less bonds/gold
  const r = risk / 100;
  const rawW = [
    0.35 + r * 0.15,   // SPY
    0.20 + r * 0.20,   // QQQ
    0.15 - r * 0.13,   // GLD
    0.20 - r * 0.18,   // TLT
    0.02 + r * 0.14,   // BTC
    0.08 - r * 0.05,   // REIT
  ].map(w => Math.max(0, w));
  const sum = rawW.reduce((a,b)=>a+b,0);
  const weights = rawW.map(w => w/sum);
  const portRet = weights.reduce((a,w,i) => a + w*ASSETS[i].ret, 0);
  const portVol = Math.sqrt(
    weights.reduce((a,wi,i) => a + weights.reduce((b,wj,j) => b + wi*wj*ASSETS[i].vol*ASSETS[j].vol*CORR[i][j], 0), 0)
  );
  const sharpe = (portRet - 0.045) / portVol;
  return { weights, ret: portRet, vol: portVol, sharpe };
}

function generateFrontier() {
  return Array.from({length:60}, (_, i) => {
    const r = i / 59;
    const p = computePortfolio(r * 100);
    return { vol: p.vol, ret: p.ret, risk: r * 100 };
  });
}

const FRONTIER = generateFrontier();

// ── Optimiser Tab ─────────────────────────────────────────────────────────────
function OptimizerTab() {
  const [risk, setRisk] = useState(40);
  const port = useMemo(() => computePortfolio(risk), [risk]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Expected Return', val:`${(port.ret*100).toFixed(1)}%`, color:ACCENT },
          { label:'Portfolio Vol', val:`${(port.vol*100).toFixed(1)}%`, color:'#F59E0B' },
          { label:'Sharpe Ratio', val:port.sharpe.toFixed(2), color:ACCENT },
          { label:'Risk Level', val:risk > 66 ? 'HIGH' : risk > 33 ? 'MEDIUM' : 'LOW', color: risk>66?'#EF4444':risk>33?'#F59E0B':'#22C55E' },
        ].map(s => (
          <div key={s.label} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
            <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-1">{s.label}</p>
            <p className="font-heading font-black text-2xl" style={{color:s.color}}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase">Risk Appetite</p>
          <span className="font-mono text-sm" style={{color:ACCENT}}>{risk}%</span>
        </div>
        <input type="range" min={0} max={100} value={risk} onChange={e=>setRisk(+e.target.value)}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{accentColor:ACCENT, background:`linear-gradient(to right, ${ACCENT} ${risk}%, #1a1a1a ${risk}%)`}} />
        <div className="flex justify-between mt-1">
          <span className="font-mono text-[9px] text-[#333]">Conservative</span>
          <span className="font-mono text-[9px] text-[#333]">Aggressive</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
          <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-4">Asset Allocation</p>
          <div className="space-y-3">
            {ASSETS.map((a, i) => (
              <div key={a.ticker} className="flex items-center gap-3">
                <span className="font-mono text-[10px] w-8" style={{color:a.color}}>{a.ticker}</span>
                <span className="font-mono text-[10px] text-[#555] w-16">{a.name}</span>
                <div className="flex-1 h-4 bg-[#111] rounded overflow-hidden">
                  <motion.div
                    animate={{width:`${port.weights[i]*100}%`}}
                    transition={{duration:0.4, ease:'easeOut'}}
                    className="h-full rounded flex items-center px-1.5"
                    style={{backgroundColor:a.color, opacity:0.75}}
                  >
                    <span className="font-mono text-[9px] text-white truncate">{(port.weights[i]*100).toFixed(1)}%</span>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* donut */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5 flex flex-col items-center justify-center">
          <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-4 self-start">Portfolio Donut</p>
          <svg viewBox="-1 -1 2 2" className="w-48 h-48" style={{transform:'rotate(-90deg)'}}>
            {(() => {
              let start = 0;
              return port.weights.map((w, i) => {
                const angle = w * 2 * Math.PI;
                const x1 = Math.cos(start), y1 = Math.sin(start);
                const x2 = Math.cos(start+angle), y2 = Math.sin(start+angle);
                const large = angle > Math.PI ? 1 : 0;
                const path = `M ${x1*0.6} ${y1*0.6} L ${x1} ${y1} A 1 1 0 ${large} 1 ${x2} ${y2} L ${x2*0.6} ${y2*0.6} A 0.6 0.6 0 ${large} 0 ${x1*0.6} ${y1*0.6}`;
                start += angle;
                return <path key={i} d={path} fill={ASSETS[i].color} fillOpacity="0.8" stroke="#050505" strokeWidth="0.02" />;
              });
            })()}
          </svg>
          <div className="grid grid-cols-3 gap-2 mt-2 w-full">
            {ASSETS.map((a, i) => (
              <div key={a.ticker} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm shrink-0" style={{backgroundColor:a.color}} />
                <span className="font-mono text-[9px] text-[#555]">{a.ticker} {(port.weights[i]*100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Frontier Tab ─────────────────────────────────────────────────────────────
function FrontierTab() {
  const [hover, setHover] = useState<number|null>(null);
  const W = 600, H = 300, PAD = 50;
  const vols = FRONTIER.map(p=>p.vol), rets = FRONTIER.map(p=>p.ret);
  const minV = Math.min(...vols), maxV = Math.max(...vols);
  const minR = Math.min(...rets), maxR = Math.max(...rets);
  const sx = (v:number) => PAD + (v-minV)/(maxV-minV) * (W-2*PAD);
  const sy = (r:number) => (H-PAD) - (r-minR)/(maxR-minR) * (H-2*PAD);
  const path = FRONTIER.map((p,i) => `${i===0?'M':'L'}${sx(p.vol).toFixed(1)},${sy(p.ret).toFixed(1)}`).join(' ');

  // optimal = max sharpe
  const optIdx = FRONTIER.reduce((best, p, i, a) => {
    const s=(p.ret-0.045)/p.vol; const bs=(a[best].ret-0.045)/a[best].vol;
    return s>bs?i:best;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
        <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-4">Markowitz Efficient Frontier</p>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onMouseLeave={()=>setHover(null)}>
          {[0.25,0.5,0.75].map(v => (
            <g key={v}>
              <line x1={PAD} y1={sy(minR+(maxR-minR)*v)} x2={W-PAD} y2={sy(minR+(maxR-minR)*v)} stroke="#111" strokeWidth="1"/>
              <text x={PAD-5} y={sy(minR+(maxR-minR)*v)+4} textAnchor="end" fontSize="8" fill="#333">{((minR+(maxR-minR)*v)*100).toFixed(0)}%</text>
              <line x1={sx(minV+(maxV-minV)*v)} y1={PAD} x2={sx(minV+(maxV-minV)*v)} y2={H-PAD} stroke="#111" strokeWidth="1"/>
              <text x={sx(minV+(maxV-minV)*v)} y={H-PAD+14} textAnchor="middle" fontSize="8" fill="#333">{((minV+(maxV-minV)*v)*100).toFixed(0)}%</text>
            </g>
          ))}
          <text x={W/2} y={H-PAD+28} textAnchor="middle" fontSize="9" fill="#555">Volatility (Risk)</text>
          <text x={12} y={H/2} textAnchor="middle" fontSize="9" fill="#555" transform={`rotate(-90,12,${H/2})`}>Expected Return</text>

          {/* fill */}
          <path d={path + ` L${sx(maxV)},${sy(minR)} L${sx(minV)},${sy(minR)} Z`} fill={ACCENT} fillOpacity="0.04" />
          {/* gradient line */}
          <defs>
            <linearGradient id="fg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22C55E" />
              <stop offset="50%" stopColor={ACCENT} />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
          <path d={path} stroke="url(#fg)" strokeWidth="2.5" fill="none" />

          {/* hover dots */}
          {FRONTIER.map((p,i) => (
            <circle key={i} cx={sx(p.vol)} cy={sy(p.ret)} r={hover===i?5:3}
              fill={hover===i?'white':ACCENT} fillOpacity={hover===i?1:0.3}
              className="cursor-pointer transition-all"
              onMouseEnter={()=>setHover(i)} />
          ))}

          {/* optimal point */}
          <circle cx={sx(FRONTIER[optIdx].vol)} cy={sy(FRONTIER[optIdx].ret)} r="6" fill="white" fillOpacity="0.9" />
          <circle cx={sx(FRONTIER[optIdx].vol)} cy={sy(FRONTIER[optIdx].ret)} r="3" fill={ACCENT} />
          <text x={sx(FRONTIER[optIdx].vol)+10} y={sy(FRONTIER[optIdx].ret)-8} fontSize="9" fill="white">Max Sharpe</text>
        </svg>

        {hover !== null && (
          <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[#111]">
            <span className="font-mono text-[10px] text-[#555]">Risk: <span style={{color:ACCENT}}>{(FRONTIER[hover].vol*100).toFixed(1)}%</span></span>
            <span className="font-mono text-[10px] text-[#555]">Return: <span style={{color:ACCENT}}>{(FRONTIER[hover].ret*100).toFixed(1)}%</span></span>
            <span className="font-mono text-[10px] text-[#555]">Sharpe: <span style={{color:ACCENT}}>{((FRONTIER[hover].ret-0.045)/FRONTIER[hover].vol).toFixed(2)}</span></span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'Min Variance Portfolio', vol:`${(FRONTIER[0].vol*100).toFixed(1)}%`, ret:`${(FRONTIER[0].ret*100).toFixed(1)}%` },
          { label:'Max Sharpe Portfolio', vol:`${(FRONTIER[optIdx].vol*100).toFixed(1)}%`, ret:`${(FRONTIER[optIdx].ret*100).toFixed(1)}%` },
          { label:'Max Return Portfolio', vol:`${(FRONTIER[59].vol*100).toFixed(1)}%`, ret:`${(FRONTIER[59].ret*100).toFixed(1)}%` },
        ].map(p => (
          <div key={p.label} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
            <p className="font-mono text-[9px] text-[#444] tracking-widest uppercase mb-2">{p.label}</p>
            <p className="font-mono text-xs text-[#888]">Vol: <span style={{color:ACCENT}}>{p.vol}</span></p>
            <p className="font-mono text-xs text-[#888]">Ret: <span style={{color:ACCENT}}>{p.ret}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Correlation Tab ──────────────────────────────────────────────────────────
function CorrelationTab() {
  function corrColor(v: number) {
    if (v > 0.6) return `rgba(139,92,246,${0.3+v*0.5})`;
    if (v > 0) return `rgba(139,92,246,${v*0.4})`;
    return `rgba(239,68,68,${-v*0.5})`;
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
        <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-4">Asset Correlation Matrix</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="w-16" />
                {ASSETS.map(a => <th key={a.ticker} className="font-mono text-[10px] text-[#555] pb-2 text-center">{a.ticker}</th>)}
              </tr>
            </thead>
            <tbody>
              {ASSETS.map((row, i) => (
                <tr key={row.ticker}>
                  <td className="font-mono text-[10px] text-[#555] pr-3 py-0.5">{row.ticker}</td>
                  {ASSETS.map((_, j) => (
                    <td key={j} className="py-0.5 px-0.5">
                      <div className="w-12 h-10 rounded flex items-center justify-center" style={{backgroundColor:corrColor(CORR[i][j])}}>
                        <span className="font-mono text-[9px] font-bold" style={{color:CORR[i][j]>0?'rgba(139,92,246,0.9)':'rgba(239,68,68,0.9)'}}>
                          {CORR[i][j].toFixed(2)}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 rounded" style={{background:'linear-gradient(to right, rgba(239,68,68,0.5), #111, rgba(139,92,246,0.8))'}} />
            <span className="font-mono text-[9px] text-[#444]">Negative → Positive correlation</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ASSETS.map((a, i) => (
          <div key={a.ticker} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-sm" style={{backgroundColor:a.color}} />
              <span className="font-mono text-[10px] text-[#888]">{a.ticker} — {a.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><p className="font-mono text-[9px] text-[#444]">Expected Return</p><p className="font-mono text-xs" style={{color:ACCENT}}>{(a.ret*100).toFixed(0)}% p.a.</p></div>
              <div><p className="font-mono text-[9px] text-[#444]">Volatility</p><p className="font-mono text-xs text-[#F59E0B]">{(a.vol*100).toFixed(0)}% p.a.</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function OptimizerPage() {
  const [active, setActive] = useState<Tab>('optimizer');
  return (
    <>
      <CursorDot />
      <div className="min-h-screen bg-[#050505] text-frost">
        <div className="border-b border-[#111] bg-[#050505]/95 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-6 py-4">
              <a href="/" className="font-mono text-[10px] text-[#444] hover:text-[#888] tracking-widest uppercase transition-colors flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Portfolio
              </a>
              <div className="w-px h-4 bg-[#1a1a1a]" />
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-sm flex items-center justify-center" style={{backgroundColor:ACCENT}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                </div>
                <span className="font-heading font-black text-frost text-lg tracking-tight">Quant</span>
                <span className="font-heading font-black text-lg tracking-tight" style={{color:ACCENT}}>Lens</span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-1.5 border border-[#1a1a1a] rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:ACCENT}} />
                <span className="font-mono text-[9px] text-[#444] tracking-widest">MARKOWITZ OPTIMISER · LIVE</span>
              </div>
            </div>
            <div className="flex items-center gap-1 pb-0">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActive(tab.id)}
                  className={`relative px-4 py-3 font-mono text-xs tracking-wider transition-colors ${active===tab.id?'text-frost':'text-[#444] hover:text-[#888]'}`}>
                  {tab.label}
                  {active===tab.id && <motion.div layoutId="opt-tab" className="absolute bottom-0 left-0 right-0 h-0.5" style={{backgroundColor:ACCENT}} transition={{type:'spring',stiffness:400,damping:30}} />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="font-heading font-black text-2xl md:text-4xl text-frost mb-2">Quant Lens</h1>
            <p className="font-mono text-[11px] text-[#444] tracking-wider">MARKOWITZ MEAN-VARIANCE OPTIMISATION · 6 ASSETS · LIVE RISK SLIDER</p>
          </div>
          <AnimatePresence mode="wait">
            {active==='optimizer' && <motion.div key="optimizer" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.25}}><OptimizerTab /></motion.div>}
            {active==='frontier' && <motion.div key="frontier" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.25}}><FrontierTab /></motion.div>}
            {active==='correlation' && <motion.div key="correlation" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.25}}><CorrelationTab /></motion.div>}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
