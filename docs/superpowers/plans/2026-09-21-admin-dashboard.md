# Admin Dashboard for Managing Portfolio Projects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Faruk log into a password-protected `/admin` dashboard in this same Next.js app, add/edit/delete portfolio projects (with uploaded images), and have them appear on the public landing page immediately with no code change or manual redeploy.

**Architecture:** Neon Postgres (via Drizzle ORM) stores project rows and their gallery images; Vercel Blob stores the actual image files; a single hardcoded admin credential pair (env vars) plus a signed JWT cookie gates every `/admin/*` route via `middleware.ts`; the public homepage becomes a Server Component that queries Postgres directly at request time, so admin writes are visible on next page load after `revalidatePath("/")`.

**Tech Stack:** Next.js 16 (App Router, Server Actions), Drizzle ORM + `@neondatabase/serverless`, Neon Postgres, `@vercel/blob` (client uploads), `jose` (JWT sign/verify), `bcryptjs` (password hashing), Vitest (unit tests).

**Spec:** `docs/superpowers/specs/2026-09-21-admin-dashboard-design.md`

## Global Constraints

- Single admin user only — credentials live in env vars (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`), never in the database or in code.
- No third-party auth provider (no NextAuth/Clerk) — a hand-rolled signed-cookie session is sufficient for one user.
- `category` on a project is free text, not a fixed enum.
- The public homepage must never hard-crash if the database is unreachable — it falls back to an empty Projects section.
- All admin mutations must call `revalidatePath("/")` and `revalidatePath("/admin")` so changes are visible immediately.
- Session secret and password hash are generated locally and stored only via `vercel env add` — never commit them, never print the raw password.

---

### Task 1: Add dependencies and test tooling

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/lib/smoke.test.ts`

**Interfaces:**
- Produces: `npm test` script that runs Vitest once (`vitest run`); this is the test runner every later task's unit tests use.

- [ ] **Step 1: Install runtime and dev dependencies**

Run:
```bash
npm install drizzle-orm @neondatabase/serverless @vercel/blob bcryptjs jose
npm install -D drizzle-kit tsx vitest @types/bcryptjs
```

- [ ] **Step 2: Add npm scripts**

Modify `package.json` `scripts` block to:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "db:generate": "drizzle-kit generate",
  "db:push": "drizzle-kit push",
  "seed": "tsx scripts/seed.ts"
}
```

- [ ] **Step 3: Create the Vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 4: Write a smoke test**

Create `src/lib/smoke.test.ts`:
```ts
import { describe, expect, it } from "vitest";

