import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer>
      <div className="shell footer-main">
        <Link className="footer-logo" href="/">
          <Image src="/seagull-blue-black.svg" alt="Seagull Trading" width={366} height={214} unoptimized />
        </Link>
        <div>
          <span>Explore</span>
          <Link href="/services">Services</Link>
          <Link href="/work">Work</Link>
          <Link href="/qr-menu">QR Menu</Link>
          <Link href="/about">About</Link>
        </div>
        <div>
          <span>Connect</span>
          <a href="mailto:info@seagulltrade.me">Email</a>
          <Link href="/#contact">Project enquiry</Link>
          <Link href="/">Instagram</Link>
        </div>
        <div className="footer-note">
          <span>Based in Montenegro</span>
          <p>Working with hospitality, retail, services and ambitious new brands.</p>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 Seagull Trading</span>
        <span>Strategy · Design · Digital</span>
        <Link href="/">Back to top ↑</Link>
      </div>
    </footer>
  );
}
