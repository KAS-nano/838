import { randomUUID } from "node:crypto";
import { getCatalogRepository, SeedCatalogRepository, type CatalogRepository } from "../repositories/catalog-repository";
import { operationalLog, safeErrorType } from "../observability/logger";

export async function loadCatalog(repository: CatalogRepository = getCatalogRepository()) {
  const startedAt = Date.now();
  const source = process.env.CATALOG_SOURCE === "database" ? "database" : "seed";
  try {
    const models = await repository.listModels();
    if (!models.length || models.some(model => !model.variants.length)) throw new Error("Invalid catalog");
    return { models, source, dataState: source === "database" ? "persisted" : "seed" };
  } catch (error) {
    operationalLog({ requestId: randomUUID(), route: "catalog", status: 200, durationMs: Date.now() - startedAt, level: "error", event: "dependency_failure", provider: "postgresql", errorType: safeErrorType(error) });
    return { models: await new SeedCatalogRepository().listModels(), source: "seed-fallback", dataState: "seed" };
  }
}
