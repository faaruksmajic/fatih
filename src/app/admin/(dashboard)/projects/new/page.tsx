import { PageHead } from "../../../PageHead";
import { getCategories } from "@/db/queries";
import { ProjectForm } from "../ProjectForm";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const categories = await getCategories();
  return (
    <>
      <PageHead title="New project" back={{ href: "/", label: "Projects" }} />
      <ProjectForm categories={categories} />
    </>
  );
}
