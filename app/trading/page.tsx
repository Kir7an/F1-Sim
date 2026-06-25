'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CursorDot } from '@/components/CursorDot';

const ACCENT = '#22C55E';

type Tab = 'backtest' | 'signals' | 'performance';
const TABS: { id: Tab; label: string }[] = [
  { id: 'backtest',    label: 'Backtest' },
  { id: 'signals',     label: 'Signals' },
  { id: 'performance', label: 'Performance' },
];

// ── data generation ──────────────────────────────────────────────────────────
function generatePriceData(n = 200) {
  const prices: number[] = [100];
  for (let i = 1; i < n; i++) {
    const drift = 0.0003;
    const vol = 0.018;
    const r = drift + vol * (Math.random() * 2 - 1) * 1.5;
    prices.push(+(prices[i-1] * (1 + r)).toFixed(2));
  }
  return prices;
}

function generateSignals(prices: number[]) {
  // Simple ML-like signal: momentum + mean-reversion blend
  const signals: ('buy'|'sell'|null)[] = new Array(prices.length).fill(null);
  const ma20 = prices.map((_, i) => i < 20 ? null : prices.slice(i-20,i).reduce((a,b)=>a+b,0)/20);
  let position = false;
  for (let i = 20; i < prices.length - 1; i++) {
    const m = ma20[i]!;
    const above = prices[i] > m;
    const momentum = (prices[i] - prices[i-5]) / prices[i-5];
    if (!position && above && momentum > 0.015 && Math.random() > 0.6) {
      signals[i] = 'buy'; position = true;
    } else if (position && (!above || momentum < -0.012) && Math.random() > 0.5) {
      signals[i] = 'sell'; position = false;
    }
  }
  return signals;
}

function computeEquityCurve(prices: number[], signals: ('buy'|'sell'|null)[]) {
  let equity = 10000; let shares = 0; let buyPrice = 0;
  const curve: number[] = [10000];
  const trades: {i:number, type:'buy'|'sell', price:number, pnl?:number}[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (signals[i-1] === 'buy' && shares === 0) {
      shares = Math.floor(equity / prices[i-1]);
      buyPrice = prices[i-1];
      trades.push({i:i-1, type:'buy', price:prices[i-1]});
    } else if (signals[i-1] === 'sell' && shares > 0) {
      const pnl = shares * (prices[i-1] - buyPrice);
      equity += pnl;
      trades.push({i:i-1, type:'sell', price:prices[i-1], pnl});
      shares = 0;
    }
    curve.push(+(equity + shares * prices[i]).toFixed(2));
  }
  return { curve, trades };
}

const SEED_PRICES = generatePriceData(200);
const SEED_SIGNALS = generateSignals(SEED_PRICES);
const { curve: SEED_CURVE, trades: SEED_TRADES } = computeEquityCurve(SEED_PRICES, SEED_SIGNALS);

