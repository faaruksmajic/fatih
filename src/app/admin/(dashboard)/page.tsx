import Image from "next/image";
import Link from "next/link";
import { getProjects } from "@/db/queries";
import { deleteProjectAction } from "./actions";
import { DeleteProjectButton } from "./DeleteProjectButton";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const allProjects = await getProjects();

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl">PROJECTS</h1>
        <Link href="/projects/new" className="bg-ink text-paper px-4 py-2 min-h-11 flex items-center text-sm font-semibold shrink-0">
          + New Project
        </Link>
      </div>
      {allProjects.length === 0 ? (
        <p className="text-ink/60">No projects yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {allProjects.map((project) => {
            const deleteThisProject = deleteProjectAction.bind(null, project.id);
            return (
              <li key={project.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border border-ink/10 p-3 sm:p-4">
                <div className="relative w-20 h-14 sm:w-24 sm:h-16 shrink-0">
                  <Image src={project.coverImage} alt={project.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{project.title}</p>
                  <p className="text-sm text-ink/60">{project.categoryNames?.bs ?? `${project.category} (no category linked)`}</p>
                </div>
                <div className="flex items-center gap-4 w-full justify-end sm:w-auto">
                  <Link href={`/projects/${project.id}/edit`} className="text-sm underline min-h-10 flex items-center px-1">
                    Edit
                  </Link>
                  <DeleteProjectButton action={deleteThisProject} projectTitle={project.title} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
