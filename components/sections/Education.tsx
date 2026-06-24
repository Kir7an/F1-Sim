'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const education = [
  {
    period: 'Sep 2022 — May 2026',
    grade: 'On-going',
    gradeColor: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
    degree: 'BEng Mechatronics & Robotics Systems',
    institution: 'University of Liverpool, United Kingdom',
    thesis: 'Digital twins on microgrids and manufacturing plants for predictive maintenance alongside asset management.',
  },
  {
    period: 'Aug 2019 — Sep 2021',
    grade: 'D*D*D*',
    gradeColor: 'text-amber border-amber/30 bg-amber/10',
    degree: 'Diploma in Electrical & Electronics Engineering',
    institution: 'SCLP Samaj School and College, Nairobi, Kenya',
    thesis: 'Developed a sun-tracking solar panel tracker achieving a 35–45% increase in energy efficiency versus traditional fixed panels.',
  },
];

const certifications = [
  { name: 'Complete Data Science, Machine Learning, DL & NLP Bootcamp', org: 'Innvotek · 2025', hrs: '100 hrs' },
  { name: 'Robot Operating Systems (ROS)', org: 'Innvotek · 2024–2025', hrs: '30 hrs' },
  { name: 'The Complete Flutter Development Bootcamp with Dart', org: 'Udemy · 2025', hrs: '30 hrs' },
  { name: 'Python for Data Science, AI & Development', org: 'IBM · 2024', hrs: '14 hrs' },
  { name: 'Developing AI Applications with Python and Flask', org: 'IBM · 2024', hrs: '14 hrs' },
  { name: 'Fusion 360 & OrCAD', org: 'Innvotek · 2024', hrs: '11 hrs' },
];

export function Education() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="education" ref={ref} className="py-32 px-6 bg-surface/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
          {/* Education */}
          <div>
            <motion.p initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} className="section-label mb-12">Education</motion.p>
            <div className="space-y-10">
              {education.map((e, i) => (
                <motion.div
                  key={e.degree}
                  initial={{ opacity: 0, y: 32 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="p-6 rounded-2xl border border-border bg-card"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[11px] text-muted">{e.period}</span>
                    <span className={`font-mono text-[11px] px-2.5 py-1 rounded-full border ${e.gradeColor}`}>{e.grade}</span>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-frost mb-1">{e.degree}</h3>
                  <p className="text-muted text-sm mb-4">{e.institution}</p>
                  <p className="text-muted/70 text-sm leading-relaxed">
                    <strong className="text-muted">Thesis —</strong> {e.thesis}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <motion.p initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.1 }} className="section-label mb-12">Certifications</motion.p>
            <motion.div
              initial="hidden"
              animate={inView ? 'show' : 'hidden'}
              variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
              className="space-y-0"
            >
              {certifications.map((c) => (
                <motion.div
                  key={c.name}
                  variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }}
                  className="flex items-start justify-between py-5 border-b border-border last:border-0 gap-4"
                >
                  <div>
                    <p className="text-frost text-sm font-medium mb-0.5">{c.name}</p>
                    <p className="font-mono text-[11px] text-muted">{c.org}</p>
                  </div>
                  <span className="font-mono text-[11px] text-amber border border-amber/20 bg-amber/5 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">{c.hrs}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