describe("vitest setup", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run the test suite**

Run: `npm test`
Expected: 1 passed (the smoke test).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/smoke.test.ts
git commit -m "chore: add drizzle, blob, auth, and vitest dependencies"
```

---

### Task 2: Provision Neon Postgres and Vercel Blob, set admin credentials

This task is infrastructure setup, not code. It's a task on its own because everything after it needs `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` to exist, and Faruk's real admin password must never appear in a commit.

**Files:** none (Vercel project configuration + local `.env.local`, which is already gitignored).

- [ ] **Step 1: Add the Neon Postgres integration**

Run (from the `fatih` project root, already linked to Vercel from the earlier deploy):
```bash
npx vercel integration add neon
```
If the CLI reports the integration flow must be completed in the browser, open the printed URL, choose the free Neon plan, and connect it to the `fatih` project. If `vercel integration add` isn't available in this CLI version, do this instead: open `https://vercel.com/faruksmajic-7232s-projects/fatih/stores` and add a Postgres (Neon) database from there, connecting it to the `fatih` project's Production environment.

Verify: `npx vercel env ls` should now list `DATABASE_URL` for Production.

- [ ] **Step 2: Add the Vercel Blob store**

Run:
```bash
npx vercel integration add blob
```
Same fallback as Step 1 if the CLI doesn't support it directly: create a Blob store from `https://vercel.com/faruksmajic-7232s-projects/fatih/stores` and connect it to the project.

Verify: `npx vercel env ls` should now also list `BLOB_READ_WRITE_TOKEN` for Production.

- [ ] **Step 3: Generate the admin password hash**

Run (replace `YOUR_REAL_PASSWORD` with the actual password you want to log in with — pick it yourself, don't tell Claude what it is):
```bash
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 10))" "YOUR_REAL_PASSWORD"
```
Copy the printed hash (starts with `$2a$` or `$2b$`).

- [ ] **Step 4: Generate the session secret**

Run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the printed hex string.

- [ ] **Step 5: Set the three admin env vars on Vercel**

Run each of these, pasting the value when prompted (or piping it, replacing the placeholders):
```bash
npx vercel env add ADMIN_EMAIL production
npx vercel env add ADMIN_PASSWORD_HASH production
npx vercel env add ADMIN_SESSION_SECRET production
```
Use your real email for `ADMIN_EMAIL`, the bcrypt hash from Step 3 for `ADMIN_PASSWORD_HASH`, and the hex string from Step 4 for `ADMIN_SESSION_SECRET`.

- [ ] **Step 6: Pull everything to local `.env.local`**

Run:
```bash
npx vercel env pull .env.local --yes
```

- [ ] **Step 7: Verify**

Run: `grep -c "DATABASE_URL\|BLOB_READ_WRITE_TOKEN\|ADMIN_EMAIL\|ADMIN_PASSWORD_HASH\|ADMIN_SESSION_SECRET" .env.local`
Expected: `5`

No commit — `.env.local` is gitignored and must stay that way.

---

### Task 3: Password verification helper (TDD)

**Files:**
- Create: `src/lib/auth/password.ts`
- Test: `src/lib/auth/password.test.ts`

**Interfaces:**
- Produces: `verifyPassword(password: string, hash: string): Promise<boolean>` — used by the login server action in Task 10.

- [ ] **Step 1: Write the failing test**

Create `src/lib/auth/password.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { verifyPassword } from "./password";

describe("verifyPassword", () => {
  const hash = bcrypt.hashSync("correct-horse-battery-staple", 10);

  it("returns true for the matching password", async () => {
    expect(await verifyPassword("correct-horse-battery-staple", hash)).toBe(true);
  });

  it("returns false for a wrong password", async () => {
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/auth/password.test.ts`
Expected: FAIL — `Cannot find module './password'`.

- [ ] **Step 3: Implement**

Create `src/lib/auth/password.ts`:
```ts
import bcrypt from "bcryptjs";

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/auth/password.test.ts`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth/password.ts src/lib/auth/password.test.ts
git commit -m "feat: add admin password verification helper"
```

---

### Task 4: Session token helper (TDD)

**Files:**
- Create: `src/lib/auth/session.ts`
- Test: `src/lib/auth/session.test.ts`

**Interfaces:**
- Produces: `type SessionPayload = { email: string }`, `createSessionToken(payload: SessionPayload, secret: string, expiresInSeconds?: number): Promise<string>`, `verifySessionToken(token: string, secret: string): Promise<SessionPayload | null>` — used by the login action (Task 10), `middleware.ts` (Task 9), and the Blob upload route (Task 12).

- [ ] **Step 1: Write the failing test**

Create `src/lib/auth/session.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "./session";

const SECRET = "test-secret-at-least-32-bytes-long!!";

describe("session tokens", () => {
  it("round-trips a valid token", async () => {
    const token = await createSessionToken({ email: "admin@example.com" }, SECRET);
    const session = await verifySessionToken(token, SECRET);
    expect(session).toEqual({ email: "admin@example.com" });
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken({ email: "admin@example.com" }, SECRET);
    const session = await verifySessionToken(token, "a-completely-different-secret!!");
    expect(session).toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await createSessionToken({ email: "admin@example.com" }, SECRET, -10);
    const session = await verifySessionToken(token, SECRET);
    expect(session).toBeNull();
  });

  it("rejects garbage input", async () => {
    const session = await verifySessionToken("not-a-real-token", SECRET);
    expect(session).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/auth/session.test.ts`
Expected: FAIL — `Cannot find module './session'`.

- [ ] **Step 3: Implement**

Create `src/lib/auth/session.ts`:
```ts
import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();

export type SessionPayload = { email: string };

export async function createSessionToken(
  payload: SessionPayload,
  secret: string,
  expiresInSeconds = 60 * 60 * 24 * 7,
): Promise<string> {
  const expiration = new Date(Date.now() + expiresInSeconds * 1000);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(encoder.encode(secret));
}

export async function verifySessionToken(token: string, secret: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encoder.encode(secret));
    if (typeof payload.email !== "string") return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/auth/session.test.ts`
Expected: 4 passed.

If the "rejects an expired token" case fails because `jose` throws during signing instead of verifying, that means a negative `expiresInSeconds` produces a `Date` in the past that `SignJWT` rejects at sign time — wrap Step 1's third test in `await expect(...).rejects.toThrow()` around the `createSessionToken` call instead, and adjust the implementation only if signing genuinely cannot produce an already-expired token.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth/session.ts src/lib/auth/session.test.ts
git commit -m "feat: add signed session token helpers"
```

---

### Task 5: Project form validation helper (TDD)

**Files:**
- Create: `src/lib/validation.ts`
- Test: `src/lib/validation.test.ts`

**Interfaces:**
- Produces: `type ProjectFormInput = { title: string; description: string; category: string; coverImage: string; images: string[] }`, `type ValidationResult = { valid: true } | { valid: false; errors: Record<string, string> }`, `validateProjectInput(input: Partial<ProjectFormInput>): ValidationResult` — used by `saveProjectAction` in Task 13.

- [ ] **Step 1: Write the failing test**

Create `src/lib/validation.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { validateProjectInput } from "./validation";

describe("validateProjectInput", () => {
  const valid = {
    title: "ATAL Group",
    description: "A five-story building.",
    category: "Commercial",
    coverImage: "https://example.com/cover.jpg",
    images: [] as string[],
  };

  it("accepts a fully filled project", () => {
    expect(validateProjectInput(valid)).toEqual({ valid: true });
  });

  it("rejects a missing title", () => {
    const result = validateProjectInput({ ...valid, title: "  " });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.title).toBeDefined();
  });

  it("rejects a missing description", () => {
    const result = validateProjectInput({ ...valid, description: "" });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.description).toBeDefined();
  });

  it("rejects a missing category", () => {
    const result = validateProjectInput({ ...valid, category: "" });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.category).toBeDefined();
  });

  it("rejects a missing cover image", () => {
    const result = validateProjectInput({ ...valid, coverImage: "" });
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors.coverImage).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/validation.test.ts`
Expected: FAIL — `Cannot find module './validation'`.

- [ ] **Step 3: Implement**

Create `src/lib/validation.ts`:
```ts
export type ProjectFormInput = {
  title: string;
  description: string;
  category: string;
  coverImage: string;
  images: string[];
};

export type ValidationResult = { valid: true } | { valid: false; errors: Record<string, string> };

export function validateProjectInput(input: Partial<ProjectFormInput>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.title || input.title.trim().length === 0) errors.title = "Title is required.";
  if (!input.description || input.description.trim().length === 0) errors.description = "Description is required.";
  if (!input.category || input.category.trim().length === 0) errors.category = "Category is required.";
  if (!input.coverImage || input.coverImage.trim().length === 0) errors.coverImage = "Cover image is required.";

  if (Object.keys(errors).length > 0) return { valid: false, errors };
  return { valid: true };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/validation.test.ts`
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/validation.ts src/lib/validation.test.ts
git commit -m "feat: add project form validation"
```

---

### Task 6: Drizzle schema and database client

**Files:**
- Create: `src/db/schema.ts`
- Create: `src/db/client.ts`
- Create: `drizzle.config.ts`

**Interfaces:**
- Produces: `projects` and `projectImages` Drizzle table objects, and a `db` client (Drizzle instance) — used by `src/db/queries.ts` in Task 7.

- [ ] **Step 1: Write the schema**

Create `src/db/schema.ts`:
```ts
import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  coverImage: text("cover_image").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projectImages = pgTable("project_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  position: integer("position").notNull().default(0),
});
```

- [ ] **Step 2: Write the database client**

Create `src/db/client.ts`:
```ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

- [ ] **Step 3: Write the drizzle-kit config**

Create `drizzle.config.ts`:
```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 4: Push the schema to Neon**

Run: `npm run db:push`
Expected: drizzle-kit reports it created the `projects` and `project_images` tables with no destructive warnings. Answer any confirmation prompt with yes.

- [ ] **Step 5: Verify the tables exist**

Run:
```bash
npx tsx -e "
import { db } from './src/db/client';
import { projects } from './src/db/schema';
db.select().from(projects).then((rows) => {
  console.log('projects table readable, row count:', rows.length);
  process.exit(0);
});
"
```
Expected: `projects table readable, row count: 0`

- [ ] **Step 6: Commit**

```bash
git add src/db/schema.ts src/db/client.ts drizzle.config.ts
git commit -m "feat: add drizzle schema and Neon client"
```

---

### Task 7: Data access layer (queries)

**Files:**
- Create: `src/db/queries.ts`

**Interfaces:**
- Consumes: `db`, `projects`, `projectImages` from Task 6; `ProjectFormInput` from Task 5.
- Produces: `type ProjectWithImages = { id: string; title: string; description: string; category: string; coverImage: string; position: number; images: { id: string; imageUrl: string }[] }`, `getProjects(): Promise<ProjectWithImages[]>`, `getProjectsSafe(): Promise<ProjectWithImages[]>`, `getProjectWithImages(id: string): Promise<ProjectWithImages | null>`, `createProject(input: ProjectFormInput): Promise<string>`, `updateProject(id: string, input: ProjectFormInput): Promise<void>`, `deleteProject(id: string): Promise<void>` — used by the public page (Task 15), admin pages (Tasks 11, 13), and `scripts/seed.ts` (Task 8).

- [ ] **Step 1: Implement the queries module**

Create `src/db/queries.ts`:
```ts
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "./client";
import { projectImages, projects } from "./schema";
import type { ProjectFormInput } from "@/lib/validation";

export type ProjectWithImages = {
  id: string;
  title: string;
  description: string;
  category: string;
  coverImage: string;
  position: number;
  images: { id: string; imageUrl: string }[];
};

export async function getProjects(): Promise<ProjectWithImages[]> {
  const rows = await db.select().from(projects).orderBy(asc(projects.position), asc(projects.createdAt));
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);
  const images = await db
    .select()
    .from(projectImages)
    .where(inArray(projectImages.projectId, ids))
    .orderBy(asc(projectImages.position));

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    coverImage: row.coverImage,
    position: row.position,
    images: images
      .filter((img) => img.projectId === row.id)
      .map((img) => ({ id: img.id, imageUrl: img.imageUrl })),
  }));
}

export async function getProjectsSafe(): Promise<ProjectWithImages[]> {
  try {
    return await getProjects();
  } catch (error) {
    console.error("Failed to load projects:", error);
    return [];
  }
}

export async function getProjectWithImages(id: string): Promise<ProjectWithImages | null> {
  const [row] = await db.select().from(projects).where(eq(projects.id, id));
  if (!row) return null;

  const images = await db
    .select()
    .from(projectImages)
    .where(eq(projectImages.projectId, id))
    .orderBy(asc(projectImages.position));

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    coverImage: row.coverImage,
    position: row.position,
    images: images.map((img) => ({ id: img.id, imageUrl: img.imageUrl })),
  };
}

