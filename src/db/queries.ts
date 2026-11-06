import { asc, count, eq, inArray } from "drizzle-orm";
import { db } from "./client";
import { categories, projectImages, projects, siteSettings, type CategoryNames } from "./schema";
import type { ProjectFormInput } from "@/lib/validation";
import type { Category } from "@/lib/categories";

export type ProjectWithImages = {
  id: string;
  title: string;
  description: string;
  /** Legacy text category, shown only when the project has no linked category. */
  category: string;
  categoryId: string | null;
  categoryNames: CategoryNames | null;
  coverImage: string;
  position: number;
  images: { id: string; imageUrl: string }[];
};

/** Project columns plus the linked category's names. */
const projectRow = {
  id: projects.id,
  title: projects.title,
  description: projects.description,
  category: projects.category,
  categoryId: projects.categoryId,
  categoryNames: categories.names,
  coverImage: projects.coverImage,
  position: projects.position,
};

export async function getProjects(): Promise<ProjectWithImages[]> {
  const rows = await db
    .select(projectRow)
    .from(projects)
    .leftJoin(categories, eq(projects.categoryId, categories.id))
    .orderBy(asc(projects.position), asc(projects.createdAt));
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);
  const images = await db
    .select()
    .from(projectImages)
    .where(inArray(projectImages.projectId, ids))
    .orderBy(asc(projectImages.position));

  return rows.map((row) => ({
    ...row,
    images: images
      .filter((img) => img.projectId === row.id)
      .map((img) => ({ id: img.id, imageUrl: img.imageUrl })),
  }));
}

export async function getProjectsSafe(): Promise<ProjectWithImages[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    return await getProjects();
  } catch (error) {
    console.error("Failed to load projects:", error);
    return [];
  }
}

export async function getProjectWithImages(id: string): Promise<ProjectWithImages | null> {
  const [row] = await db
    .select(projectRow)
    .from(projects)
    .leftJoin(categories, eq(projects.categoryId, categories.id))
    .where(eq(projects.id, id));
  if (!row) return null;

  const images = await db
    .select()
    .from(projectImages)
    .where(eq(projectImages.projectId, id))
    .orderBy(asc(projectImages.position));

  return {
    ...row,
    images: images.map((img) => ({ id: img.id, imageUrl: img.imageUrl })),
  };
}

/** The Bosnian name of a category, kept in the legacy text column. */
async function legacyCategoryText(categoryId: string): Promise<string> {
  const [row] = await db.select({ names: categories.names }).from(categories).where(eq(categories.id, categoryId));
  if (!row) throw new Error("Category not found");
  return row.names.bs;
}

export async function createProject(input: ProjectFormInput): Promise<string> {
  const existing = await db.select({ id: projects.id }).from(projects);
  const category = await legacyCategoryText(input.categoryId);

  const [created] = await db
    .insert(projects)
    .values({
      title: input.title,
      description: input.description,
      category,
      categoryId: input.categoryId,
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
  const category = await legacyCategoryText(input.categoryId);
  await db
    .update(projects)
    .set({
      title: input.title,
      description: input.description,
      category,
      categoryId: input.categoryId,
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

/* ───────────── Categories ───────────── */

export type CategoryWithCount = Category & { position: number; projectCount: number };

export async function getCategories(): Promise<CategoryWithCount[]> {
  const rows = await db
    .select({
      id: categories.id,
      names: categories.names,
      position: categories.position,
      projectCount: count(projects.id),
    })
    .from(categories)
    .leftJoin(projects, eq(projects.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.position), asc(categories.createdAt));
  return rows.map((row) => ({ ...row, projectCount: Number(row.projectCount) }));
}

export async function getCategoriesSafe(): Promise<CategoryWithCount[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    return await getCategories();
  } catch (error) {
    console.error("Failed to load categories:", error);
    return [];
  }
}

export async function getCategory(id: string): Promise<Category | null> {
  const [row] = await db.select({ id: categories.id, names: categories.names }).from(categories).where(eq(categories.id, id));
  return row ?? null;
}

export async function createCategory(names: CategoryNames): Promise<string> {
  const [{ total }] = await db.select({ total: count() }).from(categories);
  const [created] = await db
    .insert(categories)
    .values({ names, position: Number(total) })
    .returning({ id: categories.id });
  return created.id;
}

/** Renames a category and keeps its projects' legacy text in step. */
export async function updateCategory(id: string, names: CategoryNames): Promise<void> {
  await db.update(categories).set({ names }).where(eq(categories.id, id));
  await db.update(projects).set({ category: names.bs }).where(eq(projects.categoryId, id));
}

/** Deletes a category only when no project uses it; returns false otherwise. */
export async function deleteCategory(id: string): Promise<boolean> {
  const [{ used }] = await db.select({ used: count() }).from(projects).where(eq(projects.categoryId, id));
  if (Number(used) > 0) return false;
  await db.delete(categories).where(eq(categories.id, id));
  return true;
}

/** Swaps a category with its neighbour in the display order. */
export async function moveCategory(id: string, direction: "up" | "down"): Promise<void> {
  const list = await db
    .select({ id: categories.id })
    .from(categories)
    .orderBy(asc(categories.position), asc(categories.createdAt));
  const from = list.findIndex((row) => row.id === id);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from === -1 || to < 0 || to >= list.length) return;
  [list[from], list[to]] = [list[to], list[from]];
  await Promise.all(
    list.map((row, position) => db.update(categories).set({ position }).where(eq(categories.id, row.id))),
  );
}

export async function getCvUrl(): Promise<string | null> {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
  return row?.cvUrl ?? null;
}

export async function getCvUrlSafe(): Promise<string | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    return await getCvUrl();
  } catch (error) {
    console.error("Failed to load CV URL:", error);
    return null;
  }
}

export async function setCvUrl(url: string): Promise<void> {
  await db
    .insert(siteSettings)
    .values({ id: 1, cvUrl: url })
    .onConflictDoUpdate({
      target: siteSettings.id,
      set: { cvUrl: url, updatedAt: new Date() },
    });
}
