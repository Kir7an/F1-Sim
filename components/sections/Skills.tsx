'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const skillGroups = [
  {
    category: 'Software & CAD',
    tags: ['SolidWorks', 'Fusion 360', 'AutoCAD', 'MATLAB', 'Simulink', 'KiCAD', 'OrCAD', 'LabVIEW', 'Multisim', 'Robot Studio', 'Quartus'],
  },
  {
    category: 'Programming',
    tags: ['Python', 'C / C++', 'Java', 'Dart', 'OpenCV', 'Machine Learning', 'AI Development', 'Flask'],
  },
  {
    category: 'Robotics & Automation',
    tags: ['ROS', 'Predictive Maintenance', 'Control Systems', 'NDT', 'Localisation & Nav', 'Prototyping', '3D Printing'],
  },
  {
    category: 'Hardware & Electronics',
    tags: ['PCB Design', 'Arduino', 'Raspberry Pi', 'IoT Integration', 'ABB Programming', 'Power Systems', 'Fault Diagnosis'],
  },
  {
    category: 'Hands-on Experience',
    tags: ['Aircraft Engines', 'Automotive Systems', 'Electrical Fault Finding', 'Renewable Energy', 'Embedded Systems', 'Construction'],
  },
  {
    category: 'Project Management',
    tags: ['Jira', 'MS Project', 'Client Relations', 'Strategic Planning', 'Supplier Negotiations', 'Cross-functional Teams'],
  },
];

// Marquee track — duplicated for seamless loop
function MarqueeRow({ tags, reverse = false }: { tags: string[]; reverse?: boolean }) {
  const doubled = [...tags, ...tags];
  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex gap-3 w-max"
        animate={{ x: reverse ? ['0%', '50%'] : ['0%', '-50%'] }}
        transition={{ duration: 25, ease: 'linear', repeat: Infinity }}
      >
        {doubled.map((t, i) => (
          <span
            key={i}
            className="px-4 py-2 rounded-full border border-border bg-surface text-xs font-mono text-muted whitespace-nowrap hover:border-amber/40 hover:text-amber transition-colors duration-200 cursor-default"
          >
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

const allTags1 = skillGroups.slice(0, 3).flatMap((g) => g.tags);
const allTags2 = skillGroups.slice(3).flatMap((g) => g.tags);

export function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="skills" ref={ref} className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          className="section-label mb-4"
        >
          Skills & Abilities
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading font-bold text-3xl md:text-5xl text-frost mb-16 max-w-2xl leading-tight"
        >
          A broad toolkit spanning hardware, software, and systems thinking.
        </motion.h2>

        {/* Marquee rows */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-4 mb-20"
        >
          <MarqueeRow tags={allTags1} />
          <MarqueeRow tags={allTags2} reverse />
        </motion.div>

        {/* Grid breakdown */}
        <motion.div
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {skillGroups.map((g) => (
            <motion.div
              key={g.category}
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }}
              className="p-5 rounded-2xl border border-border bg-surface/50 backdrop-blur-sm"
            >
              <p className="font-mono text-[11px] tracking-widest uppercase text-amber mb-4">{g.category}</p>
              <div className="flex flex-wrap gap-2">
                {g.tags.map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-full bg-card border border-border text-xs font-mono text-muted">{t}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
