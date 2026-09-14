import Link from "next/link";
import { Magnetic } from "./Magnetic";
import { Reveal } from "./Reveal";

export function CtaBanner({
  kicker = "Start a project",
  title,
  copy,
  ctaLabel = "Start a project",
}: {
  kicker?: string;
  title: string;
  copy: string;
  ctaLabel?: string;
}) {
  return (
    <section className="cta-banner">
      <Reveal className="shell cta-banner-inner">
        <div>
          <p className="kicker kicker-light">{kicker}</p>
          <h2>{title}</h2>
          <p>{copy}</p>
        </div>
        <Magnetic>
          <Link className="button button-primary" href="/#contact">{ctaLabel} <span>↗</span></Link>
        </Magnetic>
      </Reveal>
    </section>
  );
}
