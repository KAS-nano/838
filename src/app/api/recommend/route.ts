import { seedModels } from "@/data/seed-models";
import { rankModels } from "@/features/recommendation/engine";
import { objectives, type Objective } from "@/features/onboarding/types";
import { isHardwareProfile } from "@/features/onboarding/validation";
import { errorResponse, HttpError, observedJsonResponse, parseJsonWithLimit, rateLimit, requestId } from "@/server/http";

export async function POST(request: Request) {
  const startedAt = Date.now();
  const id = requestId(request);
  try {
    rateLimit(request, { name: "recommend", limit: 30, windowMs: 60_000 });
    const body = await parseJsonWithLimit(request, 16 * 1024);
  if (!isHardwareProfile(body)) {
    throw new HttpError(400, "invalid_hardware", "Perfil de hardware incompleto ou inválido.");
  }
  const input = body as typeof body & { objective?: unknown; contextK?: unknown; quantization?: unknown };
  if (input.objective !== undefined && (typeof input.objective !== "string" || !objectives.includes(input.objective as Objective))) {
    throw new HttpError(400, "invalid_objective", "Objetivo inválido.");
  }
  const contextK = input.contextK ?? 8;
  if (typeof contextK !== "number" || !Number.isFinite(contextK) || contextK < 1 || contextK > 2048) {
    throw new HttpError(400, "invalid_context", "Contexto inválido.");
  }
  const quantization = input.quantization ?? "Q4_K_M";
  if (typeof quantization !== "string" || !seedModels.some((model) => model.variants.some((variant) => variant.quantization === quantization))) {
    throw new HttpError(400, "invalid_quantization", "Quantização inválida.");
  }
  const objective = (input.objective ?? body.objectives[0]) as Objective;
  const result = rankModels(body, seedModels, objective, quantization, contextK).slice(0, 5).map(({ model, variant, result }) => ({
    model: model.id,
    name: model.name,
    quantization: variant.quantization,
    contextK: Math.min(contextK, model.contextK),
    score: result.score,
    fit: result.fit,
    reasons: result.reasons,
    confidence: result.confidence,
    source: model.source,
  }));
    return observedJsonResponse(
      { objective, source: "838-engine-v1", dataState: "seed", warning: "Requisitos e compatibilidade heurísticos baseados no catálogo seed.", result },
      { headers: { "Cache-Control": "no-store" } },
      id,
      { route: "/api/recommend", startedAt, cacheStatus: "bypass", estimatorVersion: "2.0.0" },
    );
  } catch (error) {
    return errorResponse(error, id, { route: "/api/recommend", startedAt });
  }
}
