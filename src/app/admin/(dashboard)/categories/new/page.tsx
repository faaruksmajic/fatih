import { PageHead } from "../../../PageHead";
import { CategoryForm } from "../CategoryForm";

export default function NewCategoryPage() {
  return (
    <>
      <PageHead title="New category" back={{ href: "/categories", label: "Categories" }} />
      <CategoryForm />
    </>
  );
}