export async function createProject(input: ProjectFormInput): Promise<string> {
  const existing = await db.select({ id: projects.id }).from(projects);

  const [created] = await db
    .insert(projects)
    .values({
      title: input.title,
      description: input.description,
      category: input.category,
      coverImage: input.coverImage,
      position: existing.length,
    })
    .returning({ id: projects.id });

  if (input.images.length > 0) {
    await db.insert(projectImages).values(
      input.images.map((imageUrl, index) => ({
        projectId: created.id,
        imageUrl,
        position: index,
      })),
    );
  }

  return created.id;
}

export async function updateProject(id: string, input: ProjectFormInput): Promise<void> {
  await db
    .update(projects)
    .set({
      title: input.title,
      description: input.description,
      category: input.category,
      coverImage: input.coverImage,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id));

  await db.delete(projectImages).where(eq(projectImages.projectId, id));

  if (input.images.length > 0) {
    await db.insert(projectImages).values(
      input.images.map((imageUrl, index) => ({
        projectId: id,
        imageUrl,
        position: index,
      })),
    );
  }
}

export async function deleteProject(id: string): Promise<void> {
  await db.delete(projects).where(eq(projects.id, id));
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/db/queries.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/db/queries.ts
git commit -m "feat: add project data access layer"
```

(No unit test here — every function talks to the live Neon database. It's exercised for real in Task 8's seed run and Task 16's manual walkthrough, matching the spec's testing section.)

---

### Task 8: Seed script — migrate the six existing projects

**Files:**
- Create: `scripts/seed.ts`

**Interfaces:**
- Consumes: `createProject` from Task 7, `put` from `@vercel/blob`.

- [ ] **Step 1: Write the seed script**

Create `scripts/seed.ts`:
```ts
import { readFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import { createProject } from "../src/db/queries";

const SEED_PROJECTS = [
  {
    file: "project-atal-group.jpg",
    title: "ATAL Group Office Building",
    category: "Commercial",
    description:
      "A five-story mixed-use building combining functionality and modern minimalism in an urban setting. The first four floors are flexible office space with abundant natural light, while the top two floors hold two luxurious penthouses with private terraces. A sleek black-and-white facade with black-framed windows creates a contemporary, high-contrast identity, supported by a large front parking area for tenants and residents alike.",
  },
  {
    file: "project-brcko-house.jpg",
    title: "Private Residence, Brčko",
    category: "Residential",
    description:
      "A single-story modern house in Brčko, BiH spanning over 300 m². Built with American walls beneath a four-sloped roof, finished with anthracite windows and a matching gate. The garage fits up to four cars, the backyard includes a pool and terrace, and the attic is designed as a home gym — a comfortable, stylish family home built on contemporary aesthetics.",
  },
  {
    file: "project-kitchen.jpg",
    title: "Modern Kitchen Interior",
    category: "Interior",
    description:
      "An interior study of a modern kitchen finished in wood and matte black. A central island anchors the space, balancing aesthetics and functionality — every detail, from cabinetry to material choice, reflects a thoughtful design approach aimed at a sleek, highly functional result.",
  },
  {
    file: "notable-01.jpg",
    title: "Notable Project 01",
    category: "Interior",
    description: "A walk-in closet and bedroom suite finished in dark wood veneer and soft, layered textiles.",
  },
  {
    file: "notable-02.jpg",
    title: "Notable Project 02",
    category: "Interior",
    description: "A bedroom interior balancing warm lighting with fluted wall paneling and a minimal material palette.",
  },
  {
    file: "notable-03.jpg",
    title: "Notable Project 03",
    category: "Interior",
    description: "A living room composition centered on a floating media console and understated natural finishes.",
  },
];

async function main() {
  for (let i = 0; i < SEED_PROJECTS.length; i++) {
    const seed = SEED_PROJECTS[i];
    const filePath = path.join(process.cwd(), "public", "images", seed.file);
    const fileBuffer = await readFile(filePath);

    const blob = await put(`seed/${seed.file}`, fileBuffer, {
      access: "public",
      contentType: "image/jpeg",
    });

    const id = await createProject({
      title: seed.title,
      description: seed.description,
      category: seed.category,
      coverImage: blob.url,
      images: [],
    });

    console.log(`Seeded "${seed.title}" -> ${id} (${blob.url})`);
  }
}

main()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

- [ ] **Step 2: Run the seed script**

Run: `npm run seed`
Expected: 6 lines of `Seeded "..." -> <uuid> (https://...)`, then `Seed complete.`

- [ ] **Step 3: Verify the rows landed**

Run:
```bash
npx tsx -e "
import { getProjects } from './src/db/queries';
getProjects().then((rows) => {
  console.log('project count:', rows.length);
  console.log(rows.map((r) => r.title));
  process.exit(0);
});
"
```
Expected: `project count: 6` and the six titles listed.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed.ts
git commit -m "feat: add seed script for existing portfolio projects"
```

---

### Task 9: Middleware protecting `/admin`

**Files:**
- Create: `middleware.ts` (repo root, next to `package.json`)

**Interfaces:**
- Consumes: `verifySessionToken` from Task 4.

- [ ] **Step 1: Write the middleware**

Create `middleware.ts`:
```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/session";

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_session")?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;
  const session = token && secret ? await verifySessionToken(token, secret) : null;

  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}
```

- [ ] **Step 2: Verify it redirects when logged out**

Run: `npm run dev -- -p 3478 &` then, after it's up, `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3478/admin`
Expected: `307 http://localhost:3478/admin/login` (there's no `/admin` page yet, but the middleware still runs and redirects before Next.js 404s — if you see a plain 404 with no redirect, the middleware isn't matching and needs fixing before moving on). Stop the dev server afterward: `lsof -ti:3478 -sTCP:LISTEN | xargs -r kill`.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: protect /admin routes with session middleware"
```

---

### Task 10: Login page and logout action

**Files:**
- Create: `src/app/admin/login/actions.ts`
- Create: `src/app/admin/login/page.tsx`

**Interfaces:**
- Consumes: `verifyPassword` (Task 3), `createSessionToken` (Task 4).
- Produces: `loginAction(prevState: LoginState, formData: FormData): Promise<LoginState>` where `type LoginState = { error?: string }` — used by the login page here, and referenced by Task 11's logout pattern.

- [ ] **Step 1: Write the login server action**

Create `src/app/admin/login/actions.ts`:
```ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken } from "@/lib/auth/session";

