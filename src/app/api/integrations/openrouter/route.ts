import { listOpenRouterModels } from "@/features/integrations/openrouter";
import { errorResponse, HttpError, observedJsonResponse, rateLimit, requestId } from "@/server/http";

export async function GET(request: Request) {
  const startedAt = Date.now();
  const id = requestId(request);
  try {
    rateLimit(request, { name: "openrouter", limit: 10, windowMs: 60_000 });
    const models = await listOpenRouterModels(process.env.OPENROUTER_API_KEY);
    return observedJsonResponse(
      { source: "openrouter", models: models.slice(0, 100), fetchedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=900" } },
      id,
      { route: "/api/integrations/openrouter", startedAt, provider: "openrouter", cacheStatus: "miss" },
    );
  } catch (error) {
    return errorResponse(error instanceof HttpError ? error : new HttpError(502, "upstream_error", "OpenRouter indisponível."), id, { route: "/api/integrations/openrouter", startedAt, provider: "openrouter" });
  }
}
