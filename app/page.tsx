"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { Cursor } from "./components/Cursor";
import { Magnetic } from "./components/Magnetic";
import { Marquee } from "./components/Marquee";
import { Reveal } from "./components/Reveal";

const tickerItems = [
  "Web Design & Development",
  "Brand Identity",
  "QR Menu Systems",
  "Digital Products",
  "Based in Montenegro",
];

const sectionIds = ["home", "services", "work", "qr-menu", "about", "contact"];

const services = [
  {
    number: "01",
    title: "Web design & development",
    copy: "Fast, distinctive websites built to turn local attention into bookings, enquiries and sales.",
    note: "Corporate sites · Landing pages · E-commerce",
  },
  {
    number: "02",
    title: "Brand identity",
    copy: "A clear visual system—from logo use and colors to the assets your business needs every day.",
    note: "Strategy · Visual identity · Brand guidelines",
  },
  {
    number: "03",
    title: "QR menu systems",
    copy: "Elegant, mobile-first menus that are easy to update and even easier for guests to use.",
    note: "Multilingual · Instant updates · No app needed",
  },
];

const projects = [
  {
    title: "Adriatic Table",
    category: "Website",
    type: "Hospitality website concept",
    className: "project-adriatic",
    metric: "Reservations first",
  },
  {
    title: "Casa Perla",
    category: "Branding",
    type: "Boutique stay identity concept",
    className: "project-perla",
    metric: "Warm coastal identity",
  },
  {
    title: "Mare Menu",
    category: "QR Menu",
    type: "Digital restaurant menu concept",
    className: "project-mare",
    metric: "Three languages",
  },
  {
    title: "Northline Tours",
    category: "Website",
    type: "Experience booking concept",
    className: "project-north",
    metric: "Mobile conversion",
  },
];

const menuContent: Record<string, Array<{ name: string; detail: string; price: string }>> = {
  Breakfast: [
    { name: "Adriatic Morning", detail: "Eggs, local cheese, tomato, olives", price: "€12" },
    { name: "Fig & Honey Bowl", detail: "Yoghurt, seasonal fruit, granola", price: "€8" },
    { name: "Boka Toast", detail: "Sourdough, avocado, herbs", price: "€9" },
  ],
  Mains: [
    { name: "Bay Catch", detail: "Daily fish, greens, lemon butter", price: "€24" },
    { name: "Njeguši Plate", detail: "Prosciutto, cheese, warm bread", price: "€16" },
    { name: "Garden Risotto", detail: "Seasonal vegetables, herbs", price: "€18" },
  ],
  Drinks: [
    { name: "Coastal Spritz", detail: "Citrus, herbs, sparkling wine", price: "€10" },
    { name: "Mountain Lemonade", detail: "Fresh lemon, mint, soda", price: "€6" },
    { name: "Local Selection", detail: "Ask for today’s Montenegrin wine", price: "€8" },
  ],
};

