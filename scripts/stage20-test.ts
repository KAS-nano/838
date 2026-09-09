import { parseLocalRuntimeEndpoint, usageToBenchmark, runOllamaBenchmark } from "../src/features/benchmarks/local-runner";

async function main() {
  const m = usageToBenchmark({
    model: "x",
    eval_count: 50,
    eval_duration: 2_000_000_000,
    prompt_eval_count: 100,
    prompt_eval_duration: 500_000_000,
    total_duration: 3_000_000_000,
    load_duration: 100_000_000,
  });

  const captured: { url: string; body: { options: { num_predict: number }; stream: boolean } }[] = [];
  const fakeFetch: typeof fetch = async (url, init) => {
    captured.push({ url: String(url), body: JSON.parse(String(init?.body)) });
    return Response.json({
        model: "x",
        eval_count: 64,
        eval_duration: 1_000_000_000,
        prompt_eval_count: 32,
        prompt_eval_duration: 200_000_000,
        total_duration: 2_000_000_000,
    });
  };

  const r = await runOllamaBenchmark("x", "http://127.0.0.1:11434", fakeFetch);
  const tests: [string, boolean][] = [
    ["generation math", m.generationTps === 25],
    ["prompt math", m.promptTps === 200],
    ["seconds conversion", m.totalSeconds === 3],
    ["local endpoint", captured[0]?.url === "http://127.0.0.1:11434/api/generate"],
    ["short max tokens", captured[0]?.body.options.num_predict === 64],
    ["non streaming", captured[0]?.body.stream === false],
    ["measured flag", r.measured === true && r.generationTps === 64],
    ["loopback permitido", parseLocalRuntimeEndpoint("http://localhost:11434") === "http://localhost:11434"],
  ];

  for (const endpoint of ["file:///tmp/socket", "http://example.com:11434", "http://user:pass@localhost:11434", "http://localhost:9999", "http://localhost:11434/path"]) {
    try {
      parseLocalRuntimeEndpoint(endpoint);
      tests.push([`endpoint rejeitado: ${endpoint}`, false]);
    } catch {
      tests.push([`endpoint rejeitado: ${endpoint}`, true]);
    }
  }

  let failed = false;
  for (const [name, passed] of tests) {
    console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
    if (!passed) failed = true;
  }
  if (failed) throw new Error("stage20 failed");
}

main().catch((error) => {
  console.error(error);
  throw error;
});
