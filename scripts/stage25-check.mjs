import fs from "node:fs";

const schema = fs.readFileSync("prisma/schema.prisma", "utf8");
const migration = fs.readFileSync("prisma/migrations/20260909000000_initial/migration.sql", "utf8");
const repository = fs.readFileSync("src/server/repositories/catalog-repository.ts", "utf8");
const route = fs.readFileSync("src/app/api/catalog/models/route.ts", "utf8");
const seed = fs.readFileSync("src/data/seed-models.ts", "utf8");
const tests = [
  ["catalog persistence models", ["ModelSource", "ModelArtifact", "ModelCapability", "ModelLicense", "CatalogSnapshot", "DataProvenance"].every((name) => schema.includes(`model ${name}`))],
  ["artifact lookup index", schema.includes("@@index([modelId, format, quantization, availability])")],
  ["initial migration", migration.includes('CREATE TABLE "AiModel"') && migration.includes('CREATE TABLE "ModelArtifact"')],
  ["Prisma repository", repository.includes("class PrismaCatalogRepository")],
  ["controlled repository selection", repository.includes('CATALOG_SOURCE === "database"')],
  ["seed upsert", repository.includes("upsertSeedCatalog") && repository.includes("aiModel.upsert")],
  ["API seed fallback", route.includes('source: "seed-fallback"')],
  ["versioned API contract", route.includes("schemaVersion: 1") && route.includes("observedAt")],
  ["17 bootstrap models", (seed.match(/{id:"/g) ?? []).length === 17],
];

let failed = false;
for (const [name, passed] of tests) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
  if (!passed) failed = true;
}
if (failed) process.exitCode = 1;
