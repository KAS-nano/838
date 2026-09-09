import { getCatalogRepository, SeedCatalogRepository } from "@/server/repositories/catalog-repository";
import { jsonResponse, requestId } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const id = requestId(request);
  const selected = process.env.CATALOG_SOURCE === "database" ? "database" : "seed";
  try {
    const models = await getCatalogRepository().listModels();
    return jsonResponse(
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
    );
  } catch (error) {
    console.error(`[${id}] Catálogo persistente indisponível`, error);
    const models = await new SeedCatalogRepository().listModels();
    return jsonResponse(
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
    );
  }
}
