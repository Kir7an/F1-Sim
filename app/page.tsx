'use client';
import { useScroll, useSpring, motion } from 'framer-motion';
import { CursorDot }  from '@/components/CursorDot';
import { Navbar }     from '@/components/Navbar';
import { Hero }       from '@/components/sections/Hero';
import { About }      from '@/components/sections/About';
import { Experience } from '@/components/sections/Experience';
import { Projects }   from '@/components/sections/Projects';
import { Skills }     from '@/components/sections/Skills';
import { Education }  from '@/components/sections/Education';
import { Contact }    from '@/components/sections/Contact';
import { Footer }     from '@/components/Footer';

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  return (
    <motion.div
      style={{ scaleX }}
      className="scroll-progress fixed top-0 left-0 right-0 h-[2px] z-[99997] origin-left"
    />
  );
}

export default function Home() {
  return (
    <>
      <CursorDot />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Education />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
