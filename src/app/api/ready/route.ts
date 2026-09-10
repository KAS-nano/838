import { getPrisma } from "@/lib/prisma";
import { requestId } from "@/server/http";
import { operationalLog, safeErrorType } from "@/server/observability/logger";
import { requiredDependencies } from "@/server/observability/readiness";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const startedAt = Date.now();
  const id = requestId(request);
  const { databaseRequired } = requiredDependencies(process.env);
  let database: "not-required" | "up" | "down" = "not-required";
  let status = 200;
  let errorType: string | undefined;
  if (databaseRequired) {
    try { await getPrisma().$queryRaw`SELECT 1`; database = "up"; }
    catch (error) { database = "down"; status = 503; errorType = safeErrorType(error); }
  }
  operationalLog({ level: status === 200 ? "info" : "error", event: status === 200 ? "http_request" : "dependency_failure", requestId: id, route: "/api/ready", status, durationMs: Date.now() - startedAt, provider: databaseRequired ? "postgresql" : undefined, errorType });
  return Response.json({ status: status === 200 ? "ready" : "not_ready", service: "838", dependencies: { database } }, { status, headers: { "Cache-Control": "no-store", "X-Request-Id": id } });
}
