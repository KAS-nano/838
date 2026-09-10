import { createHash, createPublicKey, verify } from "node:crypto";
import { canonicalBenchmark, validateBenchmarkProtocolV2, type BenchmarkProtocolV2, type ValidatedBenchmarkV2 } from "./protocol-v2";

export type SignedBenchmarkSubmission = {
  consent: true;
  benchmark: BenchmarkProtocolV2;
  publicKey: string;
  signature: string;
};

export type BenchmarkVerification =
  | { ok: true; value: ValidatedBenchmarkV2; installationKeyId: string }
  | { ok: false; errors: string[] };

export function benchmarkInstallationKeyId(publicKey: string) {
  const key = createPublicKey(publicKey);
  return createHash("sha256").update(key.export({ type: "spki", format: "der" })).digest("hex");
}

export function verifySignedBenchmark(input: unknown, now = new Date()): BenchmarkVerification {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, errors: ["Submissão assinada inválida."] };
  const submission = input as Record<string, unknown>;
  if (submission.consent !== true) return { ok: false, errors: ["Consentimento explícito é obrigatório."] };
  const parsed = validateBenchmarkProtocolV2(submission.benchmark);
  if ("errors" in parsed) return { ok: false, errors: parsed.errors };
  const errors: string[] = [];
  const measuredAt = Date.parse(parsed.value.measuredAt);
  if (measuredAt > now.getTime() + 5 * 60_000) errors.push("Data da medição está no futuro.");
  if (measuredAt < now.getTime() - 7 * 24 * 60 * 60_000) errors.push("Medição expirada para envio.");
  if (typeof submission.publicKey !== "string" || submission.publicKey.length > 1000) errors.push("Chave pública inválida.");
  if (typeof submission.signature !== "string" || !/^[a-zA-Z0-9+/]+={0,2}$/.test(submission.signature) || submission.signature.length > 200) errors.push("Assinatura inválida.");
  if (errors.length) return { ok: false, errors };
  try {
    const key = createPublicKey(submission.publicKey as string);
    if (key.asymmetricKeyType !== "ed25519") return { ok: false, errors: ["A instalação deve usar uma chave Ed25519."] };
    const valid = verify(null, Buffer.from(canonicalBenchmark(submission.benchmark as BenchmarkProtocolV2)), key, Buffer.from(submission.signature as string, "base64"));
    if (!valid) return { ok: false, errors: ["Assinatura da medição não confere."] };
    const installationKeyId = benchmarkInstallationKeyId(submission.publicKey as string);
    if (parsed.value.installationId !== installationKeyId) return { ok: false, errors: ["Identificador da instalação não corresponde à chave."] };
    return { ok: true, value: parsed.value, installationKeyId };
  } catch {
    return { ok: false, errors: ["Chave pública ou assinatura inválida."] };
  }
}
