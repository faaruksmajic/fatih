import { PageHead } from "../../../../PageHead";
import { notFound } from "next/navigation";
import { getCategory } from "@/db/queries";
import { CategoryForm } from "../../CategoryForm";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getCategory(id);
  if (!category) notFound();

  return (
    <>
      <PageHead title={category.names.bs} back={{ href: "/categories", label: "Categories" }} />
      <CategoryForm category={category} />
    </>
  );
}
