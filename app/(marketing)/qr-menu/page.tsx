import type { Metadata } from "next";
import { CtaBanner } from "../../components/CtaBanner";
import { Magnetic } from "../../components/Magnetic";
import { PhoneMenu } from "../../components/PhoneMenu";
import { Reveal } from "../../components/Reveal";

export const metadata: Metadata = {
  title: "QR Menu | Seagull Trading",
  description: "Turn a simple QR code into a fast, beautifully branded, multilingual menu—no app, no download, always current.",
};

const steps = [
  ["01", "We design your menu", "Matched to your brand and translated into the languages your guests actually speak."],
  ["02", "You get a QR code", "Printed table cards or stickers, ready to place—no extra hardware, no subscriptions to set up."],
  ["03", "Guests scan and order", "The menu opens instantly in their phone's browser. No app, no download, no waiting."],
  ["04", "You update anytime", "Change a price or swap a dish yourself, live in seconds—no reprinting, no waiting on us."],
];

const faqs = [
  ["Do guests need to download an app?", "No. The menu opens directly in their phone's browser the moment they scan the code."],
  ["Can I update prices myself?", "Yes—changes you make go live immediately, with no reprinting and no waiting on us."],
  ["How many languages can the menu support?", "As many as you need. We build in English, Montenegrin and Turkish by default and can add more."],
  ["What if I already have a logo and colors?", "We match your existing brand exactly—no redesign required, just a new digital menu that looks like you."],
];

export default function QrMenuPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell page-hero-inner">
          <p className="kicker">A better menu experience</p>
          <h1>Your menu.<br /><em>Always current.</em></h1>
          <p className="page-hero-intro">
            Turn a simple QR code into a fast, beautifully branded menu. Guests scan, browse in their language and decide—without downloading an app.
          </p>
        </div>
      </section>

      <section className="qr-section">
        <div className="shell qr-grid">
          <Reveal className="qr-copy">
            <p className="kicker">Why it works</p>
            <h2>Three languages.<br /><em>Zero reprinting.</em></h2>
            <ul>
              <li><span>01</span> Update prices and products without reprinting</li>
              <li><span>02</span> Serve international guests in multiple languages</li>
              <li><span>03</span> Keep your brand consistent from table to screen</li>
            </ul>
            <Magnetic>
              <a className="button button-dark" href="/#contact">Build my QR menu <span>↗</span></a>
            </Magnetic>
          </Reveal>

          <Reveal as="div" className="phone-stage" delay={150}>
            <div className="qr-code-card" aria-hidden="true">
              <div className="mini-qr"><i /><i /><i /><span /></div>
              <b>Scan the demo</b>
              <small>No app required</small>
            </div>
            <PhoneMenu />
          </Reveal>
        </div>
      </section>

      <section className="process-section">
        <Reveal className="shell process-heading">
          <p className="kicker">How it works</p>
          <h2>From first scan to first order, in four steps.</h2>
        </Reveal>
        <div className="shell process-grid">
          {steps.map(([number, title, copy], index) => (
            <Reveal as="article" key={number} delay={index * 90}>
              <span>{number}</span><i /><h3>{title}</h3><p>{copy}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="faq-section">
        <Reveal className="shell faq-heading">
          <p className="kicker">Questions</p>
          <h2>What businesses usually ask us.</h2>
        </Reveal>
        <div className="shell faq-list">
          {faqs.map(([question, answer], index) => (
            <Reveal as="details" className="faq-item" key={question} delay={index * 60}>
              <summary>{question}<span>+</span></summary>
              <p>{answer}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBanner
        title="Ready for a menu that keeps up with you?"
        copy="Send us your current menu and we'll show you what it looks like as a QR experience."
        ctaLabel="Build my QR menu"
      />
    </>
  );
}
