export type OllamaUsage = {
  model?: string;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
};

export type LocalBenchmarkResult = {
  model: string;
  generationTps: number | null;
  promptTps: number | null;
  totalSeconds: number | null;
  loadSeconds: number | null;
  evalCount: number;
  promptCount: number;
  source: "ollama-local";
  measured: true;
};

const seconds = (ns: unknown) => typeof ns === "number" && ns > 0 ? ns / 1_000_000_000 : null;

export function usageToBenchmark(value: OllamaUsage): LocalBenchmarkResult {
  const evalSeconds = seconds(value.eval_duration);
  const promptSeconds = seconds(value.prompt_eval_duration);
  const total = seconds(value.total_duration);
  const load = seconds(value.load_duration);
  const evalCount = typeof value.eval_count === "number" ? value.eval_count : 0;
  const promptCount = typeof value.prompt_eval_count === "number" ? value.prompt_eval_count : 0;
  return {
    model: value.model || "desconhecido",
    generationTps: evalSeconds && evalCount ? +(evalCount / evalSeconds).toFixed(2) : null,
    promptTps: promptSeconds && promptCount ? +(promptCount / promptSeconds).toFixed(2) : null,
    totalSeconds: total ? +total.toFixed(3) : null,
    loadSeconds: load ? +load.toFixed(3) : null,
    evalCount,
    promptCount,
    source: "ollama-local",
    measured: true,
  };
}

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function parseLocalRuntimeEndpoint(baseUrl: string, allowedPorts = [11434, 1234]) {
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new Error("Endpoint local inválido.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Use somente HTTP ou HTTPS.");
  if (!LOOPBACK_HOSTS.has(url.hostname)) throw new Error("O endpoint deve usar um endereço local permitido.");
  if (url.username || url.password) throw new Error("Credenciais não são permitidas na URL.");
  if (url.search || url.hash || (url.pathname !== "/" && url.pathname !== "")) throw new Error("Informe apenas a origem do runtime local.");
  const port = Number(url.port || (url.protocol === "https:" ? 443 : 80));
  if (!allowedPorts.includes(port)) throw new Error("Porta do runtime local não permitida.");
  return url.origin;
}

export async function runOllamaBenchmark(
  model: string,
  baseUrl = "http://127.0.0.1:11434",
  fetcher: typeof fetch = fetch,
  signal?: AbortSignal,
) {
  if (!model.trim()) throw new Error("Informe um modelo instalado no Ollama.");
  const origin = parseLocalRuntimeEndpoint(baseUrl, [11434]);
  const timeout = AbortSignal.timeout(120_000);
  const combinedSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
  const response = await fetcher(`${origin}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: "Explique em poucas frases por que medir desempenho local ajuda a escolher um modelo de IA.",
      stream: false,
      think: false,
      keep_alive: "2m",
      options: { temperature: 0, num_predict: 64 },
    }),
    redirect: "error",
    signal: combinedSignal,
  });
  if (!response.ok) throw new Error(`Ollama respondeu ${response.status}`);
  const announced = Number(response.headers.get("content-length"));
  if (Number.isFinite(announced) && announced > 256 * 1024) throw new Error("Resposta do Ollama excede o limite.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > 256 * 1024) throw new Error("Resposta do Ollama excede o limite.");
  const payload = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as OllamaUsage;
  return usageToBenchmark(payload);
}
