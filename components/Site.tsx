"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function Header(){const path=usePathname();return <header className="site-header"><Link className="wordmark" href="/">SHANNI JIN<span className="wordmark-dot">✳︎</span></Link><nav aria-label="Main navigation">{[["Field Notes","/field-notes"],["Images","/images"],["Practice","/#practice"],["Wall","/wall"],["About","/about"]].map(([label,url])=><Link key={label} href={url} aria-current={url!=="/#practice" && path.startsWith(url)?"page":undefined}>{label}</Link>)}</nav></header>}
export function Footer(){return <footer className="site-footer"><p>made slowly, updated whenever there is something worth keeping.</p><div><span>SHANNI JIN</span><span>© 2026</span><Link href="/about">a little about me ↗</Link></div></footer>}
