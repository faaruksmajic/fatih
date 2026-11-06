import { pgTable, uuid, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

/** A category name per site language; only Bosnian is required, the rest fall back to it. */
export type CategoryNames = { bs: string; en?: string; de?: string; tr?: string; ar?: string };

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  names: jsonb("names").$type<CategoryNames>().notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  /** Legacy free-text category, kept in sync with the category's Bosnian name as a fallback. */
  category: text("category").notNull(),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
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

export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1),
  cvUrl: text("cv_url"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