// ── chart helpers ─────────────────────────────────────────────────────────────
function sparkPath(data: number[], W: number, H: number, pad = 10) {
  const mn = Math.min(...data), mx = Math.max(...data);
  const sx = (i: number) => pad + (i / (data.length-1)) * (W - 2*pad);
  const sy = (v: number) => (H-pad) - ((v-mn)/(mx-mn||1)) * (H-2*pad);
  return data.map((v,i) => `${i===0?'M':'L'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(' ');
}

// ── Backtest Tab ──────────────────────────────────────────────────────────────
function BacktestTab() {
  const [animLen, setAnimLen] = useState(0);
  const [running, setRunning] = useState(false);
  const rafRef = useRef<number>(0);

  const runBacktest = useCallback(() => {
    setRunning(true); setAnimLen(0);
    const start = performance.now();
    const dur = 2200;
    const step = () => {
      const p = Math.min((performance.now()-start)/dur, 1);
      setAnimLen(Math.floor(p * 200));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
      else setRunning(false);
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);
  useEffect(() => { runBacktest(); return () => cancelAnimationFrame(rafRef.current); }, [runBacktest]);

  const shown = animLen || 200;
  const prices = SEED_PRICES.slice(0, shown);
  const curve = SEED_CURVE.slice(0, shown);
  const signals = SEED_SIGNALS.slice(0, shown);
  const W = 700, H = 160;

  const finalReturn = ((SEED_CURVE[shown-1] - 10000) / 10000 * 100).toFixed(1);
  const bhReturn = ((SEED_PRICES[shown-1] - SEED_PRICES[0]) / SEED_PRICES[0] * 100).toFixed(1);

  const pricePath = sparkPath(prices, W, H);
  const curvePath = sparkPath(curve, W, H);
  const priceMin = Math.min(...prices), priceMax = Math.max(...prices);
  const sx = (i: number) => 10 + (i / (W-1)) * (W - 20);
  const sy = (v: number) => (H-10) - ((v-priceMin)/(priceMax-priceMin||1)) * (H-20);

  return (
    <div className="space-y-6">
      {/* stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Strategy Return', val:`+${finalReturn}%`, color:ACCENT },
          { label:'Buy & Hold', val:`+${bhReturn}%`, color:'#888' },
          { label:'Total Trades', val:`${SEED_TRADES.filter(t=>t.type==='buy').length}`, color:'#f3f3f3' },
          { label:'Portfolio Value', val:`$${(SEED_CURVE[shown-1]/1000).toFixed(1)}k`, color:ACCENT },
        ].map(s => (
          <div key={s.label} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
            <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-1">{s.label}</p>
            <p className="font-heading font-black text-2xl" style={{color:s.color}}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#555]"><span className="w-3 h-0.5 rounded" style={{backgroundColor:ACCENT}} />ML Strategy</span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#555]"><span className="w-3 h-0.5 bg-[#444] rounded" />Buy &amp; Hold</span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#555]"><span className="w-2 h-2 rounded-sm bg-[#3B82F6]" />Buy Signal</span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#555]"><span className="w-2 h-2 rounded-sm bg-[#EF4444]" />Sell Signal</span>
        </div>
        <button onClick={runBacktest} disabled={running}
          className="px-4 py-1.5 rounded-lg font-mono text-xs tracking-wider border transition-all disabled:opacity-40"
          style={{borderColor:ACCENT+'60',color:ACCENT}}>
          {running ? 'RUNNING…' : 'RUN BACKTEST'}
        </button>
      </div>

      {/* price chart */}
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
        <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-4">Price + Signals — SYNTH/USD</p>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {[0.25,0.5,0.75].map(v => <line key={v} x1={10} y1={sy(priceMin+(priceMax-priceMin)*v)} x2={W-10} y2={sy(priceMin+(priceMax-priceMin)*v)} stroke="#111" strokeWidth="1"/>)}
          <path d={pricePath} stroke="#444" strokeWidth="1.5" fill="none" />
          {signals.map((s, i) => s === 'buy' ? (
            <polygon key={i} points={`${sx(i)},${sy(prices[i])-4} ${sx(i)-4},${sy(prices[i])+4} ${sx(i)+4},${sy(prices[i])+4}`} fill="#3B82F6" opacity="0.9" />
          ) : s === 'sell' ? (
            <polygon key={i} points={`${sx(i)},${sy(prices[i])+4} ${sx(i)-4},${sy(prices[i])-4} ${sx(i)+4},${sy(prices[i])-4}`} fill="#EF4444" opacity="0.9" />
          ) : null)}
        </svg>
      </div>

      {/* equity curve */}
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
        <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-4">Equity Curve — Portfolio Value ($)</p>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {[0.25,0.5,0.75].map(v => {
            const curveMin=Math.min(...curve), curveMax=Math.max(...curve);
            const y2 = (H-10)-((v*(curveMax-curveMin))/(curveMax-curveMin||1))*(H-20);
            return <line key={v} x1={10} y1={y2} x2={W-10} y2={y2} stroke="#111" strokeWidth="1"/>;
          })}
          <path d={curvePath} stroke={ACCENT} strokeWidth="2" fill="none" />
          <path d={curvePath + ` L${10+(shown-1)/(W-1)*(W-20)+10},${H-10} L10,${H-10} Z`} fill={ACCENT} fillOpacity="0.06" />
        </svg>
      </div>
    </div>
  );
}

// ── Signals Tab ──────────────────────────────────────────────────────────────
function SignalsTab() {
  const wins = SEED_TRADES.filter(t => t.type==='sell' && (t.pnl||0) > 0);
  const losses = SEED_TRADES.filter(t => t.type==='sell' && (t.pnl||0) <= 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
          <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-4">ML Signal Features</p>
          <div className="space-y-3">
            {[
              { name:'20-day Momentum', w: 0.38 },
              { name:'Price vs MA-20', w: 0.27 },
              { name:'5-day RSI', w: 0.18 },
              { name:'Volume Spike', w: 0.11 },
              { name:'Bollinger Band %', w: 0.06 },
            ].map(f => (
              <div key={f.name} className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-[#555] w-36">{f.name}</span>
                <div className="flex-1 h-2 bg-[#111] rounded-full overflow-hidden">
                  <motion.div initial={{width:0}} animate={{width:`${f.w*100}%`}} transition={{duration:0.8}} className="h-full rounded-full" style={{backgroundColor:ACCENT,opacity:0.7}} />
                </div>
                <span className="font-mono text-[10px] w-8 text-right" style={{color:ACCENT}}>{(f.w*100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
          <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-4">Trade Breakdown</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {SEED_TRADES.filter(t=>t.type==='sell').map((t, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#111]">
                <span className="font-mono text-[10px] text-[#555]">Trade #{i+1} · Bar {t.i}</span>
                <span className="font-mono text-[11px]" style={{color:(t.pnl||0)>0?ACCENT:'#EF4444'}}>
                  {(t.pnl||0)>0?'+':''}{(t.pnl||0).toFixed(0)} USD
                </span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-[#111] rounded-lg p-3 text-center">
              <p className="font-mono text-[9px] text-[#444] mb-1">WINNERS</p>
              <p className="font-heading font-black text-lg" style={{color:ACCENT}}>{wins.length}</p>
            </div>
            <div className="bg-[#111] rounded-lg p-3 text-center">
              <p className="font-mono text-[9px] text-[#444] mb-1">LOSERS</p>
              <p className="font-heading font-black text-lg text-red-500">{losses.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Performance Tab ──────────────────────────────────────────────────────────
function PerformanceTab() {
  const sellTrades = SEED_TRADES.filter(t=>t.type==='sell');
  const winRate = sellTrades.length ? (sellTrades.filter(t=>(t.pnl||0)>0).length / sellTrades.length * 100).toFixed(1) : '0';
  const totalReturn = ((SEED_CURVE[199] - 10000) / 10000 * 100).toFixed(2);
  const drawdowns = SEED_CURVE.map((v, i, a) => { const peak = Math.max(...a.slice(0,i+1)); return (v-peak)/peak*100; });
  const maxDD = Math.min(...drawdowns).toFixed(2);

  const metrics = [
    { label:'Total Return', val:`+${totalReturn}%`, color:ACCENT },
    { label:'Sharpe Ratio', val:'1.84', color:ACCENT },
    { label:'Sortino Ratio', val:'2.31', color:ACCENT },
    { label:'Max Drawdown', val:`${maxDD}%`, color:'#EF4444' },
    { label:'Win Rate', val:`${winRate}%`, color:ACCENT },
    { label:'Profit Factor', val:'2.14', color:ACCENT },
    { label:'Avg Win', val:`+$${(sellTrades.filter(t=>(t.pnl||0)>0).reduce((a,t)=>a+(t.pnl||0),0) / (sellTrades.filter(t=>(t.pnl||0)>0).length||1)).toFixed(0)}`, color:ACCENT },
    { label:'Avg Loss', val:`-$${Math.abs(sellTrades.filter(t=>(t.pnl||0)<=0).reduce((a,t)=>a+(t.pnl||0),0) / (sellTrades.filter(t=>(t.pnl||0)<=0).length||1)).toFixed(0)}`, color:'#EF4444' },
  ];

  const ddPath = sparkPath(drawdowns, 700, 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
            <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-1">{m.label}</p>
            <p className="font-heading font-black text-xl" style={{color:m.color}}>{m.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
        <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-4">Drawdown Chart</p>
        <svg viewBox="0 0 700 100" className="w-full">
          <path d={ddPath} stroke="#EF4444" strokeWidth="1.5" fill="none" />
          <path d={ddPath + ' L690,90 L10,90 Z'} fill="#EF4444" fillOpacity="0.06" />
          <line x1="10" y1="50" x2="690" y2="50" stroke="#111" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-5">
        <p className="font-mono text-[10px] text-[#444] tracking-widest uppercase mb-3">Monthly Returns Heatmap (Simulated)</p>
        <div className="grid grid-cols-12 gap-1">
          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i) => {
            const r = (Math.random()*10-3);
            return (
              <div key={m} className="text-center">
                <p className="font-mono text-[8px] text-[#444] mb-1">{m}</p>
                <div className="rounded py-1.5" style={{backgroundColor: r>0?`rgba(34,197,94,${Math.min(r/10,1)*0.6})`:`rgba(239,68,68,${Math.min(-r/10,1)*0.6})`}}>
                  <p className="font-mono text-[9px]" style={{color:r>0?ACCENT:'#EF4444'}}>{r>0?'+':''}{r.toFixed(1)}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TradingPage() {
  const [active, setActive] = useState<Tab>('backtest');
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
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                </div>
                <span className="font-heading font-black text-frost text-lg tracking-tight">Alpha</span>
                <span className="font-heading font-black text-lg tracking-tight" style={{color:ACCENT}}>Engine</span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-1.5 border border-[#1a1a1a] rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{backgroundColor:ACCENT}} />
                <span className="font-mono text-[9px] text-[#444] tracking-widest">ML TRADING STRATEGY · SIM</span>
              </div>
            </div>
            <div className="flex items-center gap-1 pb-0">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActive(tab.id)}
                  className={`relative px-4 py-3 font-mono text-xs tracking-wider transition-colors ${active===tab.id?'text-frost':'text-[#444] hover:text-[#888]'}`}>
                  {tab.label}
                  {active===tab.id && <motion.div layoutId="trading-tab" className="absolute bottom-0 left-0 right-0 h-0.5" style={{backgroundColor:ACCENT}} transition={{type:'spring',stiffness:400,damping:30}} />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="font-heading font-black text-2xl md:text-4xl text-frost mb-2">Alpha Engine</h1>
            <p className="font-mono text-[11px] text-[#444] tracking-wider">MOMENTUM + MEAN-REVERSION ML STRATEGY · WALK-FORWARD BACKTEST · 200 BARS</p>
          </div>
          <AnimatePresence mode="wait">
            {active==='backtest' && <motion.div key="backtest" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.25}}><BacktestTab /></motion.div>}
            {active==='signals' && <motion.div key="signals" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.25}}><SignalsTab /></motion.div>}
            {active==='performance' && <motion.div key="performance" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.25}}><PerformanceTab /></motion.div>}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
