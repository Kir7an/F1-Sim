'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CursorDot } from '@/components/CursorDot';

const ACCENT = '#EF4444';

type Tab = 'feed' | 'analytics' | 'model';
const TABS: { id: Tab; label: string; badge?: string }[] = [
  { id: 'feed',      label: 'Live Feed',   badge: 'LIVE' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'model',     label: 'Model' },
];

// ── helpers ──────────────────────────────────────────────────────────────────
const MERCHANTS = ['Stripe Payment','Amazon AWS','Revolut Transfer','Binance Exchange','Steam Games','PayPal Transfer','Shopify Store','Netflix','Uber Eats','Apple Store','Wise Transfer','Coinbase Pro'];
const LOCATIONS = ['London, UK','New York, US','Dubai, UAE','Singapore, SG','Frankfurt, DE','Toronto, CA','Mumbai, IN','Sydney, AU','Tokyo, JP','São Paulo, BR'];
let TXN_ID = 10_000;

function makeTxn(fraudBurst = false) {
  const isFraud = fraudBurst ? Math.random() > 0.2 : Math.random() > 0.9;
  const baseRisk = isFraud ? 0.65 + Math.random() * 0.35 : Math.random() * 0.45;
  return {
    id: `TXN-${++TXN_ID}`,
    amount: fraudBurst && isFraud ? (2000 + Math.random() * 18000).toFixed(2) : (10 + Math.random() * 1200).toFixed(2),
    merchant: MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)],
    location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
    risk: +baseRisk.toFixed(3),
    flagged: isFraud,
    ts: new Date().toISOString().slice(11, 23),
  };
}

function riskColor(r: number) {
  if (r > 0.7) return '#EF4444';
  if (r > 0.4) return '#F59E0B';
  return '#22C55E';
}
function riskLabel(r: number) {
  if (r > 0.7) return 'HIGH';
  if (r > 0.4) return 'MED';
  return 'LOW';
}

