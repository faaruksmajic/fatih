"use client";

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
      <button type="submit" className="text-sm text-red-600 underline">
        Delete
      </button>
    </form>
  );
}
