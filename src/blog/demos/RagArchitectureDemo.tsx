import ArchitectureDiagram from "@/components/sections/ArchitectureDiagram";
import { GALLERY_PROJECTS } from "@/data/projects";
import { useApp } from "@/context/AppContext";

export default function RagArchitectureDemo() {
  const { lang } = useApp();
  const project = GALLERY_PROJECTS.find((p) => p.id === "gallery.rag");

  if (!project?.architecture) return null;
  return <ArchitectureDiagram architecture={project.architecture} lang={lang} />;
}
