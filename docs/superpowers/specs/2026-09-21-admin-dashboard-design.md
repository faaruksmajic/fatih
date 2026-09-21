# Admin Dashboard for Managing Portfolio Projects

Date: 2026-09-21
Status: Approved

## Overview

The landing page currently hardcodes its "Featured Projects" and
"Notable Projects" content directly in `src/app/page.tsx`. Faruk needs
a way to add, edit, and remove projects without editing code or asking
Claude to redeploy each time. This adds a password-protected admin
dashboard in the same repo/deployment that manages project content in
a database, and changes the public landing page to render that content
dynamically.

## Goals

- Single admin (Faruk) can log in at `/admin/login` and manage
  projects: create, edit, delete.
- Each project has a title, description, category, a cover image, and
  an optional gallery of additional images.
- The public landing page renders one dynamic "Projects" gallery
  section sourced from the database — no code change or redeploy
  needed to add a project.
- The six projects currently hardcoded (ATAL Group, Brčko house,
  kitchen interior, and the three notable-project thumbnails) are
  migrated into the database as seed data so nothing is lost.

## Non-goals

- Multi-user accounts or role management (single admin only).
- Rich text / WYSIWYG editing for descriptions (plain textarea).
- Public-facing project detail pages (gallery images show in a simple
  lightbox/grid on the same card, not a separate route) — can be a
  future iteration.
- Analytics, comments, or any visitor-facing interactivity beyond
  viewing.

## Architecture

- **Database:** Neon Postgres, provisioned through the Vercel
  Marketplace integration and linked to the `fatih` Vercel project.
  Accessed via Drizzle ORM.
- **Image storage:** Vercel Blob. The admin form uploads directly to
  Blob (client-side upload via `@vercel/blob/client`) and stores the
  resulting URLs in Postgres.
- **Auth:** No third-party auth provider. A single admin credential
  pair (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`) lives in Vercel
  environment variables. `/admin/login` verifies the submitted
  password against the bcrypt hash and, on success, sets a signed
  httpOnly cookie (HMAC-signed with an `ADMIN_SESSION_SECRET` env var,
  via `jose`). `middleware.ts` checks that cookie on every `/admin/*`
  request and redirects to `/admin/login` if missing/invalid.
- **Public rendering:** The homepage Server Component queries Postgres
  directly for all projects (ordered by a manual `position` column,
  falling back to `created_at`). After any admin mutation, the server
  action calls `revalidatePath("/")` so the change is visible
  immediately without waiting for a cache window.

## Data model

```
projects
  id            uuid primary key default gen_random_uuid()
  title         text not null
  description   text not null
  category      text not null        -- e.g. "Residential", "Commercial", "Interior"
  cover_image   text not null        -- Blob URL
  position      integer not null default 0
  created_at    timestamptz not null default now()
  updated_at    timestamptz not null default now()

project_images
  id            uuid primary key default gen_random_uuid()
  project_id    uuid not null references projects(id) on delete cascade
  image_url     text not null
  position      integer not null default 0
```

`category` is a free-text field (not a fixed enum) so Faruk isn't
blocked if Fatih works in a new project type later; the admin form
offers a datalist of previously used categories for convenience.

## Admin UI

- `/admin/login` — email + password form, posts to a server action,
  sets the session cookie, redirects to `/admin`.
- `/admin` — table/grid of all projects (cover thumbnail, title,
  category), each row with Edit and Delete (delete asks for
  confirmation), plus a "New Project" button. A "Log out" control
  clears the cookie.
- `/admin/projects/new` and `/admin/projects/[id]/edit` — shared form
  component: title, description (textarea), category (text input with
  datalist suggestions), cover image upload, gallery image upload
  (multiple files, each removable before save, reorderable by drag is
  out of scope — append order is the display order).
- All mutations are Next.js Server Actions (create/update/delete),
  each validating the session cookie server-side before touching the
  database (defense in depth beyond the middleware).

## Public page changes

`src/app/page.tsx`'s `FEATURED_PROJECTS` and `NOTABLE_PROJECTS` arrays
and their two section blocks are replaced by one "Projects" section
that:
- Fetches all rows from `projects` (with their `project_images`) at
  request time in the Server Component.
- Renders each as a card: cover image, category tag, title,
  description, and — if gallery images exist — a small thumbnail strip
  under the card.
- Keeps the existing visual language (dark/light alternating rhythm,
  `font-display` headings, grayscale imagery) established in the
  current design.

## Migration / seed

A one-time seed script (`scripts/seed.ts`, run once via `tsx` against
the Neon connection string) inserts the six existing projects,
re-uploading the JPGs already in `public/images/` to Vercel Blob so
the public page has no hardcoded local image paths left for project
content. The script is not part of the request lifecycle — it's run
once by hand during implementation, then left in the repo for
reference (or to reseed a fresh database).

## Error handling

- Login: wrong credentials → inline error, no distinction between
  "wrong email" vs "wrong password" (avoid user enumeration).
- Admin mutations: validation errors (missing title, no cover image)
  surface inline on the form; unexpected DB/Blob errors show a generic
  "something went wrong, try again" message and are logged server-side.
- Public page: if the DB query fails, the page still renders the
  static hero/about/skills/contact sections and shows an empty state
  for the Projects section rather than crashing — a portfolio site
  should never hard-500 for visitors.

## Environment variables (new)

- `DATABASE_URL` — Neon connection string (added automatically by the
  Vercel Postgres/Neon marketplace integration).
- `BLOB_READ_WRITE_TOKEN` — added automatically by the Vercel Blob
  integration.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` — set manually by Faruk via
  `vercel env add` (password hash generated locally with bcrypt, never
  the plaintext password).
- `ADMIN_SESSION_SECRET` — random 32+ byte secret for signing session
  cookies, generated once and stored the same way.

## Testing

- Automated: unit tests for the session cookie sign/verify helper and
  for the server actions' validation logic (bad input rejected before
  hitting the DB).
- Manual, via the `run` skill: log in, create a project with a cover +
  two gallery images, confirm it appears on `/` immediately, edit it,
  delete it, confirm removal on `/`. Confirm `/admin` redirects to
  `/admin/login` when the session cookie is absent.
