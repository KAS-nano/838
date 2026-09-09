import { HttpError } from "./errors";

export async function parseJsonWithLimit(request: Request, maxBytes: number) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    throw new HttpError(415, "unsupported_media_type", "Use Content-Type application/json.");
  }
  const announced = Number(request.headers.get("content-length"));
  if (Number.isFinite(announced) && announced > maxBytes) {
    throw new HttpError(413, "payload_too_large", "Corpo da requisição excede o limite permitido.");
  }
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength > maxBytes) {
    throw new HttpError(413, "payload_too_large", "Corpo da requisição excede o limite permitido.");
  }
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as unknown;
  } catch {
    throw new HttpError(400, "invalid_json", "JSON inválido.");
  }
}

export function assertAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const allowed = (process.env.APP_ORIGIN ?? process.env.BETTER_AUTH_URL ?? new URL(request.url).origin)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (!allowed.includes(origin)) throw new HttpError(403, "invalid_origin", "Origem não permitida.");
}
