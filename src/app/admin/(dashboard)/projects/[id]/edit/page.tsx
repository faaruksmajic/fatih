import { PageHead } from "../../../../PageHead";
import { notFound } from "next/navigation";
import { getCategories, getProjectWithImages } from "@/db/queries";
import { ProjectForm } from "../../ProjectForm";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, categories] = await Promise.all([getProjectWithImages(id), getCategories()]);
  if (!project) notFound();

  return (
    <>
      <PageHead title={project.title || "Edit project"} back={{ href: "/", label: "Projects" }} />
      <ProjectForm project={project} categories={categories} />
    </>
  );
}
