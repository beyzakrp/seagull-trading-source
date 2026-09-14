"use client";

import { FormEvent } from "react";
import { Magnetic } from "./Magnetic";
import { Reveal } from "./Reveal";

export function ContactForm() {
  function handleContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`New project enquiry — ${data.get("business") || "Seagull Trading"}`);
    const body = encodeURIComponent(
      `Name: ${data.get("name")}\nEmail: ${data.get("email")}\nBusiness: ${data.get("business")}\n\nProject:\n${data.get("message")}`,
    );
    window.location.href = `mailto:info@seagulltrade.me?subject=${subject}&body=${body}`;
  }

  return (
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
  );
}
