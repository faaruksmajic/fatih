import Image from "next/image";
import Link from "next/link";
import { getProjects } from "@/db/queries";
import { deleteProjectAction } from "./actions";

export default async function AdminProjectsPage() {
  const allProjects = await getProjects();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">PROJECTS</h1>
        <Link href="/admin/projects/new" className="bg-ink text-paper px-4 py-2 text-sm font-semibold">
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
              <li key={project.id} className="flex items-center gap-4 border border-ink/10 p-4">
                <div className="relative w-24 h-16 shrink-0">
                  <Image src={project.coverImage} alt={project.title} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{project.title}</p>
                  <p className="text-sm text-ink/60">{project.category}</p>
                </div>
                <Link href={`/admin/projects/${project.id}/edit`} className="text-sm underline">
                  Edit
                </Link>
                <form action={deleteThisProject}>
                  <button type="submit" className="text-sm text-red-600 underline">
                    Delete
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
