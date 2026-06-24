'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState, useCallback } from 'react';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@!&';

function useScramble(text: string, startDelay = 400) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    let iter = 0;
    const steps = 26;
    const t = setTimeout(() => {
      const id = setInterval(() => {
        setDisplay(
          text.split('').map((ch, i) => {
            if (ch === '\n' || ch === ' ') return ch;
            if (i < Math.floor(iter)) return ch;
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }).join('')
        );
        iter += text.length / steps;
        if (iter >= text.length) { setDisplay(text); clearInterval(id); }
      }, 36);
    }, startDelay);
    return () => clearTimeout(t);
  }, [text, startDelay]);
  return display;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  amber: boolean;
  pulse: number;
  pulseSpeed: number;
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const particles = useRef<Particle[]>([]);
  const rafId = useRef<number>(0);

  const initParticles = useCallback((w: number, h: number) => {
    const count = Math.floor((w * h) / 12000);
    particles.current = Array.from({ length: Math.min(count, 90) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      amber: Math.random() < 0.18,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.015 + Math.random() * 0.02,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    window.addEventListener('mousemove', onMove);

    const CONNECT_DIST = 140;
    const AMBER = '#e7c59a';
    const FROST = '#f3f3f3';

    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);

      const ps = particles.current;
      const mx = mouse.current.x;
      const my = mouse.current.y;

      // update positions
      for (const p of ps) {
        p.pulse += p.pulseSpeed;
        // mild mouse attraction/repulsion
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) {
          p.vx -= (dx / dist) * 0.012;
          p.vy -= (dy / dist) * 0.012;
        }
        // damping
        p.vx *= 0.98;
        p.vy *= 0.98;
        // clamp speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.2) { p.vx *= 1.2 / speed; p.vy *= 1.2 / speed; }

        p.x += p.vx;
        p.y += p.vy;

        // wrap
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      }

      // draw connections
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECT_DIST) {
            const alpha = (1 - d / CONNECT_DIST) * 0.25;
            const isAmber = ps[i].amber || ps[j].amber;
            ctx.beginPath();
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.strokeStyle = isAmber
              ? `rgba(231,197,154,${alpha * 0.7})`
              : `rgba(243,243,243,${alpha * 0.3})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // draw particles
      for (const p of ps) {
        const pulseFactor = 0.7 + 0.3 * Math.sin(p.pulse);
        const r = p.r * pulseFactor;
        if (p.amber) {
          // amber glow
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 8);
          grd.addColorStop(0, `rgba(231,197,154,${0.5 * pulseFactor})`);
          grd.addColorStop(1, 'rgba(231,197,154,0)');
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 8, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = AMBER;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(243,243,243,${0.25 * pulseFactor})`;
          ctx.fill();
        }
      }

      rafId.current = requestAnimationFrame(draw);
    };

    rafId.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, [initParticles]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />;
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const headline = useScramble('Mechatronics &\nRobotics Systems');

  return (
    <section ref={ref} id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Particle canvas background */}
      <motion.div style={{ y }} className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-canvas/0 via-canvas/0 to-canvas z-10" />
        <div className="w-full h-full opacity-80">
          <ParticleCanvas />
        </div>
      </motion.div>

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber/5 blur-[120px] pointer-events-none" />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-10 px-4 py-2 rounded-full border border-border/60 bg-surface/60 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] text-muted tracking-widest uppercase">Open to Opportunities · 2026</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="font-heading font-black text-[clamp(3rem,9vw,7.5rem)] leading-[0.92] tracking-tighter text-frost mb-8 whitespace-pre-line"
        >
          {headline.split('\n').map((line, i) => (
            <span key={i} className="block">
              {i === 1 ? (
                <>
                  <em className="not-italic text-amber">{line.split(' ')[0]}</em>
                  {' '}
                  <span>{line.split(' ').slice(1).join(' ')}</span>
                </>
              ) : line}
            </span>
          ))}
        </motion.h1>

        {/* Sub */}
        <motion.p variants={fadeUp} className="text-muted text-base md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
          Designing intelligent electromechanical systems at the intersection of robotics,
          embedded control, and AI-driven automation.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 flex-wrap">
          <a
            href="#work"
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border/80 bg-surface/50 backdrop-blur-sm text-frost text-sm font-medium hover:border-amber/40 hover:bg-amber/5 transition-all duration-300 cursor-pointer"
          >
            View Work
            <svg className="transition-transform duration-300 group-hover:translate-x-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a
            href="mailto:kirtansgradschemes@gmail.com"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-frost text-canvas text-sm font-semibold hover:bg-amber hover:text-canvas transition-all duration-300 cursor-pointer"
          >
            Get In Touch
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="section-label text-[10px]">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-8 bg-gradient-to-b from-amber/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}
