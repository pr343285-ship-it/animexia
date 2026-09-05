"use client";

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";

const TOTAL_FRAMES = 300;

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

function getReducedMotionServerSnapshot() {
  return false;
}

function getFrameUrl(index: number) {
  const padded = String(index).padStart(3, "0");
  return `/frames/ezgif-frame-${padded}.jpg`;
}

export function HeroCanvasAnimation({
  containerRef,
}: {
  containerRef?: React.RefObject<HTMLElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const [loadPercent, setLoadPercent] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const animState = useRef({
    currentFrame: 0,
    targetFrame: 0,
    lastDrawnFrame: -1,
    rafId: 0,
    loadedCount: 0,
  });

  const drawCover = useCallback((ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number) => {
    if (!img.complete || img.naturalWidth === 0) return;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = width / height;

    let renderW: number;
    let renderH: number;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      renderW = width;
      renderH = width / imgRatio;
      offsetY = (height - renderH) / 2;
    } else {
      renderW = height * imgRatio;
      renderH = height;
      offsetX = (width - renderW) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  }, []);

  const renderFrame = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const clamped = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(frameIdx)));
    const img = framesRef.current[clamped];

    // If target frame not loaded, find nearest loaded frame
    let frameToDraw = img;
    if (!frameToDraw || !frameToDraw.complete || frameToDraw.naturalWidth === 0) {
      for (let offset = 1; offset < 20; offset++) {
        const prev = framesRef.current[clamped - offset];
        if (prev && prev.complete && prev.naturalWidth > 0) {
          frameToDraw = prev;
          break;
        }
        const next = framesRef.current[clamped + offset];
        if (next && next.complete && next.naturalWidth > 0) {
          frameToDraw = next;
          break;
        }
      }
    }

    if (frameToDraw && frameToDraw.complete && frameToDraw.naturalWidth > 0) {
      drawCover(ctx, frameToDraw, canvas.width, canvas.height);
      animState.current.lastDrawnFrame = clamped;
    }
  }, [drawCover]);

  // Canvas resize handler with high-DPI scaling
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    const rect = canvas.getBoundingClientRect();
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      renderFrame(animState.current.currentFrame);
    }
  }, [renderFrame]);

  // Progressive frame preloader
  useEffect(() => {
    let isCancelled = false;

    // First load frame 1 immediately as initial poster
    const posterImg = new Image();
    posterImg.src = getFrameUrl(1);
    posterImg.onload = () => {
      if (isCancelled) return;
      framesRef.current[0] = posterImg;
      animState.current.loadedCount++;
      setLoadPercent(1);
      setIsReady(true);
      handleResize();
      renderFrame(0);

      // Next, batch-load key frames then fill the rest
      const remainingIndices: number[] = [];
      for (let i = 2; i <= TOTAL_FRAMES; i++) {
        remainingIndices.push(i);
      }

      // Load in concurrent batches of 10 to avoid freezing network pipeline
      const BATCH_SIZE = 10;
      let currentIndex = 0;

      function loadNextBatch() {
        if (isCancelled || currentIndex >= remainingIndices.length) return;
        const batch = remainingIndices.slice(currentIndex, currentIndex + BATCH_SIZE);
        currentIndex += BATCH_SIZE;

        let batchCompleted = 0;
        batch.forEach((frameNum) => {
          const img = new Image();
          img.src = getFrameUrl(frameNum);
          img.onload = () => {
            if (isCancelled) return;
            framesRef.current[frameNum - 1] = img;
            animState.current.loadedCount++;
            batchCompleted++;
            if (animState.current.loadedCount % 15 === 0 || animState.current.loadedCount === TOTAL_FRAMES) {
              setLoadPercent(Math.round((animState.current.loadedCount / TOTAL_FRAMES) * 100));
            }
            if (batchCompleted === batch.length) {
              // Yield to main thread then start next batch
              if (typeof window !== "undefined" && "requestIdleCallback" in window) {
                (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(loadNextBatch);
              } else {
                setTimeout(loadNextBatch, 16);
              }
            }
          };
          img.onerror = () => {
            if (isCancelled) return;
            batchCompleted++;
            if (batchCompleted === batch.length) {
              setTimeout(loadNextBatch, 16);
            }
          };
        });
      }

      loadNextBatch();
    };

    posterImg.onerror = () => {
      if (isCancelled) return;
      setHasError(true);
    };

    return () => {
      isCancelled = true;
    };
  }, [handleResize, renderFrame]);

  // Window resize listener
  useEffect(() => {
    window.addEventListener("resize", handleResize, { passive: true });
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // Scroll position to frame mapping
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      const targetElement = containerRef?.current || document.body;
      const rect = targetElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Scroll progress from top of container to bottom of container
      const totalScrollable = Math.max(1, rect.height - viewportHeight);
      const scrolled = Math.max(0, -rect.top);
      const progress = Math.min(1, Math.max(0, scrolled / totalScrollable));

      animState.current.targetFrame = progress * (TOTAL_FRAMES - 1);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [containerRef, prefersReducedMotion]);

  // LERP render loop
  useEffect(() => {
    let active = true;
    let localRafId = 0;

    const loop = () => {
      if (!active) return;

      if (!prefersReducedMotion) {
        const diff = animState.current.targetFrame - animState.current.currentFrame;
        if (Math.abs(diff) > 0.001) {
          animState.current.currentFrame += diff * 0.14;
          renderFrame(animState.current.currentFrame);
        } else if (Math.round(animState.current.currentFrame) !== animState.current.lastDrawnFrame) {
          animState.current.currentFrame = animState.current.targetFrame;
          renderFrame(animState.current.currentFrame);
        }
      }

      localRafId = requestAnimationFrame(loop);
    };

    localRafId = requestAnimationFrame(loop);

    return () => {
      active = false;
      cancelAnimationFrame(localRafId);
    };
  }, [prefersReducedMotion, renderFrame]);

  return (
    <div className="hero-canvas-wrapper" aria-hidden="true">
      {/* Background ambient lighting */}
      <div className="hero-nebula-glow hero-nebula-glow--amber" />
      <div className="hero-nebula-glow hero-nebula-glow--crimson" />

      {/* Fallback poster if error */}
      {hasError ? (
        <div
          className="hero-canvas-fallback"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(8,10,15,0.7) 0%, rgba(8,10,15,0.95) 100%), url("/frames/ezgif-frame-001.jpg")`,
          }}
        />
      ) : (
        <canvas
          ref={canvasRef}
          className={`hero-canvas ${isReady ? "hero-canvas--ready" : ""}`}
        />
      )}

      {/* Cinematic vignette & color grading overlay */}
      <div className="hero-vignette" />

      {/* Subtle progressive loading bar */}
      {loadPercent < 100 && loadPercent > 0 && (
        <div className="hero-canvas-loader">
          <div className="hero-canvas-loader__bar" style={{ width: `${loadPercent}%` }} />
        </div>
      )}
    </div>
  );
}
