'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const roles = [
  {
    date: 'Jul 2024 — Apr 2026',
    company: 'Innvotek Ltd',
    location: 'Birmingham, UK',
    role: 'Mechatronics Engineer',
    points: [
      'Contributed to Robotics R&D with hands-on experience in ROS, SolidWorks, Fusion 360, and KiCAD electronics design',
      'Served as Project Manager for the Amphibian UWILD project — managing client communications, strategic planning, supplier negotiations, and ROV design customisation',
      'Conducted automated failure analysis and reliability testing for offshore energy systems, improving operational resilience',
      'Created and fine-tuned control algorithms for marine energy platforms, enabling autonomous operation and adaptive performance',
      'Contributed to AI-driven smart grid initiatives, applying data-driven approaches to improve energy efficiency and predictive capabilities',
    ],
  },
  {
    date: 'Jun 2025 — Present',
    company: 'Revvo',
    location: 'Nairobi, Kenya',
    role: 'Founder',
    points: [
      'Provide strategic leadership across all projects, ensuring quality, creativity, and measurable client impact',
      'Spearhead website revamps, corporate rebranding, and marketing campaigns with a growing focus on AI-driven solutions',
      'Managed operations, accounts, and client relationships, achieving 37% business growth across 7 clients',
    ],
  },
  {
    date: 'Sep 2021 — May 2022',
    company: 'Master Power Systems Ltd',
    location: 'Nairobi, Kenya',
    role: 'Electrical Engineer',
    points: [
      'Collaborated with Kenya Power and Lighting Company (KPLC) to learn building power supply methods using busbars and three-phase connections',
      'Worked with multidisciplinary teams of 4 engineers, contributing to 3 innovative project outcomes',
      'Enhanced technical drafting by preparing layout drawings for electrical and electronic equipment',
    ],
  },
  {
    date: 'Jul 2022 — Aug 2022',
    company: 'ALS Ltd',
    location: 'Nairobi, Kenya',
    role: 'Aeronautical & Avionics Intern',
    points: [
      'Applied mechanical and electrical engineering principles in diagnosing and resolving aircraft engine and system issues',
      'Performed servicing and maintenance on Pratt & Whitney aircraft engines, ensuring compliance with aviation standards',
      'Coordinated in troubleshooting and servicing aircraft electronic systems to support safe and reliable operations',
    ],
  },
];

export function Experience() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="experience" ref={ref} className="py-32 px-6 bg-surface/30">
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          className="section-label mb-16"
        >
          Experience
        </motion.p>

        <div className="space-y-0">
          {roles.map((r, i) => (
            <motion.div
              key={r.company}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 py-12 border-b border-border last:border-0"
            >
              <div>
                <div className="font-mono text-[11px] text-muted mb-1">{r.date}</div>
                <div className="font-heading font-semibold text-sm text-frost">{r.company}</div>
                <div className="font-mono text-[11px] text-muted/60">{r.location}</div>
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl text-frost mb-4">{r.role}</h3>
                <ul className="space-y-2">
                  {r.points.map((pt, j) => (
                    <li key={j} className="flex gap-3 text-muted text-sm leading-relaxed">
                      <span className="mt-2 w-1 h-1 rounded-full bg-amber flex-shrink-0" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
