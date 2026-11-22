"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Category } from "@/lib/categories";
import { IconAlert } from "../../icons";
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
    <form action={formAction} className="a-form">
      {category && <input type="hidden" name="id" value={category.id} />}
      {state.error && (
        <p className="a-banner" role="alert">
          <IconAlert />
          {state.error}
        </p>
      )}
      <section className="a-group" aria-labelledby="cf-names">
        <h2 id="cf-names" className="a-group-title">
          Name
        </h2>
        <p className="a-group-note">Empty translations show the Bosnian name on that language&apos;s page.</p>
        {FIELDS.map(({ lang, label, hint }) => (
          <label key={lang} className="a-field">
            <span className="a-label">
              {label} <small>{hint}</small>
            </span>
            <input
              name={lang}
              defaultValue={category?.names[lang] ?? ""}
              required={lang === "bs"}
              maxLength={80}
              dir={lang === "ar" ? "rtl" : undefined}
              placeholder={lang === "bs" ? "npr. Tehnički crteži" : undefined}
              className="a-input"
            />
          </label>
        ))}
      </section>
      <div className="a-savebar">
        <span className="a-savebar-status">{category ? "Editing category" : "New category"}</span>
        <span className="a-savebar-actions">
          <Link href="/categories" className="a-btn a-btn-plain">
            Cancel
          </Link>
          <button type="submit" disabled={pending} className="a-btn a-btn-primary">
            {pending ? "Saving…" : "Save category"}
          </button>
        </span>
      </div>
    </form>
  );
}
