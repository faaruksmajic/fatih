import { getCategories } from "@/db/queries";
import { ProjectForm } from "../ProjectForm";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const categories = await getCategories();
  return (
    <div>
      <h1 className="font-display text-2xl mb-6">NEW PROJECT</h1>
      <ProjectForm categories={categories} />
    </div>
  );
}
