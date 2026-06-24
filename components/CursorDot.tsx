'use client';
import { useEffect, useRef } from 'react';

export function CursorDot() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -200, y: -200 });
  const ringPos  = useRef({ x: -200, y: -200 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px';
        dotRef.current.style.top  = e.clientY + 'px';
      }
    };
    window.addEventListener('mousemove', onMove);

    let raf: number;
    const tick = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.1;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.1;
      if (ringRef.current) {
        ringRef.current.style.left = ringPos.current.x + 'px';
        ringRef.current.style.top  = ringPos.current.y + 'px';
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onEnter = () => document.body.classList.add('cursor-hovered');
    const onLeave = () => document.body.classList.remove('cursor-hovered');
    document.querySelectorAll('a, button, [data-hover]').forEach((el) => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="cursor-dot  fixed pointer-events-none z-[99999] -translate-x-1/2 -translate-y-1/2" />
      <div ref={ringRef} className="cursor-ring fixed pointer-events-none z-[99998] -translate-x-1/2 -translate-y-1/2" />
    </>
  );
}
