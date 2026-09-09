import { listOpenRouterModels } from "@/features/integrations/openrouter";
import { errorResponse, HttpError, jsonResponse, rateLimit, requestId } from "@/server/http";

export async function GET(request: Request) {
  const id = requestId(request);
  try {
    rateLimit(request, { name: "openrouter", limit: 10, windowMs: 60_000 });
    const models = await listOpenRouterModels(process.env.OPENROUTER_API_KEY);
    return jsonResponse(
      { source: "openrouter", models: models.slice(0, 100), fetchedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=900" } },
      id,
    );
  } catch (error) {
    if (!(error instanceof HttpError)) console.error(`[${id}] OpenRouter indisponível`, error);
    return errorResponse(error instanceof HttpError ? error : new HttpError(502, "upstream_error", "OpenRouter indisponível."), id);
  }
}