export type LoginState = { error?: string };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!adminEmail || !adminPasswordHash || !sessionSecret) {
    return { error: "Admin auth is not configured." };
  }

  const emailMatches = email.toLowerCase() === adminEmail.toLowerCase();
  const passwordMatches = await verifyPassword(password || " ", adminPasswordHash);

  if (!emailMatches || !passwordMatches) {
    return { error: "Invalid email or password." };
  }

  const token = await createSessionToken({ email: adminEmail }, sessionSecret);
  const cookieStore = await cookies();
  cookieStore.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/admin");
}
```

- [ ] **Step 2: Write the login page**

Create `src/app/admin/login/page.tsx`:
```tsx
"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <main className="min-h-screen flex items-center justify-center bg-charcoal text-paper px-6">
      <form action={formAction} className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="font-display text-3xl mb-2">ADMIN LOGIN</h1>
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input name="email" type="email" required className="bg-paper text-ink px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input name="password" type="password" required className="bg-paper text-ink px-3 py-2" />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="bg-paper text-ink font-semibold px-4 py-2 mt-2 disabled:opacity-50"
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 3: Manual verification**

Run: `npm run dev -- -p 3478 &`, wait for it to be up, then use the `run` skill's browser-driven pattern (Playwright) to navigate to `http://localhost:3478/admin/login`, submit the wrong password, confirm the "Invalid email or password." message renders, then submit the real credentials from Task 2 and confirm it redirects to `/admin` (a 404 page is fine here — `/admin` itself doesn't exist until Task 11 — what matters is the URL is no longer `/admin/login`). Kill the dev server afterward.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/login
git commit -m "feat: add admin login page and action"
```

---

### Task 11: Admin dashboard layout, project list, delete, logout

**Files:**
- Create: `src/app/admin/(dashboard)/layout.tsx`
- Create: `src/app/admin/(dashboard)/actions.ts`
- Create: `src/app/admin/(dashboard)/page.tsx`
- Modify: `next.config.ts` (Blob image domain — needed here because this is the first page that renders a Blob-hosted `<Image>`)

**Interfaces:**
- Consumes: `getProjects`, `deleteProject` from Task 7.
- Produces: `logoutAction(): Promise<void>`, `deleteProjectAction(id: string): Promise<void>`.

- [ ] **Step 1: Allow Blob-hosted images in next/image**

Modify `next.config.ts`:
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
```

