import { notFound } from "next/navigation";
import { getProjectWithImages } from "@/db/queries";
import { ProjectForm } from "../../ProjectForm";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectWithImages(id);
  if (!project) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">EDIT PROJECT</h1>
      <ProjectForm project={project} />
    </div>
  );
}
