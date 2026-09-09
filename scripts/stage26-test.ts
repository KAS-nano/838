import { seedModels } from "../src/data/seed-models";
import { catalogCandidateHash, validateCatalogCandidate, verifyArtifactLink } from "../src/server/catalog/snapshot";

async function main() {
  const candidate = {
    version: "seed-1",
    generatedAt: "2026-09-09T00:00:00.000Z",
    sourceUrls: ["https://huggingface.co"],
    models: seedModels,
    artifacts: [{ modelId: "qwen3-8b", filename: "model.gguf", format: "GGUF", quantization: "Q4_K_M", bytes: 10, sha256: "a".repeat(64), url: "https://huggingface.co/model.gguf", publisher: "Qwen", community: false }],
  };
  const valid = validateCatalogCandidate(candidate);
  const invalid = validateCatalogCandidate({ ...candidate, artifacts: [{ ...candidate.artifacts[0], modelId: "missing", url: "http://invalid.test/file" }] });
  const redirect = await verifyArtifactLink("https://example.test/model", async () => new Response(null, { status: 302 }));
  const failed = await verifyArtifactLink("https://example.test/model", async () => { throw new Error("offline"); });
  const tests: [string, boolean][] = [
    ["valid candidate", valid.ok],
    ["stable hash", catalogCandidateHash(candidate) === catalogCandidateHash({ ...candidate })],
    ["missing model rejected", "errors" in invalid && invalid.errors.some((error) => error.includes("modelo ausente"))],
    ["HTTP artifact rejected", "errors" in invalid && invalid.errors.some((error) => error.includes("sem HTTPS"))],
    ["redirect considered available", redirect.available && redirect.status === 302],
    ["network failure contained", !failed.available && failed.status === 0],
  ];
  let hasFailure = false;
  for (const [name, passed] of tests) {
    console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
    if (!passed) hasFailure = true;
  }
  if (hasFailure) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
