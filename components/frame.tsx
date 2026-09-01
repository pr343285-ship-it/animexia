import Link from "next/link";

export function Frame({ children, active = "" }: { children: React.ReactNode; active?: string }) {
  const links = [["Home", "/"], ["Anime", "/anime"], ["Anime Movies", "/movies"], ["News", "/news"], ["Search", "/search"]];
  return <><header className="site-shell site-header"><Link href="/" className="brand" aria-label="ANIMEXIA home"><span className="brand__mark">A</span><span>ANIMEXIA<span className="brand__dot">.</span></span></Link><nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">{links.map(([label, href]) => <Link key={href} className={`nav-link ${active === label ? "nav-link--active" : ""}`} href={href}>{label}</Link>)}</nav><Link href="/search" className="icon-button" aria-label="Search ANIMEXIA"><span aria-hidden="true">⌕</span></Link></header><main className="site-shell">{children}</main><footer className="site-shell site-footer"><Link href="/" className="brand" aria-label="ANIMEXIA home"><span className="brand__mark">A</span><span>ANIMEXIA<span className="brand__dot">.</span></span></Link><span>Anime catalog powered by Jikan · News via The Guardian · © 2024 ANIMEXIA</span></footer></>;
}
