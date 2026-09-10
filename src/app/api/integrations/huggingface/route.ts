import { searchHuggingFaceModels } from "@/features/integrations/huggingface";
import { errorResponse, HttpError, jsonResponse, rateLimit, requestId } from "@/server/http";

export async function GET(request: Request) {
  const startedAt = Date.now();
  const id = requestId(request);
  try {
    rateLimit(request, { name: "huggingface", limit: 20, windowMs: 60_000 });
    const q = new URL(request.url).searchParams.get("q")?.trim() || "GGUF";
    if (q.length < 2 || q.length > 80) throw new HttpError(400, "invalid_query", "A busca deve ter entre 2 e 80 caracteres.");
    const models = await searchHuggingFaceModels(q, 12);
    return jsonResponse(
      { source: "huggingface", query: q, models, fetchedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=1800" } },
      id,
    );
  } catch (error) {
    return errorResponse(error instanceof HttpError ? error : new HttpError(502, "upstream_error", "Hugging Face indisponível."), id, { route: "/api/integrations/huggingface", startedAt, provider: "huggingface" });
  }
}
