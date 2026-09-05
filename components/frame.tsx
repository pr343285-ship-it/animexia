import Link from "next/link";
import { Navbar } from "./navbar";

export function Frame({ children, active = "" }: { children: React.ReactNode; active?: string }) {
  return (
    <>
      <Navbar active={active} />
      <main className="site-shell pt-24">{children}</main>
      <footer className="site-shell site-footer">
        <Link href="/" className="brand" aria-label="ANIMEXIA home">
          <span className="brand__mark">A</span>
          <span>
            ANIMEXIA<span className="brand__dot">.</span>
          </span>
        </Link>
        <span>Anime catalog powered by Jikan · News via The Guardian · © 2024 ANIMEXIA</span>
      </footer>
    </>
  );
}

