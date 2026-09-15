export function withTimeout<T>(operation: (signal: AbortSignal) => Promise<T>, timeoutMs: number, message = "Tempo limite excedido.") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error(message)), timeoutMs);
  return Promise.resolve(operation(controller.signal)).finally(() => clearTimeout(timeout));
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 8_000,
  fetcher: typeof fetch = fetch,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error("Tempo limite excedido.")), timeoutMs);
  try {
    const signal = init.signal ? AbortSignal.any([init.signal, controller.signal]) : controller.signal;
    const response = await fetcher(input, { ...init, signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export async function readJsonWithLimit(response: Response, maxBytes = 2_000_000) {
  const announced = Number(response.headers.get("content-length"));
  if (Number.isFinite(announced) && announced > maxBytes) throw new Error("Resposta externa excede o limite.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > maxBytes) throw new Error("Resposta externa excede o limite.");
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as unknown;
}
