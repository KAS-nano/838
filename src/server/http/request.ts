import { HttpError } from "./errors";

export function validateContentType(request: Request, allowed: string[] = ["application/json"]) {
  const value = request.headers.get("content-type");
  if (!value) {
    throw new HttpError(415, "unsupported_media_type", "Content-Type ausente. Use application/json.");
  }
  const contentType = value.split(";", 1)[0].trim().toLowerCase();
  if (!allowed.includes(contentType)) {
    throw new HttpError(415, "unsupported_media_type", `Tipo de conteúdo não suportado: ${contentType}.`);
  }
  return contentType;
}

export async function parseJsonWithLimit(request: Request, maxBytes: number) {
  validateContentType(request);
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
