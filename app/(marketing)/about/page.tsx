import type { Metadata } from "next";
import Image from "next/image";
import { CtaBanner } from "../../components/CtaBanner";
import { Reveal } from "../../components/Reveal";

export const metadata: Metadata = {
  title: "About | Seagull Trading",
  description: "Local enough to understand, ambitious enough to go further—the studio and process behind Seagull Trading.",
};

const principles = [
  {
    number: "01",
    title: "Local first",
    copy: "We know Montenegro's market, language mix and seasons—your site reflects that from day one, not as an afterthought.",
    note: "Market · Language · Season",
  },
  {
    number: "02",
    title: "Design that performs",
    copy: "Every choice serves a goal: more bookings, clearer branding, easier ordering. Nothing is decoration for its own sake.",
    note: "Bookings · Clarity · Conversion",
  },
  {
    number: "03",
    title: "One point of contact",
    copy: "Strategy, design and build come from the same team, so nothing gets lost between suppliers or handoffs.",
    note: "Strategy · Design · Build",
  },
];

const process = [
  ["01", "Discover", "We learn your business, audience and commercial goal."],
  ["02", "Define", "We shape the offer, content and clearest creative direction."],
  ["03", "Design & build", "You see progress early while the experience takes shape."],
  ["04", "Launch & grow", "We launch carefully and stay available for what comes next."],
];

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell page-hero-inner">
          <p className="kicker">Why Seagull</p>
          <h1>Local enough to understand.<br /><em>Ambitious enough to go further.</em></h1>
          <p className="page-hero-intro">
            Seagull Trading brings strategy, design and technology together. That means fewer suppliers, clearer decisions and a brand experience that feels connected at every touchpoint.
          </p>
        </div>
      </section>

      <section className="services-section">
        <div className="shell service-grid">
          {principles.map((item, index) => (
            <Reveal as="article" className="service-card" key={item.number} delay={index * 100}>
              <span className="service-number">{item.number}</span>
              <div className="service-icon" aria-hidden="true"><span /><i /></div>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
              <small>{item.note}</small>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="about-section">
        <div className="shell about-grid">
          <Reveal className="about-logo-panel">
            <Image src="/seagull-blue-white.svg" alt="Seagull Trading" width={366} height={214} unoptimized />
            <p>Creative direction from Montenegro, built for businesses that are ready to move.</p>
            <span>EST. 2026 · MONTENEGRO</span>
          </Reveal>
          <Reveal className="about-copy" delay={150}>
            <p className="kicker kicker-light">The studio</p>
            <h2>One team, from first sketch to launch day.</h2>
            <p>
              We're a small, focused studio rather than a large agency—which means the people who plan your project are the same people who design and build it. Fewer handoffs, faster decisions, and one voice on every call.
            </p>
            <div className="about-stats">
              <div><strong>01</strong><span>One point of contact</span></div>
              <div><strong>360°</strong><span>Digital brand thinking</span></div>
              <div><strong>EN · ME · TR</strong><span>Multilingual delivery</span></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="process-section">
        <Reveal className="shell process-heading">
          <p className="kicker">How we work</p>
          <h2>Simple, transparent and built around momentum.</h2>
        </Reveal>
        <div className="shell process-grid">
          {process.map(([number, title, copy], index) => (
            <Reveal as="article" key={number} delay={index * 90}>
              <span>{number}</span><i /><h3>{title}</h3><p>{copy}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBanner
        title="Curious if we're the right fit?"
        copy="A short conversation is usually enough to know. Tell us about your business and where it's headed."
        ctaLabel="Say hello"
      />
    </>
  );
}
