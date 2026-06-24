'use client';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

const links = [
  { href: '#work',       label: 'Work' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills',     label: 'Skills' },
  { href: '#contact',    label: 'Contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 60));

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between px-6 py-3 rounded-2xl border border-border/60 backdrop-blur-xl transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(10,10,10,0.92)' : 'rgba(10,10,10,0.6)',
        borderColor: scrolled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
      }}
    >
      <Link href="/" className="font-heading font-semibold text-sm text-frost tracking-tight cursor-pointer">
        Kirtan Samji
      </Link>

      <div className="hidden md:flex items-center gap-6">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="text-xs font-mono uppercase tracking-widest text-muted hover:text-frost transition-colors duration-200 cursor-pointer"
          >
            {l.label}
          </a>
        ))}
      </div>

      <Link
        href="/f1"
        className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full border border-[#E8002D]/40 text-[#E8002D] text-[10px] font-mono tracking-widest hover:bg-[#E8002D]/10 transition-all duration-200"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#E8002D] animate-pulse" />
        F1 LAB
      </Link>

      <a
        href="#contact"
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-frost text-canvas text-xs font-semibold hover:bg-amber-bright hover:text-canvas transition-all duration-200 cursor-pointer"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Get In Touch
      </a>
    </motion.nav>
  );
}
