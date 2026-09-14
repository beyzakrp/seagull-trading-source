"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Magnetic } from "./Magnetic";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/work", label: "Work" },
  { href: "/qr-menu", label: "QR Menu" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="site-header-inner shell">
        <Link className="brand" href="/" aria-label="Seagull Trading home">
          <Image src="/seagull-blue-white.svg" alt="Seagull Trading" width={366} height={214} unoptimized priority />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={pathname === link.href ? "is-active" : ""}>
              {link.label}
            </Link>
          ))}
        </nav>
        <Magnetic>
          <Link className="header-cta" href="/#contact">Let’s talk <span>↗</span></Link>
        </Magnetic>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span /><span />
          <b>{mobileOpen ? "Close" : "Menu"}</b>
        </button>
        <div className={`mobile-nav ${mobileOpen ? "is-open" : ""}`} id="mobile-navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={closeMobile}>
              {link.label}
            </Link>
          ))}
          <Link href="/#contact" onClick={closeMobile}>Start a project</Link>
        </div>
      </div>
    </header>
  );
}
