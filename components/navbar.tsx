"use client";

import { useState } from "react";
import Link from "next/link";

interface NavbarProps {
  active?: string;
}

export function Navbar({ active = "" }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { label: "Home", href: "/" },
    { label: "Trending", href: "/#trending" },
    { label: "Anime", href: "/anime" },
    { label: "Movies", href: "/movies" },
    { label: "News", href: "/news" },
  ];

  return (
    <header className="glass-navbar-wrapper">
      <div className="glass-navbar">
        {/* Brand */}
        <Link href="/" className="brand" aria-label="ANIMEXIA home">
          <span className="brand__mark">A</span>
          <span className="brand__name">
            ANIMEXIA<span className="brand__dot">.</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {links.map((link) => {
            const isActive = active === link.label || (link.href === "/" && active === "Home");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`glass-nav-link ${isActive ? "glass-nav-link--active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions (Search, Sign In / Join, Mobile Toggle) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/search" className="glass-icon-btn" aria-label="Search anime">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 5 5" />
            </svg>
          </Link>

          {/* Glassmorphic Sign In link */}
          <Link href="/login" className="glass-signin-btn">
            <span className="glass-signin-btn__text">Sign In</span>
          </Link>

          {/* Mobile menu trigger */}
          <button
            type="button"
            className="glass-icon-btn md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav className="glass-mobile-menu md:hidden" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="glass-mobile-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="glass-mobile-link glass-mobile-link--accent"
            onClick={() => setMobileMenuOpen(false)}
          >
            Sign In / Join
          </Link>
        </nav>
      )}
    </header>
  );
}
