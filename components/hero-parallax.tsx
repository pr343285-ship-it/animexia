"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function HeroParallax({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const motion = useRef({ tx: 0, ty: 0, cx: 0, cy: 0 });
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = containerRef.current;
    if (!el) return;

    let rafId = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      motion.current.tx = Math.max(-1, Math.min(1, x));
      motion.current.ty = Math.max(-1, Math.min(1, y));
    };

    const handlePointerLeave = () => {
      motion.current.tx = 0;
      motion.current.ty = 0;
    };

    const update = () => {
      motion.current.cx += (motion.current.tx - motion.current.cx) * 0.08;
      motion.current.cy += (motion.current.ty - motion.current.cy) * 0.08;
      if (el) {
        el.style.setProperty("--mouse-px", motion.current.cx.toFixed(4));
        el.style.setProperty("--mouse-py", motion.current.cy.toFixed(4));
      }
      rafId = requestAnimationFrame(update);
    };

    el.addEventListener("pointermove", handlePointerMove, { passive: true });
    el.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    rafId = requestAnimationFrame(update);

    return () => {
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerleave", handlePointerLeave);
      cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  return (
    <div ref={containerRef} className={`hero-parallax-container ${className}`}>
      {children}
    </div>
  );
}
