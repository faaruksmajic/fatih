import Link from "next/link";
import { getCategories } from "@/db/queries";
import { IconAlert, IconDown, IconPencil, IconPlus, IconTag, IconUp } from "../../icons";
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
    <>
      <header className="a-head">
        <div>
          <h1 className="a-title">Categories</h1>
          <p className="a-sub">
            The tabs above the projects on the home page, in this order. A tab shows once at least one
            project uses its category.
          </p>
        </div>
        <Link href="/categories/new" className="a-btn a-btn-primary">
          <IconPlus />
          New category
        </Link>
      </header>

      {error === "in-use" && (
        <p className="a-banner" role="alert">
          <IconAlert />
          That category still has projects. Move them to another category first, then delete it.
        </p>
      )}

      {list.length === 0 ? (
        <div className="a-empty">
          <IconTag />
          <p>No categories yet.</p>
        </div>
      ) : (
        <ul className="a-list">
          {list.map((category, i) => {
            const translations = (["en", "de", "tr", "ar"] as const)
              .map((lang) => category.names[lang])
              .filter(Boolean);
            return (
              <li key={category.id} className="a-row">
                <div className="a-row-order">
                  <form action={moveCategoryAction.bind(null, category.id, "up")}>
                    <button type="submit" disabled={i === 0} aria-label="Move up" className="a-icon-btn">
                      <IconUp />
                    </button>
                  </form>
                  <form action={moveCategoryAction.bind(null, category.id, "down")}>
                    <button
                      type="submit"
                      disabled={i === list.length - 1}
                      aria-label="Move down"
                      className="a-icon-btn"
                    >
                      <IconDown />
                    </button>
                  </form>
                </div>
                <div className="a-row-text">
                  <p className="a-row-title">{category.names.bs}</p>
                  <p className="a-row-sub">
                    {translations.length > 0 ? translations.join(" · ") : "No translations"}
                  </p>
                </div>
                <span className="a-chip">
                  {category.projectCount} {category.projectCount === 1 ? "project" : "projects"}
                </span>
                <div className="a-row-actions">
                  <Link
                    href={`/categories/${category.id}/edit`}
                    className="a-icon-btn"
                    aria-label={`Edit ${category.names.bs}`}
                  >
                    <IconPencil />
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
    </>
  );
}
