"use client";

import { IconTrash } from "../icons";

export function DeleteProjectButton({
  action,
  projectTitle,
}: {
  action: () => Promise<void>;
  projectTitle: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Delete "${projectTitle}"? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="a-icon-btn is-danger" aria-label={`Delete ${projectTitle}`}>
        <IconTrash />
      </button>
    </form>
  );
}
