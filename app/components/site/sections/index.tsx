import type { Experience as Exp, Project, Section, Skill } from "~/lib/types";
import { Hero } from "./Hero";
import { About } from "./About";
import { Projects } from "./Projects";
import { Experience } from "./Experience";
import { Skills } from "./Skills";
import { Gallery } from "./Gallery";
import { Marquee } from "./Marquee";
import { Stats } from "./Stats";
import { Quotes } from "./Quotes";
import { Text } from "./Text";
import { Contact } from "./Contact";

export interface SectionData {
  projects: Project[];
  experiences: Exp[];
  skills: Skill[];
}

/** Renders a section by type. Adding a new section type = add a component here + a spec in lib/sections.ts. */
export function SectionRenderer({ section, index, data }: { section: Section; index: number; data: SectionData }) {
  switch (section.type) {
    case "hero":
      return <Hero section={section} />;
    case "about":
      return <About section={section} index={index} />;
    case "projects":
      return <Projects section={section} index={index} projects={data.projects} />;
    case "experience":
      return <Experience section={section} index={index} items={data.experiences} />;
    case "skills":
      return <Skills section={section} index={index} skills={data.skills} />;
    case "gallery":
      return <Gallery section={section} index={index} />;
    case "marquee":
      return <Marquee section={section} />;
    case "stats":
      return <Stats section={section} index={index} />;
    case "quotes":
      return <Quotes section={section} index={index} />;
    case "text":
      return <Text section={section} index={index} />;
    case "contact":
      return <Contact section={section} index={index} />;
    default:
      return null;
  }
}
