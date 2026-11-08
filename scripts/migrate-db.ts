/**
 * Runs before every build (see "build" in package.json), where Vercel provides
 * DATABASE_URL. Every step is idempotent and additive: it creates what is
 * missing and never drops or rewrites data. If it fails, the build fails and
 * the previous deployment stays live.
 *
 * Without DATABASE_URL (a local build) it does nothing.
 */
import { neon } from "@neondatabase/serverless";

async function migrate() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("[migrate] DATABASE_URL not set, skipping.");
    return;
  }
  const sql = neon(url);

  // Managed project categories (src/db/schema.ts → categories, projects.category_id).
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      names jsonb NOT NULL,
      position integer NOT NULL DEFAULT 0,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
  await sql`
    ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS category_id uuid
      REFERENCES categories(id) ON DELETE SET NULL`;
  console.log("[migrate] categories schema ready.");

  // Imported here so the database client is only created when a URL exists.
  const { linkLegacyCategories } = await import("./migrate-categories");
  await linkLegacyCategories();
}

migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[migrate] warning (continuing build):", error);
    process.exit(0);
  });
