import Link from "next/link";

export function Frame({ children, active = "" }: { children: React.ReactNode; active?: string }) {
  const links = [["Discover", "/"], ["Movies", "/movies"], ["Shows", "/shows"], ["News", "/news"], ["Search", "/search"]];
  return <><header className="site-shell site-header"><Link href="/" className="brand"><span className="brand__mark">F</span><span>FRAME<span className="brand__dot">.</span></span></Link><nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">{links.map(([label, href]) => <Link key={href} className={`nav-link ${active === label ? "nav-link--active" : ""}`} href={href}>{label}</Link>)}</nav><Link href="/search" className="icon-button" aria-label="Search"><span aria-hidden="true">⌕</span></Link></header><main className="site-shell">{children}</main><footer className="site-shell site-footer"><Link href="/" className="brand"><span className="brand__mark">F</span><span>FRAME<span className="brand__dot">.</span></span></Link><span>Culture in motion.</span><span>© 2024 Frame Journal</span></footer></>;
}
