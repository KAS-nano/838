export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function requestId(request: Request) {
  const incoming = request.headers.get("x-request-id")?.trim();
  return incoming && /^[a-zA-Z0-9._-]{8,128}$/.test(incoming)
    ? incoming
    : crypto.randomUUID();
}

export function jsonResponse(
  body: unknown,
  init: ResponseInit = {},
  id?: string,
) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  if (id) headers.set("X-Request-Id", id);
  return new Response(JSON.stringify(body), { ...init, headers });
}

export function errorResponse(error: unknown, id: string) {
  const known = error instanceof HttpError;
  const status = known ? error.status : 500;
  const code = known ? error.code : "internal_error";
  if (!known) console.error(`[${id}]`, error);
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  const retryAfter = known && status === 429
    ? (error as HttpError & { retryAfter?: number }).retryAfter
    : undefined;
  if (retryAfter) headers["Retry-After"] = String(retryAfter);
  return jsonResponse(
    { error: known ? error.message : "Falha interna.", code, requestId: id },
    { status, headers },
    id,
  );
}
