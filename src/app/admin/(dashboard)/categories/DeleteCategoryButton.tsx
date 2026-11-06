"use client";

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
      <button type="submit" className="text-sm text-red-600 underline min-h-10 px-1">
        Delete
      </button>
    </form>
  );
}
