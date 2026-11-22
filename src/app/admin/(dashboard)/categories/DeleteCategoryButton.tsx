"use client";

import { IconTrash } from "../../icons";

export function DeleteCategoryButton({
  action,
  name,
}: {
  action: () => Promise<void>;
  name: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Delete the category "${name}"?`)) e.preventDefault();
      }}
    >
      <button type="submit" className="a-icon-btn is-danger" aria-label={`Delete ${name}`}>
        <IconTrash />
      </button>
    </form>
  );
}
