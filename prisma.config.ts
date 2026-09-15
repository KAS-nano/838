import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ path: ".env.local" });
loadEnv();

// `prisma generate` must work even when the optional cloud database is disabled.
// Migrations/runtime should receive the real DATABASE_URL in production.
const databaseUrl = process.env.DATABASE_URL ?? "postgresql://838:838@127.0.0.1:5432/838";
const shadowDatabaseUrl = process.env.SHADOW_DATABASE_URL?.trim();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: databaseUrl, ...(shadowDatabaseUrl ? { shadowDatabaseUrl } : {}) },
});
