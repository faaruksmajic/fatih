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