const productSuite = [
  ["Social media kits", "A consistent feed, editable post system and launch-ready campaign assets."],
  ["Digital catalogues", "Elegant, link-ready catalogues for products, property or professional services."],
  ["Booking funnels", "Focused pages that guide visitors from interest to an enquiry or reservation."],
  ["Menu & price lists", "Beautiful digital documents that stay easy to share and simple to update."],
  ["Email signatures", "Branded signatures and practical digital stationery for the whole team."],
  ["Campaign landing pages", "Fast, persuasive pages for seasonal offers, events and paid campaigns."],
];

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [projectFilter, setProjectFilter] = useState("All");
  const [menuCategory, setMenuCategory] = useState("Mains");
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const filteredProjects = projectFilter === "All"
    ? projects
    : projects.filter((project) => project.category === projectFilter);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  function handleContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`New project enquiry — ${data.get("business") || "Seagull Trading"}`);
    const body = encodeURIComponent(
      `Name: ${data.get("name")}\nEmail: ${data.get("email")}\nBusiness: ${data.get("business")}\n\nProject:\n${data.get("message")}`,
    );
    window.location.href = `mailto:hello@seagulltrade.me?subject=${subject}&body=${body}`;
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <main>
      <Cursor />
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="site-header-inner shell">
          <a className="brand" href="#home" aria-label="Seagull Trading home">
            <Image src="/seagull-blue-white.svg" alt="Seagull Trading" width={366} height={214} unoptimized priority />
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#services" className={activeSection === "services" ? "is-active" : ""}>Services</a>
            <a href="#work" className={activeSection === "work" ? "is-active" : ""}>Work</a>
            <a href="#qr-menu" className={activeSection === "qr-menu" ? "is-active" : ""}>QR Menu</a>
            <a href="#about" className={activeSection === "about" ? "is-active" : ""}>About</a>
          </nav>
          <Magnetic>
            <a className="header-cta" href="#contact">Let’s talk <span>↗</span></a>
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
            <a href="#services" onClick={closeMobile}>Services</a>
            <a href="#work" onClick={closeMobile}>Work</a>
            <a href="#qr-menu" onClick={closeMobile}>QR Menu</a>
            <a href="#about" onClick={closeMobile}>About</a>
            <a href="#contact" onClick={closeMobile}>Start a project</a>
          </div>
        </div>
      </header>

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
                <a className="button button-ghost" href="#work">Explore our work <span>↓</span></a>
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
        <a className="scroll-note" href="#services"><span>Scroll to explore</span><i>↓</i></a>
      </section>

      <Marquee items={tickerItems} />

      <section className="services-section" id="services">
        <Reveal className="shell section-heading">
          <div>
            <p className="kicker">What we do</p>
            <h2>Everything your business needs to look credible and sell online.</h2>
          </div>
          <p>One creative partner for your digital presence—from the first idea to the details customers remember.</p>
        </Reveal>
        <div className="shell service-grid">
          {services.map((service, index) => (
            <Reveal as="article" className="service-card" key={service.number} delay={index * 100}>
              <span className="service-number">{service.number}</span>
              <div className="service-icon" aria-hidden="true"><span /><i /></div>
              <h3>{service.title}</h3>
              <p>{service.copy}</p>
              <small>{service.note}</small>
              <a href="#contact" aria-label={`Learn about ${service.title}`}>Explore service <span>↗</span></a>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="work-section" id="work">
        <Reveal className="shell work-top">
          <div>
            <p className="kicker kicker-light">Selected concepts</p>
            <h2>Built to be remembered.<br />Designed to perform.</h2>
          </div>
          <div className="project-filters" aria-label="Filter work">
            {["All", "Website", "Branding", "QR Menu"].map((filter) => (
              <button
                key={filter}
                type="button"
                className={projectFilter === filter ? "active" : ""}
                aria-pressed={projectFilter === filter}
                onClick={() => setProjectFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="shell project-grid" aria-live="polite">
          {filteredProjects.map((project, index) => (
            <article
              className={`project-card ${project.className}`}
              key={project.title}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className="project-preview" aria-hidden="true">
                {project.category === "Website" && (
                  <div className="browser-mock">
                    <div className="browser-top"><i /><i /><i /></div>
                    <div className="browser-content">
                      <span>{project.title}</span>
                      <strong>{index === 0 ? "Taste the coast." : "Find your wild."}</strong>
                      <b>Explore →</b>
                    </div>
                  </div>
                )}
                {project.category === "Branding" && (
                  <div className="brand-mock"><i>CP</i><span>casa perla</span><b>stay slowly.</b></div>
                )}
                {project.category === "QR Menu" && (
                  <div className="menu-mock"><i>mare</i><span>DINNER MENU</span><b>Scan · Taste · Enjoy</b><em>⌁</em></div>
                )}
                <div className="concept-stamp">DEMO<br />CONCEPT</div>
              </div>
              <div className="project-meta">
                <div><span>{project.category}</span><h3>{project.title}</h3><p>{project.type}</p></div>
                <strong>{project.metric}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="qr-section" id="qr-menu">
        <div className="shell qr-grid">
          <Reveal className="qr-copy">
            <p className="kicker">A better menu experience</p>
            <h2>Your menu.<br /><em>Always current.</em></h2>
            <p>
              Turn a simple QR code into a fast, beautifully branded menu. Guests scan, browse in their language and decide—without downloading an app.
            </p>
            <ul>
              <li><span>01</span> Update prices and products without reprinting</li>
              <li><span>02</span> Serve international guests in multiple languages</li>
              <li><span>03</span> Keep your brand consistent from table to screen</li>
            </ul>
            <Magnetic>
              <a className="button button-dark" href="#contact">Build my QR menu <span>↗</span></a>
            </Magnetic>
          </Reveal>

          <Reveal as="div" className="phone-stage" delay={150}>
            <div className="qr-code-card" aria-hidden="true">
              <div className="mini-qr"><i /><i /><i /><span /></div>
              <b>Scan the demo</b>
              <small>No app required</small>
            </div>
            <div className="phone" aria-label="Interactive QR menu preview">
              <div className="phone-speaker" />
              <div className="phone-menu">
                <p>BAY HOUSE · KOTOR</p>
                <div className="phone-title"><span>MENU</span><b>☼</b></div>
                <div className="menu-tabs">
                  {Object.keys(menuContent).map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={menuCategory === category ? "active" : ""}
                      aria-pressed={menuCategory === category}
                      onClick={() => setMenuCategory(category)}
                    >{category}</button>
                  ))}
                </div>
                <div className="menu-items" aria-live="polite">
                  {menuContent[menuCategory].map((item) => (
                    <div className="menu-item" key={item.name}>
                      <div><strong>{item.name}</strong><small>{item.detail}</small></div>
                      <b>{item.price}</b>
                    </div>
                  ))}
                </div>
                <div className="menu-language"><span>EN</span><i>ME</i><i>TR</i></div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="products-section">
        <Reveal className="shell products-heading">
          <p className="kicker">And more</p>
          <h2>A complete digital shelf for your business.</h2>
          <p>Small products can create a big difference in how professional, consistent and easy to choose your business feels.</p>
        </Reveal>
        <div className="shell product-list">
          {productSuite.map(([title, copy], index) => (
            <Reveal as="article" key={title} delay={index * 70}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <a href="#contact" aria-label={`Ask about ${title}`}>↗</a>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="shell about-grid">
          <Reveal className="about-logo-panel">
            <Image src="/seagull-blue-white.svg" alt="Seagull Trading" width={366} height={214} unoptimized />
            <p>Creative direction from Montenegro, built for businesses that are ready to move.</p>
            <span>EST. 2026 · MONTENEGRO</span>
          </Reveal>
          <Reveal className="about-copy" delay={150}>
            <p className="kicker kicker-light">Why Seagull</p>
            <h2>Local enough to understand. Ambitious enough to go further.</h2>
            <p>
              Seagull Trading brings strategy, design and technology together. That means fewer suppliers, clearer decisions and a brand experience that feels connected at every touchpoint.
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
          {[
            ["01", "Discover", "We learn your business, audience and commercial goal."],
            ["02", "Define", "We shape the offer, content and clearest creative direction."],
            ["03", "Design & build", "You see progress early while the experience takes shape."],
            ["04", "Launch & grow", "We launch carefully and stay available for what comes next."],
          ].map(([number, title, copy], index) => (
            <Reveal as="article" key={number} delay={index * 90}>
              <span>{number}</span><i /><h3>{title}</h3><p>{copy}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="shell contact-grid">
          <Reveal className="contact-intro">
            <p className="kicker kicker-light">Start a project</p>
            <h2>Let’s make your business impossible to overlook.</h2>
            <p>Tell us what you are building, improving or launching. We’ll come back with a clear next step.</p>
            <a href="mailto:hello@seagulltrade.me">hello@seagulltrade.me <span>↗</span></a>
          </Reveal>
          <Reveal as="form" className="contact-form" onSubmit={handleContact} delay={150}>
            <label><span>Your name</span><input name="name" type="text" placeholder="Name & surname" required /></label>
            <label><span>Email address</span><input name="email" type="email" placeholder="you@company.com" required /></label>
            <label><span>Business / brand</span><input name="business" type="text" placeholder="Business name" /></label>
            <label className="full"><span>What do you need?</span><textarea name="message" placeholder="A new website, brand identity, QR menu..." rows={4} required /></label>
            <Magnetic>
              <button type="submit">Send project enquiry <span>↗</span></button>
            </Magnetic>
            <small>Submitting opens your email app with the project details ready to send.</small>
          </Reveal>
        </div>
      </section>

      <footer>
        <div className="shell footer-main">
          <a className="footer-logo" href="#home"><Image src="/seagull-blue-black.svg" alt="Seagull Trading" width={366} height={214} unoptimized /></a>
          <div><span>Explore</span><a href="#services">Services</a><a href="#work">Work</a><a href="#qr-menu">QR Menu</a></div>
          <div><span>Connect</span><a href="mailto:hello@seagulltrade.me">Email</a><a href="#contact">Project enquiry</a><a href="#home">Instagram</a></div>
          <div className="footer-note"><span>Based in Montenegro</span><p>Working with hospitality, retail, services and ambitious new brands.</p></div>
        </div>
        <div className="shell footer-bottom"><span>© 2026 Seagull Trading</span><span>Strategy · Design · Digital</span><a href="#home">Back to top ↑</a></div>
      </footer>
    </main>
  );
}
