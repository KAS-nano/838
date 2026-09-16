import ClientPage from "./client";
import { loadCatalog } from "@/server/catalog/load";

export const dynamic = "force-dynamic";

export default async function Page() {
  const catalog = await loadCatalog();
  return <><p className="page-container text-sm text-muted" role="status">{catalog.source === "database" ? "Catálogo persistente" : catalog.source === "seed-fallback" ? "Catálogo indisponível: usando dados locais de demonstração." : "Catálogo local de demonstração"}. Requisitos e desempenho continuam estimados.</p><ClientPage catalogModels={catalog.models} /></>;
}
