import "dotenv/config";
import { defineConfig } from "prisma/config";

// `prisma generate` must work even when the optional cloud database is disabled.
// Migrations/runtime should receive the real DATABASE_URL in production.
const databaseUrl = process.env.DATABASE_URL ?? "postgresql://838:838@127.0.0.1:5432/838";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: databaseUrl },
});
