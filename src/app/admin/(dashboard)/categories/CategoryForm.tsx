"use client";

import { useActionState } from "react";
import type { Category } from "@/lib/categories";
import { saveCategoryAction, type CategoryFormState } from "./actions";

/** Bosnian first: it is required and every other language falls back to it. */
const FIELDS = [
  { lang: "bs", label: "Bosanski", hint: "Required" },
  { lang: "en", label: "English", hint: "Optional" },
  { lang: "de", label: "Deutsch", hint: "Optional" },
  { lang: "tr", label: "Türkçe", hint: "Optional" },
  { lang: "ar", label: "العربية", hint: "Optional" },
] as const;

export function CategoryForm({ category }: { category?: Category }) {
  const [state, formAction, pending] = useActionState<CategoryFormState, FormData>(
    saveCategoryAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-xl">
      {category && <input type="hidden" name="id" value={category.id} />}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <p className="text-sm text-ink/60">
        Empty translations show the Bosnian name on that language&apos;s page.
      </p>
      {FIELDS.map(({ lang, label, hint }) => (
        <label key={lang} className="flex flex-col gap-1 text-sm">
          <span>
            {label} <span className="text-ink/50">· {hint}</span>
          </span>
          <input
            name={lang}
            defaultValue={category?.names[lang] ?? ""}
            required={lang === "bs"}
            maxLength={80}
            dir={lang === "ar" ? "rtl" : undefined}
            placeholder={lang === "bs" ? "npr. Tehnički crteži" : undefined}
            className="border border-ink/20 px-3 py-2"
          />
        </label>
      ))}
      <button
        type="submit"
        disabled={pending}
        className="bg-ink text-paper font-semibold px-4 py-2 min-h-11 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save category"}
      </button>
    </form>
  );
}
