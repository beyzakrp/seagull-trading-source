"use client";

import { useState } from "react";

const projects = [
  {
    title: "Adriatic Table",
    category: "Website",
    type: "Hospitality website concept",
    className: "project-adriatic",
    metric: "Reservations first",
    approach: "A reservations-first layout that puts the booking action above the fold on every page, built around the restaurant's coastal story.",
  },
  {
    title: "Casa Perla",
    category: "Branding",
    type: "Boutique stay identity concept",
    className: "project-perla",
    metric: "Warm coastal identity",
    approach: "A warm, editorial identity—logo, palette and signage—designed to feel handmade rather than corporate, matching a small boutique stay.",
  },
  {
    title: "Mare Menu",
    category: "QR Menu",
    type: "Digital restaurant menu concept",
    className: "project-mare",
    metric: "Three languages",
    approach: "A three-language QR menu with same-day price updates, so the kitchen can change the daily catch without reprinting a thing.",
  },
  {
    title: "Northline Tours",
    category: "Website",
    type: "Experience booking concept",
    className: "project-north",
    metric: "Mobile conversion",
    approach: "A mobile-first booking flow built for travellers researching on their phones, from first search to confirmed spot on the tour.",
  },
];

const filters = ["All", "Website", "Branding", "QR Menu"];

export function WorkGrid() {
  const [projectFilter, setProjectFilter] = useState("All");

  const filteredProjects = projectFilter === "All"
    ? projects
    : projects.filter((project) => project.category === projectFilter);

  return (
    <>
      <div className="shell work-top">
        <div>
          <p className="kicker kicker-light">The concepts</p>
          <h2>Four projects.<br />Four different briefs.</h2>
        </div>
        <div className="project-filters" aria-label="Filter work">
          {filters.map((filter) => (
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
      </div>

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
                    <strong>{project.title === "Adriatic Table" ? "Taste the coast." : "Find your wild."}</strong>
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
              <div>
                <span>{project.category}</span>
                <h3>{project.title}</h3>
                <p>{project.type}</p>
                <p className="project-approach">{project.approach}</p>
              </div>
              <strong>{project.metric}</strong>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
