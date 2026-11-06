import Link from "next/link";
import { getCategories } from "@/db/queries";
import { deleteCategoryAction, moveCategoryAction } from "./actions";
import { DeleteCategoryButton } from "./DeleteCategoryButton";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const list = await getCategories();

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-2">
        <h1 className="font-display text-2xl">CATEGORIES</h1>
        <Link href="/categories/new" className="bg-ink text-paper px-4 py-2 min-h-11 flex items-center text-sm font-semibold shrink-0">
          + New Category
        </Link>
      </div>
      <p className="text-sm text-ink/60 mb-6">
        These are the tabs above the projects on the home page, in this order. A tab shows once at least
        one project uses its category.
      </p>
      {error === "in-use" && (
        <p className="text-sm text-red-600 mb-4">
          That category still has projects. Move them to another category first, then delete it.
        </p>
      )}
      {list.length === 0 ? (
        <p className="text-ink/60">No categories yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((category, i) => {
            const translations = (["en", "de", "tr", "ar"] as const)
              .map((lang) => category.names[lang])
              .filter(Boolean);
            return (
              <li key={category.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 border border-ink/10 px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex flex-col">
                  <form action={moveCategoryAction.bind(null, category.id, "up")}>
                    <button type="submit" disabled={i === 0} aria-label="Move up" className="w-10 h-8 text-ink/60 disabled:opacity-20">
                      ↑
                    </button>
                  </form>
                  <form action={moveCategoryAction.bind(null, category.id, "down")}>
                    <button type="submit" disabled={i === list.length - 1} aria-label="Move down" className="w-10 h-8 text-ink/60 disabled:opacity-20">
                      ↓
                    </button>
                  </form>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{category.names.bs}</p>
                  <p className="text-sm text-ink/60 truncate">
                    {translations.length > 0 ? translations.join(" · ") : "No translations"}
                  </p>
                </div>
                <div className="flex items-center gap-4 w-full justify-end sm:w-auto">
                  <span className="text-sm text-ink/60 tabular-nums mr-auto sm:mr-0">
                    {category.projectCount} {category.projectCount === 1 ? "project" : "projects"}
                  </span>
                  <Link href={`/categories/${category.id}/edit`} className="text-sm underline min-h-10 flex items-center px-1">
                    Edit
                  </Link>
                  <DeleteCategoryButton
                    action={deleteCategoryAction.bind(null, category.id)}
                    name={category.names.bs}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