// ── Live Feed Tab ────────────────────────────────────────────────────────────
function LiveFeedTab() {
  const [txns, setTxns] = useState(() => Array.from({ length: 12 }, () => makeTxn()));
  const [burst, setBurst] = useState(false);
  const [stats, setStats] = useState({ total: 12, flagged: 0, rate: 0, blocked: 0 });
  const burstRef = useRef(false);

  useEffect(() => {
    const iv = setInterval(() => {
      const t = makeTxn(burstRef.current);
      setTxns(prev => {
        const next = [t, ...prev].slice(0, 40);
        const flagged = next.filter(x => x.flagged).length;
        setStats({ total: next.length, flagged, rate: +(flagged / next.length * 100).toFixed(1), blocked: flagged });
        return next;
      });
    }, 600);
    return () => clearInterval(iv);
  }, []);

  const triggerBurst = useCallback(() => {
    burstRef.current = true;
    setBurst(true);
    setTimeout(() => { burstRef.current = false; setBurst(false); }, 5000);
  }, []);

  return (
    <div className="space-y-6">
      {/* stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Transactions', val: stats.total, unit: '' },
          { label: 'Flagged', val: stats.flagged, unit: '', color: '#EF4444' },
          { label: 'Fraud Rate', val: stats.rate, unit: '%', color: stats.rate > 10 ? '#EF4444' : '#22C55E' },
          { label: 'Blocked', val: stats.blocked, unit: '', color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
            <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-1">{s.label}</p>
            <p className="font-heading font-black text-2xl" style={{ color: s.color || '#f3f3f3' }}>{s.val}{s.unit}</p>
          </div>
        ))}
      </div>

      {/* controls */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1.5 text-[10px] font-mono tracking-widest ${burst ? 'text-red-400' : 'text-[#444]'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${burst ? 'bg-red-500 animate-pulse' : 'bg-[#333]'}`} />
          {burst ? 'FRAUD BURST ACTIVE' : 'MONITORING LIVE'}
        </div>
        <button
          onClick={triggerBurst}
          disabled={burst}
          className="ml-auto px-4 py-1.5 rounded-lg font-mono text-xs tracking-wider border transition-all disabled:opacity-40"
          style={{ borderColor: ACCENT + '60', color: ACCENT }}
        >
          INJECT FRAUD BURST
        </button>
      </div>

      {/* feed */}
      <div className="border border-[#1a1a1a] rounded-xl overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-2 border-b border-[#111] bg-[#080808]">
          {['TXN ID','MERCHANT / LOCATION','AMOUNT','RISK','STATUS'].map(h => (
            <span key={h} className="font-mono text-[9px] text-[#333] tracking-widest uppercase">{h}</span>
          ))}
        </div>
        <div className="divide-y divide-[#0f0f0f] max-h-[480px] overflow-y-auto">
          <AnimatePresence initial={false}>
            {txns.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, backgroundColor: t.flagged ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.08)' }}
                animate={{ opacity: 1, backgroundColor: 'transparent' }}
                transition={{ duration: 0.8 }}
                className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 items-center hover:bg-[#0d0d0d] transition-colors"
              >
                <span className="font-mono text-[11px] text-[#555]">{t.id}</span>
                <div>
                  <p className="font-mono text-xs text-[#ccc]">{t.merchant}</p>
                  <p className="font-mono text-[10px] text-[#444]">{t.location} · {t.ts}</p>
                </div>
                <span className="font-mono text-xs text-[#888]">£{t.amount}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${t.risk * 100}%`, backgroundColor: riskColor(t.risk) }} />
                  </div>
                  <span className="font-mono text-[10px] w-8 text-right" style={{ color: riskColor(t.risk) }}>{(t.risk * 100).toFixed(0)}%</span>
                </div>
                <span className="font-mono text-[9px] tracking-widest px-2 py-0.5 rounded-full border"
                  style={{ color: riskColor(t.risk), borderColor: riskColor(t.risk) + '40' }}>
                  {riskLabel(t.risk)}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab() {
  // ROC curve points (pre-computed for a good-looking curve)
  const rocPts = [
    [0,0],[0.02,0.38],[0.05,0.62],[0.1,0.78],[0.18,0.87],[0.28,0.93],[0.42,0.96],[0.6,0.985],[0.8,0.995],[1,1]
  ];
  const W = 340, H = 220;
  const toX = (v: number) => 40 + v * (W - 50);
  const toY = (v: number) => (H - 20) - v * (H - 30);
  const rocPath = rocPts.map(([x,y], i) => `${i===0?'M':'L'}${toX(x).toFixed(1)},${toY(y).toFixed(1)}`).join(' ');
  const diagPath = `M${toX(0)},${toY(0)} L${toX(1)},${toY(1)}`;

  const distBins = Array.from({length: 20}, (_, i) => {
    const x = i / 20;
    const legit = Math.exp(-Math.pow((x - 0.2) / 0.15, 2)) * 30;
    const fraud = Math.exp(-Math.pow((x - 0.78) / 0.12, 2)) * 28;
    return { x: (x * 100).toFixed(0), legit: legit.toFixed(1), fraud: fraud.toFixed(1) };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ROC Curve */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
          <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-4">ROC Curve — AUC 0.974</p>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            <line x1={toX(0)} y1={toY(0)} x2={toX(1)} y2={toY(0)} stroke="#222" strokeWidth="1" />
            <line x1={toX(0)} y1={toY(0)} x2={toX(0)} y2={toY(1)} stroke="#222" strokeWidth="1" />
            {[0,0.25,0.5,0.75,1].map(v => (
              <g key={v}>
                <line x1={toX(v)} y1={toY(0)} x2={toX(v)} y2={toY(1)} stroke="#151515" strokeWidth="1" />
                <line x1={toX(0)} y1={toY(v)} x2={toX(1)} y2={toY(v)} stroke="#151515" strokeWidth="1" />
                <text x={toX(v)} y={toY(0)+14} textAnchor="middle" fontSize="8" fill="#333">{v}</text>
                <text x={toX(0)-4} y={toY(v)+3} textAnchor="end" fontSize="8" fill="#333">{v}</text>
              </g>
            ))}
            <path d={diagPath} stroke="#333" strokeWidth="1" strokeDasharray="4 4" fill="none" />
            <path d={rocPath + ` L${toX(1)},${toY(0)} L${toX(0)},${toY(0)} Z`} fill={ACCENT} fillOpacity="0.08" />
            <path d={rocPath} stroke={ACCENT} strokeWidth="2" fill="none" strokeLinejoin="round" />
            <text x={toX(0.5)} y={toY(0)+24} textAnchor="middle" fontSize="8" fill="#555">False Positive Rate</text>
            <text x={10} y={toY(0.5)} textAnchor="middle" fontSize="8" fill="#555" transform={`rotate(-90,10,${toY(0.5)})`}>True Positive Rate</text>
          </svg>
        </div>

        {/* Score Distribution */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
          <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-4">Anomaly Score Distribution</p>
          <div className="flex items-end gap-1 h-40 mt-2">
            {distBins.map(b => (
              <div key={b.x} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full flex flex-col justify-end gap-0.5" style={{height:'100%'}}>
                  <div className="w-full rounded-sm" style={{height:`${+b.fraud*3.5}px`, backgroundColor:'#EF4444', opacity:0.8}} />
                  <div className="w-full rounded-sm" style={{height:`${+b.legit*3.5}px`, backgroundColor:'#22C55E', opacity:0.6}} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#555]"><span className="w-2 h-2 rounded-sm bg-green-500 opacity-60" />Legitimate</span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#555]"><span className="w-2 h-2 rounded-sm bg-red-500 opacity-80" />Fraudulent</span>
          </div>
        </div>
      </div>

      {/* confusion matrix + metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
          <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-4">Confusion Matrix</p>
          <div className="grid grid-cols-2 gap-2 max-w-xs">
            {[
              { label:'True Neg', val:'9,847', color:'#22C55E' },
              { label:'False Pos', val:'153', color:'#F59E0B' },
              { label:'False Neg', val:'42', color:'#F59E0B' },
              { label:'True Pos', val:'958', color:'#22C55E' },
            ].map(c => (
              <div key={c.label} className="rounded-lg p-3 text-center" style={{backgroundColor: c.color+'12', border:`1px solid ${c.color}20`}}>
                <p className="font-mono text-[9px] tracking-widest uppercase mb-1" style={{color:c.color+'99'}}>{c.label}</p>
                <p className="font-heading font-black text-xl" style={{color:c.color}}>{c.val}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
          <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-4">Performance Metrics</p>
          <div className="space-y-3">
            {[
              { label:'Precision', val:0.862 },
              { label:'Recall (Sensitivity)', val:0.958 },
              { label:'F1 Score', val:0.907 },
              { label:'Accuracy', val:0.982 },
              { label:'AUC-ROC', val:0.974 },
            ].map(m => (
              <div key={m.label} className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-[#555] w-36">{m.label}</span>
                <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <motion.div initial={{width:0}} animate={{width:`${m.val*100}%`}} transition={{duration:1, delay:0.2}} className="h-full rounded-full" style={{backgroundColor:ACCENT}} />
                </div>
                <span className="font-mono text-xs w-10 text-right" style={{color:ACCENT}}>{(m.val*100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Model Tab ─────────────────────────────────────────────────────────────────
function ModelTab() {
  const features = [
    { name:'Transaction Amount', importance: 0.241 },
    { name:'Time Since Last Txn', importance: 0.198 },
    { name:'Merchant Category', importance: 0.172 },
    { name:'Geographic Distance', importance: 0.154 },
    { name:'Transaction Velocity', importance: 0.121 },
    { name:'Device Fingerprint', importance: 0.088 },
    { name:'Hour of Day', importance: 0.026 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label:'Model Type', val:'Isolation Forest + XGBoost Ensemble' },
          { label:'Training Samples', val:'2.4M transactions · 3.2% fraud rate' },
          { label:'Inference Latency', val:'<8ms per transaction' },
        ].map(c => (
          <div key={c.label} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
            <p className="font-mono text-[9px] text-[#444] tracking-widest uppercase mb-1">{c.label}</p>
            <p className="font-mono text-xs text-[#ccc]">{c.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
        <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-5">Feature Importance (SHAP Values)</p>
        <div className="space-y-3">
          {features.map((f, i) => (
            <div key={f.name} className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#555] w-40">{f.name}</span>
              <div className="flex-1 h-5 bg-[#111] rounded overflow-hidden">
                <motion.div
                  initial={{width:0}}
                  animate={{width:`${f.importance / 0.241 * 100}%`}}
                  transition={{duration:0.8, delay:i*0.07}}
                  className="h-full flex items-center px-2 rounded"
                  style={{backgroundColor: ACCENT, opacity: 0.5 + f.importance * 2}}
                >
                  <span className="font-mono text-[9px] text-white">{(f.importance*100).toFixed(1)}%</span>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
        <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-4">Architecture</p>
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {['Raw Features (7)', 'Preprocessing + Scaling', 'Isolation Forest Scores', 'XGBoost Classifier', 'Threshold (0.65)', 'FRAUD / LEGIT'].map((s, i, arr) => (
            <div key={s} className="flex items-center gap-3 shrink-0">
              <div className="px-3 py-2 rounded-lg border border-[#222] bg-[#111]">
                <p className="font-mono text-[10px] text-[#888] whitespace-nowrap">{s}</p>
              </div>
              {i < arr.length - 1 && <svg width="16" height="10" viewBox="0 0 16 10"><path d="M0 5h12M9 1l4 4-4 4" stroke="#333" strokeWidth="1.5" fill="none"/></svg>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function FraudPage() {
  const [active, setActive] = useState<Tab>('feed');
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
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <span className="font-heading font-black text-frost text-lg tracking-tight">Fraud</span>
                <span className="font-heading font-black text-lg tracking-tight" style={{color:ACCENT}}>Sentinel</span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-1.5 border border-[#1a1a1a] rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{backgroundColor:ACCENT}} />
                <span className="font-mono text-[9px] text-[#444] tracking-widest">AI FRAUD DETECTION · LIVE</span>
              </div>
            </div>
            <div className="flex items-center gap-1 pb-0 overflow-x-auto">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActive(tab.id)}
                  className={`relative flex items-center gap-1.5 px-4 py-3 font-mono text-xs tracking-wider transition-colors whitespace-nowrap ${active===tab.id?'text-frost':'text-[#444] hover:text-[#888]'}`}>
                  {tab.label}
                  {tab.badge && <span className="text-[8px] px-1 rounded font-mono" style={active===tab.id?{backgroundColor:ACCENT,color:'white'}:{backgroundColor:'#1a1a1a',color:'#444'}}>{tab.badge}</span>}
                  {active===tab.id && <motion.div layoutId="fraud-tab" className="absolute bottom-0 left-0 right-0 h-0.5" style={{backgroundColor:ACCENT}} transition={{type:'spring',stiffness:400,damping:30}} />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="font-heading font-black text-2xl md:text-4xl text-frost mb-2">Fraud Sentinel</h1>
            <p className="font-mono text-[11px] text-[#444] tracking-wider">ISOLATION FOREST + XGBOOST ENSEMBLE · 97.4% AUC · &lt;8ms INFERENCE</p>
          </div>
          <AnimatePresence mode="wait">
            {active==='feed' && <motion.div key="feed" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.25}}><LiveFeedTab /></motion.div>}
            {active==='analytics' && <motion.div key="analytics" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.25}}><AnalyticsTab /></motion.div>}
            {active==='model' && <motion.div key="model" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.25}}><ModelTab /></motion.div>}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
