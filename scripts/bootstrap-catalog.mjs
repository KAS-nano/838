import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
loadEnv();

const { upsertSeedCatalog } = await import("../src/server/repositories/catalog-repository.ts");

const first = await upsertSeedCatalog();
const second = await upsertSeedCatalog();
console.log(`bootstrap1 ${first}`);
console.log(`bootstrap2 ${second}`);
