"use client";

import { useState, useRef, useCallback, useSyncExternalStore, type CSSProperties, type MouseEvent } from "react";
import Link from "next/link";
import type { Movie, NewsItem, Update } from "@/lib/mock-data";

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

export function SectionHeader({
  eyebrow,
  title,
  action,
  actionHref = "#discover",
}: {
  eyebrow: string;
  title: string;
  action?: string;
  actionHref?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="section-label">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {action && (
        <a className="text-link" href={actionHref}>
          {action}
          <span aria-hidden="true">↗</span>
        </a>
      )}
    </div>
  );
}

export function MovieCard({
  movie,
  index,
  compact = false,
}: {
  movie: Movie;
  index: number;
  compact?: boolean;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (prefersReducedMotion || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normX = (x / rect.width) * 2 - 1; // -1 to 1
      const normY = (y / rect.height) * 2 - 1; // -1 to 1

      // 3D Tilt calculation (max 10deg for subtle cinematic luxury)
      const maxRotate = compact ? 8 : 10;
      const rotateX = -normY * maxRotate;
      const rotateY = normX * maxRotate;

      // Glare position in percent
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;

      setTilt({ rotateX, rotateY, glareX, glareY, opacity: 0.35 });
    },
    [compact, prefersReducedMotion]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, opacity: 0 });
  };

  const path = movie.category === "Anime" ? "anime" : movie.category === "Shows" ? "shows" : "movies";

  const transformStyle = prefersReducedMotion
    ? undefined
    : isHovered
    ? `perspective(1000px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) translate3d(0, -6px, 12px) scale3d(1.025, 1.025, 1.025)`
    : `perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0) scale3d(1, 1, 1)`;

  return (
    <Link
      ref={cardRef}
      aria-label={`View details for ${movie.title}`}
      className={`movie-card movie-card--3d ${compact ? "movie-card--compact" : ""}`}
      href={`/${path}/${movie.slug}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={
        {
          "--card-accent": movie.accent || "#e2764b",
          "--delay": `${index * 70}ms`,
          transform: transformStyle,
          transition: isHovered
            ? "transform 0.12s cubic-bezier(0.2, 0, 0.38, 0.9)"
            : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        } as CSSProperties
      }
    >
      <div
        className="movie-card__image"
        style={{
          backgroundImage: `linear-gradient(180deg, transparent 35%, rgba(6, 8, 13, .92) 100%), url("${movie.image}")`,
        }}
      >
        {!prefersReducedMotion && (
          <div
            className="movie-card__glare"
            style={{
              background: `radial-gradient(circle 180px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, ${tilt.opacity}), transparent 80%)`,
            }}
          />
        )}
        {movie.badge && <span className="movie-card__badge">{movie.badge}</span>}
        {movie.rating && <span className="movie-card__rating">★ {movie.rating}</span>}
        <span className="movie-card__play" aria-hidden="true">+</span>
      </div>
      <div className="movie-card__info">
        <div>
          <h3>{movie.title}</h3>
          <p>{movie.genre}</p>
        </div>
        <span className="movie-card__year">{movie.releaseDate}</span>
      </div>
    </Link>
  );
}

export function ContentCard({ item }: { item: Update }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;
    setTilt({ rotateX: -normY * 6, rotateY: normX * 6 });
  };

  return (
    <Link
      ref={cardRef}
      aria-label={`Read: ${item.title}`}
      className="content-card content-card--3d"
      href={`/news/${item.slug}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setIsHovered(false);
        setTilt({ rotateX: 0, rotateY: 0 });
      }}
      style={{
        transform: isHovered
          ? `perspective(800px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) translateY(-4px)`
          : "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)",
        transition: isHovered ? "transform 0.12s ease-out" : "transform 0.4s ease-out",
      }}
    >
      <div className="content-card__image" style={{ backgroundImage: `url("${item.image}")` }} />
      <div className="content-card__copy">
        <span className="section-label">{item.category}</span>
        <h3>{item.title}</h3>
        <span className="content-card__read">
          {item.readTime}
          <span aria-hidden="true">↗</span>
        </span>
      </div>
    </Link>
  );
}

export function NewsCard({ item }: { item: NewsItem }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      aria-label={`Read news: ${item.title}`}
      className={`news-card ${isHovered ? "news-card--hovered" : ""}`}
      href={item.url ?? `/news/${item.slug}`}
      target={item.url ? "_blank" : undefined}
      rel={item.url ? "noreferrer" : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="news-card__image" style={{ backgroundImage: `url("${item.image}")` }} />
      <div className="news-card__copy">
        <span className="section-label">{item.category}</span>
        <h3>{item.title}</h3>
        <p className="news-card__excerpt">{item.excerpt ?? item.description}</p>
        <div className="news-card__meta">
          <span>{item.published}</span>
          <span>{item.source ?? "ANIMEXIA"}</span>
        </div>
      </div>
    </a>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="empty-state">
      <span className="section-label">ANIMEXIA archive</span>
      <p>No {label} to show yet.</p>
    </div>
  );
}

