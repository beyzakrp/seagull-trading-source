import Link from "next/link";
import { ContactSection } from "../components/ContactSection";
import { Magnetic } from "../components/Magnetic";
import { Marquee } from "../components/Marquee";
import { Reveal } from "../components/Reveal";

const tickerItems = [
  "Web Design & Development",
  "Brand Identity",
  "QR Menu Systems",
  "Digital Products",
  "Based in Montenegro",
];

const overviewCards = [
  {
    number: "01",
    title: "Services",
    copy: "Web design, brand identity and QR menu systems—one creative partner from first idea to launch.",
    href: "/services",
    cta: "Explore services",
  },
  {
    number: "02",
    title: "Work",
    copy: "Selected concepts across hospitality, retail and travel—see how a brand becomes a live experience.",
    href: "/work",
    cta: "See our work",
  },
  {
    number: "03",
    title: "QR Menu",
    copy: "Turn a simple QR code into a fast, beautifully branded, multilingual menu guests actually enjoy.",
    href: "/qr-menu",
    cta: "View the QR menu",
  },
  {
    number: "04",
    title: "About",
    copy: "Local insight, ambitious standards and one point of contact—creative direction from Montenegro.",
    href: "/about",
    cta: "Meet the studio",
  },
];

export default function Home() {
  return (
    <>
      <section className="hero" id="home">
        <div className="hero-grid shell">
          <div className="hero-copy">
            <p className="eyebrow"><span /> Digital solutions for businesses in Montenegro</p>
            <h1>Your business deserves more than <em>just a website.</em></h1>
            <p className="hero-intro">
              We create strategic websites, memorable brands, QR menus and digital products that help ambitious businesses stand out and grow.
            </p>
            <div className="hero-actions">
              <Magnetic>
                <a className="button button-primary" href="#contact">Start a project <span>↗</span></a>
              </Magnetic>
              <Magnetic>
                <Link className="button button-ghost" href="/work">Explore our work <span>↓</span></Link>
              </Magnetic>
            </div>
            <div className="hero-proof" aria-label="Service qualities">
              <div><strong>Local insight</strong><span>Built for Montenegro</span></div>
              <div><strong>Clear process</strong><span>From idea to launch</span></div>
              <div><strong>Real support</strong><span>After launch, too</span></div>
            </div>
          </div>

          <div className="hero-visual" aria-label="Montenegro coastline">
            <div className="hero-image" />
            <div className="coast-card">
              <span>Based in</span>
              <strong>Montenegro</strong>
              <i>Strategy on land.<br />Ambition without borders.</i>
            </div>
            <div className="hero-mark" aria-hidden="true">ST</div>
          </div>
        </div>
        <a className="scroll-note" href="#explore"><span>Scroll to explore</span><i>↓</i></a>
      </section>

      <Marquee items={tickerItems} />

      <section className="overview-section" id="explore">
        <Reveal className="shell section-heading">
          <div>
            <p className="kicker">Explore Seagull Trading</p>
            <h2>Four ways we help your business grow.</h2>
          </div>
          <p>Dive into each part of what we do—services, selected concepts, our QR menu system and the studio behind it.</p>
        </Reveal>
        <div className="shell overview-grid">
          {overviewCards.map((card, index) => (
            <Reveal as="article" className="overview-card" key={card.href} delay={index * 90}>
              <span className="overview-number">{card.number}</span>
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
              <Link className="overview-link" href={card.href}>{card.cta} <span>↗</span></Link>
            </Reveal>
          ))}
        </div>
      </section>

      <ContactSection />
    </>
  );
}