- [ ] **Step 2: Write the dashboard actions**

Create `src/app/admin/(dashboard)/actions.ts`:
```ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { deleteProject } from "@/db/queries";

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}

export async function deleteProjectAction(id: string) {
  await deleteProject(id);
  revalidatePath("/");
  revalidatePath("/admin");
}
```

- [ ] **Step 3: Write the dashboard layout**

Create `src/app/admin/(dashboard)/layout.tsx`:
```tsx
import Link from "next/link";
import { logoutAction } from "./actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
        <Link href="/admin" className="font-display text-lg">
          FATIH ADMIN
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="text-sm underline">
            Log out
          </button>
        </form>
      </header>
      <div className="px-6 py-8 max-w-5xl mx-auto">{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Write the project list page**

Create `src/app/admin/(dashboard)/page.tsx`:
```tsx
import Image from "next/image";
import Link from "next/link";
import { getProjects } from "@/db/queries";
import { deleteProjectAction } from "./actions";

export default async function AdminProjectsPage() {
  const allProjects = await getProjects();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">PROJECTS</h1>
        <Link href="/admin/projects/new" className="bg-ink text-paper px-4 py-2 text-sm font-semibold">
          + New Project
        </Link>
      </div>
      {allProjects.length === 0 ? (
        <p className="text-ink/60">No projects yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {allProjects.map((project) => {
            const deleteThisProject = deleteProjectAction.bind(null, project.id);
            return (
              <li key={project.id} className="flex items-center gap-4 border border-ink/10 p-4">
                <div className="relative w-24 h-16 shrink-0">
                  <Image src={project.coverImage} alt={project.title} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{project.title}</p>
                  <p className="text-sm text-ink/60">{project.category}</p>
                </div>
                <Link href={`/admin/projects/${project.id}/edit`} className="text-sm underline">
                  Edit
                </Link>
                <form action={deleteThisProject}>
                  <button type="submit" className="text-sm text-red-600 underline">
                    Delete
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Manual verification**

Run: `npm run dev -- -p 3478 &`, log in via `/admin/login`, confirm `/admin` shows the six seeded projects with thumbnails, then delete one, confirm the list drops to five and the row disappears without a full page reload glitch. Kill the dev server afterward. Re-run `npm run seed` is not needed — just note which project you deleted for the next manual check.

- [ ] **Step 6: Commit**

```bash
git add "src/app/admin/(dashboard)" next.config.ts
git commit -m "feat: add admin dashboard layout and project list"
```

---

### Task 12: Blob upload API route

**Files:**
- Create: `src/app/api/blob/upload/route.ts`

**Interfaces:**
- Consumes: `verifySessionToken` from Task 4.
- Produces: `POST /api/blob/upload` — the `handleUploadUrl` the client-side `ProjectForm` (Task 13) uploads through.

- [ ] **Step 1: Implement the route**

Create `src/app/api/blob/upload/route.ts`:
```ts
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth/session";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const cookieStore = await cookies();
        const token = cookieStore.get("admin_session")?.value;
        const secret = process.env.ADMIN_SESSION_SECRET;
        const session = token && secret ? await verifySessionToken(token, secret) : null;

        if (!session) {
          throw new Error("Not authenticated");
        }

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
```

- [ ] **Step 2: Verify unauthenticated requests are rejected**

Run: `npm run dev -- -p 3478 &`, wait until up, then:
```bash
curl -s -X POST http://localhost:3478/api/blob/upload \
  -H "Content-Type: application/json" \
  -d '{"type":"blob.generate-client-token","payload":{"pathname":"test.jpg","callbackUrl":"http://localhost:3478/api/blob/upload"}}'
```
Expected: a 400 response with an error message (no valid session cookie was sent). Kill the dev server afterward.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/blob/upload
git commit -m "feat: add authenticated Blob upload route"
```

---

### Task 13: Project form, new/edit pages, save action

**Files:**
- Create: `src/app/admin/(dashboard)/projects/actions.ts`
- Create: `src/app/admin/(dashboard)/projects/ProjectForm.tsx`
- Create: `src/app/admin/(dashboard)/projects/new/page.tsx`
- Create: `src/app/admin/(dashboard)/projects/[id]/edit/page.tsx`

**Interfaces:**
- Consumes: `validateProjectInput` (Task 5), `createProject`/`updateProject`/`getProjectWithImages` (Task 7), `ProjectWithImages` type (Task 7).
- Produces: `saveProjectAction(input: SaveProjectInput): Promise<SaveProjectResult>` where `type SaveProjectInput = ProjectFormInput & { id?: string }` and `type SaveProjectResult = { valid: true } | { valid: false; errors: Record<string, string> }`.

- [ ] **Step 1: Write the save action**

Create `src/app/admin/(dashboard)/projects/actions.ts`:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { createProject, updateProject } from "@/db/queries";
import { validateProjectInput, type ProjectFormInput } from "@/lib/validation";

export type SaveProjectInput = ProjectFormInput & { id?: string };
export type SaveProjectResult = { valid: true } | { valid: false; errors: Record<string, string> };

export async function saveProjectAction(input: SaveProjectInput): Promise<SaveProjectResult> {
  const result = validateProjectInput(input);
  if (!result.valid) return result;

  if (input.id) {
    await updateProject(input.id, input);
  } else {
    await createProject(input);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { valid: true };
}
```

- [ ] **Step 2: Write the shared form component**

Create `src/app/admin/(dashboard)/projects/ProjectForm.tsx`:
```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { saveProjectAction } from "./actions";
import type { ProjectWithImages } from "@/db/queries";

const CATEGORY_SUGGESTIONS = ["Residential", "Commercial", "Interior", "Urban"];

export function ProjectForm({ project }: { project?: ProjectWithImages }) {
  const router = useRouter();
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [category, setCategory] = useState(project?.category ?? "");
  const [coverImage, setCoverImage] = useState(project?.coverImage ?? "");
  const [images, setImages] = useState<string[]>(project?.images.map((image) => image.imageUrl) ?? []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File): Promise<string> {
    const blob = await upload(file.name, file, {
      access: "public",
      handleUploadUrl: "/api/blob/upload",
    });
    return blob.url;
  }

  async function handleCoverChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      setCoverImage(await uploadFile(file));
    } catch {
      setError("Cover image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleGalleryChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const urls = await Promise.all(files.map(uploadFile));
      setImages((previous) => [...previous, ...urls]);
    } catch {
      setError("Gallery image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    setImages((previous) => previous.filter((image) => image !== url));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await saveProjectAction({
      id: project?.id,
      title,
      description,
      category,
      coverImage,
      images,
    });

    setSubmitting(false);

    if (!result.valid) {
      setError(Object.values(result.errors)[0]);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <label className="flex flex-col gap-1 text-sm">
        Title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="border border-ink/20 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={5}
          className="border border-ink/20 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Category
        <input
          list="categories"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="border border-ink/20 px-3 py-2"
        />
        <datalist id="categories">
          {CATEGORY_SUGGESTIONS.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Cover image
        <input type="file" accept="image/*" onChange={handleCoverChange} />
      </label>
      {coverImage && (
        <div className="relative w-40 h-28">
          <Image src={coverImage} alt="Cover preview" fill className="object-cover" />
        </div>
      )}
      <label className="flex flex-col gap-1 text-sm">
        Gallery images
        <input type="file" accept="image/*" multiple onChange={handleGalleryChange} />
      </label>
      <div className="flex flex-wrap gap-2">
        {images.map((url) => (
          <div key={url} className="relative w-20 h-20">
            <Image src={url} alt="Gallery preview" fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute -top-2 -right-2 bg-ink text-paper w-5 h-5 text-xs"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="submit"
        disabled={uploading || submitting}
        className="bg-ink text-paper font-semibold px-4 py-2 disabled:opacity-50"
      >
        {submitting ? "Saving..." : uploading ? "Uploading..." : "Save project"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Write the new-project page**

Create `src/app/admin/(dashboard)/projects/new/page.tsx`:
```tsx
import { ProjectForm } from "../ProjectForm";

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="font-display text-2xl mb-6">NEW PROJECT</h1>
      <ProjectForm />
    </div>
  );
}
```

- [ ] **Step 4: Write the edit-project page**

Create `src/app/admin/(dashboard)/projects/[id]/edit/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { getProjectWithImages } from "@/db/queries";
import { ProjectForm } from "../../ProjectForm";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectWithImages(id);
  if (!project) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">EDIT PROJECT</h1>
      <ProjectForm project={project} />
    </div>
  );
}
```

- [ ] **Step 5: Manual verification**

Run: `npm run dev -- -p 3478 &`, log in, go to `/admin/projects/new`, fill the form, upload a cover image and two gallery images (use any local JPGs — the six under `public/images/` work fine for a test), submit, confirm it redirects to `/admin` and the new project appears in the list with the correct thumbnail. Click Edit on it, change the title, save, confirm the change shows in the list. Kill the dev server afterward.

- [ ] **Step 6: Commit**

```bash
git add "src/app/admin/(dashboard)/projects"
git commit -m "feat: add project create/edit forms with Blob image upload"
```

---

### Task 14: Public page — dynamic Projects section

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `getProjectsSafe` from Task 7.

- [ ] **Step 1: Remove the hardcoded project data and sections**

In `src/app/page.tsx`, delete the `FEATURED_PROJECTS` and `NOTABLE_PROJECTS` constant arrays, and delete the two `<section>` blocks that render them (the one with `id="work"` wrapping `FEATURED_PROJECTS.map(...)`, and the one with `id="notable"` wrapping `NOTABLE_PROJECTS.map(...)`).

- [ ] **Step 2: Add the import and make `Home` async**

At the top of `src/app/page.tsx`, add:
```ts
import { getProjectsSafe } from "@/db/queries";
```
Change the component signature from `export default function Home() {` to `export default async function Home() {`, and add as its first line:
```ts
const projects = await getProjectsSafe();
```

- [ ] **Step 3: Add the dynamic Projects section**

In place of the two deleted sections, add a single section (keep the `id="work"` so the nav's "Work" link still scrolls to it; the nav's "Notable" link should be removed since there's only one gallery now — update `NAV_LINKS` to drop the `{ href: "#notable", label: "Notable" }` entry):
```tsx
<section id="work" className="bg-paper text-ink py-20 md:py-28 px-6 md:px-12">
  <div className="max-w-7xl mx-auto">
    <h2 className="font-display text-[13vw] md:text-[5vw] leading-[0.85] mb-14">
      PROJECTS
    </h2>
    {projects.length === 0 ? (
      <p className="text-ink/60">Projects coming soon.</p>
    ) : (
      <div className="grid md:grid-cols-2 gap-16">
        {projects.map((project) => (
          <article key={project.id} className="flex flex-col gap-4">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={project.coverImage}
                alt={project.title}
                fill
                className="object-cover grayscale"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
            <p className="uppercase text-sm tracking-wide text-ink/60">{project.category}</p>
            <h3 className="font-display text-2xl md:text-3xl leading-[0.9]">{project.title}</h3>
            <p className="leading-relaxed text-ink/75 max-w-md">{project.description}</p>
            {project.images.length > 0 && (
              <div className="flex gap-2 mt-2">
                {project.images.map((image) => (
                  <div key={image.id} className="relative w-16 h-16 shrink-0">
                    <Image
                      src={image.imageUrl}
                      alt=""
                      fill
                      className="object-cover grayscale"
                      sizes="64px"
                    />
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    )}
  </div>
</section>
```

- [ ] **Step 4: Build check**

Run: `npm run build`
Expected: build succeeds (this also proves the DB is reachable at build time via the `DATABASE_URL` in `.env.local`, since the homepage is statically rendered — if it fails because of that, note it for Task 16 but don't block: Vercel's production build will have the same env var set, so a local build failure only from a missing local `.env.local` is expected to resolve itself once deployed).

- [ ] **Step 5: Manual verification**

Run: `npm run dev -- -p 3478 &`, open `http://localhost:3478/`, confirm the Projects section shows the current project count (six minus however many you deleted in Task 11's manual check, plus one from Task 13's manual check) with correct titles/images, and that the page doesn't crash. Kill the dev server afterward.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: render Projects section from the database"
```

---

### Task 15: Deploy and verify in production

**Files:** none.

- [ ] **Step 1: Push to main**

```bash
git push origin main
```
This triggers the existing Vercel Git integration to build and deploy to production automatically.

- [ ] **Step 2: Watch the deployment**

Run: `npx vercel ls` repeatedly (or `npx vercel inspect <url>`) until the new deployment's status is `Ready`. If it's `Error`, run `npx vercel logs <url>` and fix the reported issue before continuing — the most likely failure is a missing env var if Task 2 wasn't fully completed for the Production environment.

- [ ] **Step 3: Verify the public site**

Run: `curl -s https://fatih-gray.vercel.app/ | grep -o "PROJECTS"`
Expected: `PROJECTS` (confirms the new section rendered server-side).

- [ ] **Step 4: Verify the admin flow end-to-end in production**

Using the `run` skill's browser-driven pattern, navigate to `https://fatih-gray.vercel.app/admin/login`, log in with the real credentials, confirm `/admin` lists the seeded projects, and take a screenshot of both `/admin` and `/` to confirm the dynamic Projects section matches what's in the database. This is the spec's manual test plan (login → create → appears on `/` → edit → delete → confirm removal) run once for real; do at least the login + list-view check here, and the fuller create/edit/delete pass if time allows.
