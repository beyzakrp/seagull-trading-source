import { ContactForm } from "./ContactForm";
import { Reveal } from "./Reveal";

export function ContactSection() {
  return (
    <section className="contact-section" id="contact">
      <div className="shell contact-grid">
        <Reveal className="contact-intro">
          <p className="kicker kicker-light">Start a project</p>
          <h2>Let’s make your business impossible to overlook.</h2>
          <p>Tell us what you are building, improving or launching. We’ll come back with a clear next step.</p>
          <a href="mailto:info@seagulltrade.me">info@seagulltrade.me <span>↗</span></a>
        </Reveal>
        <ContactForm />
      </div>
    </section>
  );
}
