import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { validateCommunityBenchmark } from "@/features/benchmarks/community";
import { assertAllowedOrigin, errorResponse, HttpError, parseJsonWithLimit, rateLimit, requestId } from "@/server/http";

export async function POST(request: Request) {
  const id = requestId(request);
  try {
  if (process.env.COMMUNITY_BENCHMARKS_ENABLED !== "true") {
    throw new HttpError(503, "feature_disabled", "Envio comunitário está desativado nesta instalação.");
  }
  assertAllowedOrigin(request);
  rateLimit(request, { name: "community-benchmark", limit: 5, windowMs: 60_000 });
  const body = await parseJsonWithLimit(request, 16 * 1024);

  const parsed = validateCommunityBenchmark(body);
  if (!parsed.ok) return NextResponse.json({ error: "Benchmark inválido.", code: "invalid_benchmark", requestId: id, details: parsed.errors }, { status: 400, headers: { "Cache-Control": "no-store", "X-Request-Id": id } });

  if (!process.env.DATABASE_URL) {
    throw new HttpError(503, "database_unavailable", "Banco comunitário não configurado.");
  }

  const canonical = JSON.stringify(parsed.value);
  const fingerprint = createHash("sha256").update(canonical).digest("hex");
  const { getPrisma } = await import("@/lib/prisma");
  const prisma = getPrisma();
  const duplicate = await prisma.communitySubmission.findUnique({ where: { fingerprint } });
  if (duplicate) throw new HttpError(409, "duplicate_submission", "Este benchmark já foi enviado.");
  let record;
  try {
    record = await prisma.communitySubmission.create({ data: { fingerprint, payload: parsed.value, status: "pending" } });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      throw new HttpError(409, "duplicate_submission", "Este benchmark já foi enviado.");
    }
    throw error;
  }
  return NextResponse.json({ id: record.id, status: record.status }, { status: 202, headers: { "Cache-Control": "no-store", "X-Request-Id": id } });
  } catch (error) {
    return errorResponse(error, id);
  }
}
