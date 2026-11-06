import { notFound } from "next/navigation";
import { getCategory } from "@/db/queries";
import { CategoryForm } from "../../CategoryForm";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getCategory(id);
  if (!category) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">EDIT CATEGORY</h1>
      <CategoryForm category={category} />
    </div>
  );
}
