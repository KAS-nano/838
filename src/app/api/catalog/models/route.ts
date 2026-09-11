import { getCatalogRepository, SeedCatalogRepository } from "@/server/repositories/catalog-repository";
import { observedJsonResponse, requestId } from "@/server/http";
import { operationalLog, safeErrorType } from "@/server/observability/logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const startedAt = Date.now();
  const id = requestId(request);
  const selected = process.env.CATALOG_SOURCE === "database" ? "database" : "seed";
  try {
    const models = await getCatalogRepository().listModels();
    return observedJsonResponse(
      {
        schemaVersion: 1,
        source: selected,
        dataState: selected === "database" ? "persisted" : "seed",
        observedAt: new Date().toISOString(),
        warning: selected === "seed" ? "Catálogo inicial curado; sincronização externa deve validar os dados." : undefined,
        models,
      },
      { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
      id,
      { route: "/api/catalog/models", startedAt, provider: selected === "database" ? "postgresql" : undefined, cacheStatus: "miss" },
    );
  } catch (error) {
    operationalLog({ level: "error", event: "dependency_failure", requestId: id, route: "/api/catalog/models", status: 200, durationMs: Date.now() - startedAt, provider: "postgresql", errorType: safeErrorType(error) });
    const models = await new SeedCatalogRepository().listModels();
    return observedJsonResponse(
      {
        schemaVersion: 1,
        source: "seed-fallback",
        dataState: "seed",
        observedAt: new Date().toISOString(),
        warning: "Catálogo persistente temporariamente indisponível; exibindo o último fallback empacotado.",
        models,
      },
      { headers: { "Cache-Control": "public, max-age=30", Warning: '110 - "Response is stale"' } },
      id,
      { route: "/api/catalog/models", startedAt, provider: "postgresql", cacheStatus: "fallback" },
    );
  }
}
