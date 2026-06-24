'use client';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const stats = [
  { value: 4, suffix: '+', label: 'Years engineering experience' },
  { value: 7, suffix: '',  label: 'Clients via Revvo' },
  { value: 5, suffix: '',  label: 'Major R&D projects' },
  { value: 37, suffix: '%', label: 'Business growth achieved' },
];

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const dur = 1600;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      setCount(Math.round(target * ease));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="about" ref={ref} className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="section-label mb-16"
        >
          About
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Stats */}
          <motion.div
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-2 gap-6"
          >
            {stats.map((s) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                className="p-6 rounded-2xl border border-border bg-surface/50 backdrop-blur-sm"
              >
                <div className="font-heading font-black text-4xl text-frost mb-2">
                  {inView ? <CountUp target={s.value} suffix={s.suffix} /> : `0${s.suffix}`}
                </div>
                <div className="text-muted text-sm leading-snug">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bio */}
          <motion.div
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
          >
            <motion.h2 variants={fadeUp} className="font-heading font-bold text-3xl md:text-4xl text-frost mb-6 leading-tight">
              Bridging mechanical precision with intelligent automation.
            </motion.h2>
            <motion.div variants={fadeUp} className="space-y-4 text-muted leading-relaxed">
              <p>Experienced in mechatronic system design, integration, and optimisation, with practical expertise in CAD modelling (Fusion 360, SolidWorks, AutoCAD), prototyping, simulation, and manufacturing process development.</p>
              <p>Skilled in designing and validating electromechanical systems, troubleshooting production equipment and embedded platforms, and applying data-driven methods to identify process losses, reduce cost, and improve efficiency, reliability, and safety.</p>
              <p>Currently completing a BEng in Mechatronics and Robotics Systems at the University of Liverpool, with a thesis on digital twins for predictive maintenance across microgrids and manufacturing plants.</p>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-8 flex gap-3 flex-wrap">
              {['ROS', 'Python', 'SolidWorks', 'KiCAD', 'MATLAB', 'Embedded C'].map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-full border border-border text-xs font-mono text-muted hover:border-amber/40 hover:text-amber transition-colors duration-200 cursor-default">
                  {tag}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
