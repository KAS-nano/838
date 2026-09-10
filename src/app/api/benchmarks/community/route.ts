import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { validateCommunityBenchmark, type SanitizedCommunityBenchmark } from "@/features/benchmarks/community";
import { benchmarkFingerprint, type BenchmarkProtocolV2, type ValidatedBenchmarkV2 } from "@/features/benchmarks/protocol-v2";
import { verifySignedBenchmark } from "@/features/benchmarks/verifier";
import { assertAllowedOrigin, errorResponse, HttpError, parseJsonWithLimit, rateLimit, requestId } from "@/server/http";

const noStoreHeaders = (id: string) => ({ "Cache-Control": "no-store", "X-Request-Id": id });

export async function POST(request: Request) {
  const id = requestId(request);
  try {
    if (process.env.COMMUNITY_BENCHMARKS_ENABLED !== "true") {
      throw new HttpError(503, "feature_disabled", "Envio comunitário está desativado nesta instalação.");
    }
    assertAllowedOrigin(request);
    rateLimit(request, { name: "community-benchmark", limit: 5, windowMs: 60_000 });
    const body = await parseJsonWithLimit(request, 16 * 1024);

    const signed = verifySignedBenchmark(body);
    const legacy = signed.ok ? null : validateCommunityBenchmark(body);
    if (!signed.ok && !legacy?.ok) {
      return NextResponse.json(
        { error: "Benchmark inválido.", code: "invalid_benchmark", requestId: id, details: signed.errors },
        { status: 400, headers: noStoreHeaders(id) },
      );
    }
    if (!process.env.DATABASE_URL) throw new HttpError(503, "database_unavailable", "Banco comunitário não configurado.");

    let payload: ValidatedBenchmarkV2 | SanitizedCommunityBenchmark;
    if (signed.ok) payload = signed.value;
    else if (legacy?.ok) payload = legacy.value;
    else throw new HttpError(400, "invalid_benchmark", "Benchmark inválido.");

    const fingerprint = signed.ok
      ? benchmarkFingerprint(Object.fromEntries(Object.entries(signed.value).filter(([key]) => key !== "summary")) as BenchmarkProtocolV2)
      : createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    const { getPrisma } = await import("@/lib/prisma");
    const prisma = getPrisma();
    const duplicate = await prisma.communitySubmission.findUnique({ where: { fingerprint } });
    if (duplicate) {
      return NextResponse.json(
        { id: duplicate.id, status: duplicate.status, verified: duplicate.verified, duplicate: true },
        { status: 200, headers: noStoreHeaders(id) },
      );
    }

    if (signed.ok) {
      const dailyCount = await prisma.communitySubmission.count({
        where: { installationKeyId: signed.installationKeyId, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60_000) } },
      });
      if (dailyCount >= 20) {
        const error = new HttpError(429, "daily_limit", "Limite diário de benchmarks desta instalação atingido.");
        Object.assign(error, { retryAfter: 24 * 60 * 60 });
        throw error;
      }
    }

    let record;
    try {
      record = await prisma.communitySubmission.create({ data: {
        fingerprint,
        payload,
        status: signed.ok ? "pending" : "quarantined",
        reasonCode: signed.ok ? null : "legacy_unverified",
        protocolVersion: signed.ok ? 2 : 1,
        verified: signed.ok,
        installationKeyId: signed.ok ? signed.installationKeyId : null,
      } });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        const existing = await prisma.communitySubmission.findUnique({ where: { fingerprint } });
        if (existing) {
          return NextResponse.json(
            { id: existing.id, status: existing.status, verified: existing.verified, duplicate: true },
            { status: 200, headers: noStoreHeaders(id) },
          );
        }
      }
      throw error;
    }
    return NextResponse.json(
      { id: record.id, status: record.status, verified: record.verified },
      { status: 202, headers: noStoreHeaders(id) },
    );
  } catch (error) {
    return errorResponse(error, id);
  }
}
