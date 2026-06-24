'use client';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Spotlight } from '@/components/ui/spotlight';

const projects = [
  {
    id: 'f1',
    badge: 'Live Project · OpenF1 API',
    title: 'F1 Strategy Command',
    description: 'Real-time F1 race strategy simulation platform with 3D strategy visualisation, live OpenF1 championship data, tire degradation modelling, and a 20-car race simulator where you tune your own car setup against AI opponents.',
    tags: ['Next.js 15', 'Three.js', 'React Three Fiber', 'OpenF1 API', 'TypeScript'],
    image: '/images/digital-twin.png',
    accent: '#E8002D',
    featured: true,
    group: 'hero',
    link: '/f1',
  },
  {
    id: 'grid',
    badge: 'Live Simulation · Energy Systems',
    title: 'Grid Commander',
    description: 'Professional microgrid energy management dashboard with live power flow animation, solar/battery/load balancing simulation, SCADA-style fault injection, and 24-hour analytics — directly from BEng thesis research.',
    tags: ['Next.js 15', 'SVG Animation', 'TypeScript', 'SCADA', 'Energy Systems'],
    image: '/images/digital-twin.png',
    accent: '#00D084',
    featured: true,
    group: 'energy',
    link: '/grid',
  },
  {
    id: 'bms',
    badge: 'Live Simulation · Electrical Engineering',
    title: 'BMS Lab',
    description: 'Battery management system dashboard with 24-cell live pack visualisation, thermal heatmapping, degradation modelling across 2000 cycles, and state-of-health prediction for lithium-ion battery systems.',
    tags: ['Next.js 15', 'SVG', 'TypeScript', 'Electrochemistry', 'BMS'],
    image: '/images/pcb.png',
    accent: '#3B82F6',
    featured: true,
    group: 'energy',
    link: '/bms',
  },
  {
    id: 'solarapp',
    badge: 'Live Simulation · Solar Engineering',
    title: 'Solar Command',
    description: 'Dual-axis solar tracking platform with real-time sun position computation, animated sky-dome path diagram, energy yield comparison across global locations, and temperature derate performance analysis.',
    tags: ['Next.js 15', 'SVG', 'TypeScript', 'Solar Engineering', 'Photovoltaics'],
    image: '/images/pcb.png',
    accent: '#F59E0B',
    featured: true,
    group: 'energy',
    link: '/solar',
  },
  {
    id: 'uwild',
    badge: 'IUK · Canada Ocean Super Cluster',
    title: 'Amphibian UWILD',
    description: 'Underwater Inspection in Lieu of Dry-Docking. Led as Project Manager — ROV design customisation, client communications, strategic planning, and supplier negotiations for offshore inspection operations.',
    tags: ['ROS', 'SolidWorks', 'KiCAD', 'ROV Systems', 'Control Systems'],
    image: '/images/robot-arm.png',
    accent: '#e7c59a',
    featured: true,
    group: 'main',
  },
  {
    id: 'twin',
    badge: 'BEng Thesis · On-going',
    title: 'Digital Twin — Microgrid & Manufacturing',
    description: 'Developing digital twins for microgrids and manufacturing plants to enable predictive maintenance and intelligent asset management. Real-time simulation for proactive fault detection.',
    tags: ['MATLAB', 'Simulink', 'Python', 'IoT', 'Digital Twins'],
    image: '/images/digital-twin.png',
    accent: '#6b9fd4',
    featured: true,
    group: 'main',
  },
  {
    id: 'solar',
    badge: 'Final Year Project · D*D*D*',
    title: 'Sun-Tracking Solar Panel Tracker',
    description: 'Autonomous solar tracking system achieving 35–45% increase in energy efficiency vs fixed panels. Designed embedded control, mechanical actuation, and sensor fusion for real-time sun-angle tracking.',
    tags: ['Embedded C', 'Arduino', 'Servo Control', 'PCB Design', 'CAD'],
    image: '/images/pcb.png',
    accent: '#f0c060',
    featured: false,
    group: 'rest',
  },
  {
    id: 'irad',
    badge: 'Innvotek · IUK · On-going',
    title: 'IRAD & DEMA2C',
    description: 'Active R&D projects at Innvotek exploring intelligent automation and defence-adjacent systems. Contributed to robotics hardware design, embedded systems integration, and automated failure analysis.',
    tags: ['Python', 'ROS', 'Fusion 360', 'Predictive Maintenance'],
    image: '/images/robot-arm.png',
    accent: '#8b7cf6',
    featured: false,
    group: 'rest',
  },
];

