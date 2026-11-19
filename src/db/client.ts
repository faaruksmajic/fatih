import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Without DATABASE_URL (local preview) the *Safe queries never reach the
// database; a placeholder keeps this module from throwing on import.
const sql = neon(
  process.env.DATABASE_URL ?? "postgresql://preview:preview@localhost/none",
);
export const db = drizzle(sql, { schema });
