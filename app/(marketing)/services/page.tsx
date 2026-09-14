import type { Metadata } from "next";
import { CtaBanner } from "../../components/CtaBanner";
import { Reveal } from "../../components/Reveal";

export const metadata: Metadata = {
  title: "Services | Seagull Trading",
  description: "Web design & development, brand identity and QR menu systems for businesses in Montenegro—plus the smaller digital products that round out your presence.",
};

const serviceDetails = [
  {
    number: "01",
    title: "Web design & development",
    copy: "We design and build fast, distinctive websites—from a focused landing page to a full e-commerce storefront—engineered to turn local attention into bookings, enquiries and sales.",
    included: [
      "Custom design—never a generic template",
      "Mobile-first pages that load fast",
      "Booking, enquiry or checkout flows built in",
      "Content structure that reads and ranks well",
      "Basic analytics so you can see what's working",
    ],
    note: "Corporate sites · Landing pages · E-commerce",
  },
  {
    number: "02",
    title: "Brand identity",
    copy: "A clear visual system—from logo use and colors to the assets your business needs every day—so every touchpoint feels like the same business, wherever a customer meets it.",
    included: [
      "Logo, color palette and typography",
      "Brand guidelines you can hand to any printer or agency",
      "Business card, signage and social templates",
      "A consistent voice across web, print and social",
    ],
    note: "Strategy · Visual identity · Brand guidelines",
  },
  {
    number: "03",
    title: "QR menu systems",
    copy: "Elegant, mobile-first menus guests scan and browse in seconds—no app, no download, always up to date. Built to match your brand, not a generic template.",
    included: [
      "Multilingual menu (English · Montenegrin · Turkish by default)",
      "Instant price and product updates from one place",
      "Branded to match your existing identity",
      "Printed table cards and QR code included",
    ],
    note: "Multilingual · Instant updates · No app needed",
  },
];

const productSuite = [
  ["Social media kits", "A consistent feed, editable post system and launch-ready campaign assets."],
  ["Digital catalogues", "Elegant, link-ready catalogues for products, property or professional services."],
  ["Booking funnels", "Focused pages that guide visitors from interest to an enquiry or reservation."],
  ["Menu & price lists", "Beautiful digital documents that stay easy to share and simple to update."],
  ["Email signatures", "Branded signatures and practical digital stationery for the whole team."],
  ["Campaign landing pages", "Fast, persuasive pages for seasonal offers, events and paid campaigns."],
];

export default function ServicesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell page-hero-inner">
          <p className="kicker">What we do</p>
          <h1>Everything your business needs to look <em>credible</em> and sell online.</h1>
          <p className="page-hero-intro">
            One creative partner for your digital presence—from the first idea to the details customers remember. Below is exactly what's included in each service.
          </p>
        </div>
      </section>

      <section className="service-detail-section">
        <div className="shell service-detail-list">
          {serviceDetails.map((service, index) => (
            <Reveal as="article" className="service-detail" key={service.number} delay={index * 80}>
              <div className="service-detail-meta">
                <span className="service-number">{service.number}</span>
                <h2>{service.title}</h2>
                <p>{service.copy}</p>
                <small>{service.note}</small>
              </div>
              <ul className="included-list">
                {service.included.map((item) => (
                  <li key={item}><span>✓</span>{item}</li>
                ))}
              </ul>
            </Reveal>
          ))}
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
              <a href="/#contact" aria-label={`Ask about ${title}`}>↗</a>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBanner
        title="Not sure which service fits?"
        copy="Tell us what you're building and we'll recommend a clear starting point—no obligation."
        ctaLabel="Start a project"
      />
    </>
  );
}