type Project = {
  id: string; badge: string; title: string; description: string;
  tags: string[]; image: string; accent: string; featured: boolean; group: string; link?: string;
};

function FeaturedCardInner({ p }: { p: Project }) {
  return (
    <div className="relative h-full rounded-2xl border overflow-hidden group cursor-pointer transition-all duration-300"
      style={{ borderColor: p.accent + '30', backgroundColor: '#0d0d0d' }}
    >
      <Spotlight size={300} />
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 z-10" style={{ background: `linear-gradient(to bottom, ${p.accent}18, #0d0d0d)` }} />
        <Image
          src={p.image}
          alt={p.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 saturate-[0.3] brightness-50 group-hover:brightness-60"
        />
        {p.id === 'f1' && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-[#E8002D]/90 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="font-mono text-[9px] text-white tracking-widest">LIVE DATA</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <span className="font-mono text-[10px] tracking-widest uppercase text-muted border border-border px-2 py-1 rounded-md">{p.badge}</span>
          {p.link && (
            <span className="font-mono text-[10px] text-[#444] tracking-wider flex items-center gap-1">
              EXPLORE
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          )}
        </div>
        <h3 className="font-heading font-bold text-xl text-frost mb-3" style={{ color: p.id === 'f1' ? '#f5f5f5' : undefined }}>{p.title}</h3>
        <p className="text-muted text-sm leading-relaxed mb-5">{p.description}</p>
        <div className="flex flex-wrap gap-2">
          {p.tags.map((t) => (
            <span key={t} className="px-2.5 py-1 rounded-full text-[11px] font-mono border text-muted"
              style={{ borderColor: p.accent + '30' }}
            >{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) / r.width);
    y.set((e.clientY - r.top - r.height / 2) / r.height);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

export function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const heroProject = projects.find(p => p.group === 'hero')!;
  const energyProjects = projects.filter(p => p.group === 'energy');
  const mainFeatured  = projects.filter(p => p.group === 'main');
  const rest          = projects.filter(p => p.group === 'rest');

  return (
    <section id="work" ref={ref} className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          className="section-label mb-4"
        >
          Projects
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading font-bold text-3xl md:text-5xl text-frost mb-16 max-w-2xl leading-tight"
        >
          Selected work spanning robotics, energy systems, and intelligent automation.
        </motion.h2>

        {/* Hero F1 project — full width */}
        <motion.div
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={{ show: { transition: { staggerChildren: 0.15 } } }}
          className="mb-6"
        >
          <motion.div variants={fadeUp}>
            <TiltCard>
              <Link href={heroProject.link!} className="block">
                <FeaturedCardInner p={heroProject} />
              </Link>
            </TiltCard>
          </motion.div>
        </motion.div>

        {/* Energy / Electrical — 3-col live dashboard projects */}
        <motion.div className="mb-3">
          <motion.p
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.25 }}
            className="font-mono text-[9px] tracking-widest uppercase text-[#444] mb-4"
          >
            Energy &amp; Electrical Systems
          </motion.p>
        </motion.div>
        <motion.div
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          {energyProjects.map((p) => (
            <motion.div key={p.id} variants={fadeUp}>
              <TiltCard className="h-full">
                {p.link ? (
                  <Link href={p.link} className="block h-full">
                    <FeaturedCardInner p={p} />
                  </Link>
                ) : (
                  <FeaturedCardInner p={p} />
                )}
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Main featured — 2-col */}
        <motion.div
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={{ show: { transition: { staggerChildren: 0.15, delayChildren: 0.15 } } }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
        >
          {mainFeatured.map((p) => (
            <motion.div key={p.id} variants={fadeUp}>
              <TiltCard className="h-full">
                {p.link ? (
                  <Link href={p.link} className="block h-full">
                    <FeaturedCardInner p={p} />
                  </Link>
                ) : (
                  <FeaturedCardInner p={p} />
                )}
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Rest — smaller cards */}
        <motion.div
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {rest.map((p) => (
            <motion.div
              key={p.id}
              variants={fadeUp}
              className="relative p-6 rounded-2xl border border-border bg-card hover:border-amber/20 transition-all duration-300 group cursor-pointer card-hover"
            >
              <Spotlight size={200} />
              <div className="flex items-start justify-between mb-4">
                <span className="font-mono text-[10px] tracking-widest uppercase text-muted border border-border px-2 py-1 rounded-md">{p.badge}</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-frost mb-3">{p.title}</h3>
              <p className="text-muted text-sm leading-relaxed mb-5">{p.description}</p>
              <div className="flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-full text-[11px] font-mono border border-border text-muted">{t}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
