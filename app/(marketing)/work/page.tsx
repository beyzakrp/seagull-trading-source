import type { Metadata } from "next";
import { CtaBanner } from "../../components/CtaBanner";
import { WorkGrid } from "../../components/WorkGrid";

export const metadata: Metadata = {
  title: "Work | Seagull Trading",
  description: "Selected concepts across hospitality, retail and travel—see how Seagull Trading turns a brand into a live website, identity or QR menu.",
};

export default function WorkPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell page-hero-inner">
          <p className="kicker">Selected concepts</p>
          <h1>Built to be remembered.<br /><em>Designed to perform.</em></h1>
          <p className="page-hero-intro">
            A look at how we approach each project—the thinking behind the design, not just the finished screen. Filter by type to see how our process changes with the brief.
          </p>
        </div>
      </section>

      <section className="work-section">
        <WorkGrid />
      </section>

      <CtaBanner
        title="See something close to your brief?"
        copy="Every project starts the same way—a short conversation about what you're trying to achieve."
        ctaLabel="Start a project"
      />
    </>
  );
}
