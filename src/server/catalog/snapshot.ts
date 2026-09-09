import { createHash } from "node:crypto";
import type { AiModel } from "../../features/catalog/types";

export type CatalogArtifactCandidate = {
  modelId: string;
  filename: string;
  format: string;
  quantization: string;
  bytes?: number;
  sha256?: string;
  url: string;
  publisher: string;
  community: boolean;
  splitGroup?: string;
  verifiedAt?: string;
};

export type CatalogCandidate = {
  version: string;
  generatedAt: string;
  sourceUrls: string[];
  models: AiModel[];
  artifacts: CatalogArtifactCandidate[];
};

export type CatalogValidation = { ok: true; hash: string } | { ok: false; errors: string[] };

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function catalogCandidateHash(candidate: CatalogCandidate) {
  return createHash("sha256").update(canonical(candidate)).digest("hex");
}

export function validateCatalogCandidate(candidate: CatalogCandidate): CatalogValidation {
  const errors: string[] = [];
  if (!/^[a-zA-Z0-9._-]{1,80}$/.test(candidate.version)) errors.push("Versão do snapshot inválida.");
  if (!Number.isFinite(Date.parse(candidate.generatedAt))) errors.push("Data de geração inválida.");
  if (!candidate.models.length) errors.push("Snapshot sem modelos.");
  const ids = new Set<string>();
  for (const model of candidate.models) {
    if (ids.has(model.id)) errors.push(`Modelo duplicado: ${model.id}.`);
    ids.add(model.id);
    if (!model.name.trim() || !model.family.trim() || model.paramsB <= 0 || model.contextK <= 0 || !model.variants.length) errors.push(`Modelo incompleto: ${model.id}.`);
    if (!model.modalities.every((value) => ["text", "vision", "audio", "video"].includes(value))) errors.push(`Modalidade inválida no modelo ${model.id}.`);
    if (!model.variants.every((variant) => ["Q8_0", "Q6_K", "Q5_K_M", "Q4_K_M", "Q3_K_M"].includes(variant.quantization))) errors.push(`Quantização inválida no modelo ${model.id}.`);
  }
  const artifactUrls = new Set<string>();
  for (const artifact of candidate.artifacts) {
    if (!ids.has(artifact.modelId)) errors.push(`Artefato referencia modelo ausente: ${artifact.modelId}.`);
    if (artifactUrls.has(artifact.url)) errors.push(`URL de artefato duplicada: ${artifact.url}.`);
    artifactUrls.add(artifact.url);
    try {
      if (new URL(artifact.url).protocol !== "https:") errors.push(`Artefato sem HTTPS: ${artifact.url}.`);
    } catch {
      errors.push(`URL de artefato inválida: ${artifact.url}.`);
    }
    if (artifact.bytes !== undefined && (!Number.isSafeInteger(artifact.bytes) || artifact.bytes <= 0)) errors.push(`Tamanho inválido: ${artifact.filename}.`);
    if (artifact.sha256 && !/^[a-f0-9]{64}$/i.test(artifact.sha256)) errors.push(`SHA-256 inválido: ${artifact.filename}.`);
  }
  for (const sourceUrl of candidate.sourceUrls) {
    try {
      if (new URL(sourceUrl).protocol !== "https:") errors.push(`Fonte sem HTTPS: ${sourceUrl}.`);
    } catch {
      errors.push(`Fonte inválida: ${sourceUrl}.`);
    }
  }
  return errors.length ? { ok: false, errors } : { ok: true, hash: catalogCandidateHash(candidate) };
}

export async function publishCatalogCandidate(candidate: CatalogCandidate) {
  const validation = validateCatalogCandidate(candidate);
  if ("errors" in validation) throw new Error(`Snapshot rejeitado: ${validation.errors.join(" ")}`);
  const { getPrisma } = await import("../../lib/prisma");
  const prisma = getPrisma();
  return prisma.$transaction(async (transaction) => {
    await transaction.catalogSnapshot.updateMany({ where: { status: "published" }, data: { status: "archived" } });
    for (const model of candidate.models) {
      const data = {
        name: model.name, family: model.family, paramsB: model.paramsB, activeParamsB: model.activeParamsB,
        contextK: model.contextK, license: model.license, source: model.source, sourceUrl: model.sourceUrl,
        description: model.description, modalities: model.modalities, objectives: model.objectives, benchmarkClass: model.benchmarkClass,
      };
      await transaction.aiModel.upsert({
        where: { id: model.id },
        create: { id: model.id, ...data, variants: { create: model.variants } },
        update: { ...data, variants: { deleteMany: {}, create: model.variants } },
      });
      await transaction.modelArtifact.deleteMany({ where: { modelId: model.id } });
      const artifacts = candidate.artifacts.filter((artifact) => artifact.modelId === model.id);
      if (artifacts.length) await transaction.modelArtifact.createMany({ data: artifacts.map((artifact) => ({
        ...artifact,
        bytes: artifact.bytes === undefined ? undefined : BigInt(artifact.bytes),
        verifiedAt: artifact.verifiedAt ? new Date(artifact.verifiedAt) : undefined,
      })) });
    }
    return transaction.catalogSnapshot.create({ data: {
      version: candidate.version,
      generatedAt: new Date(candidate.generatedAt),
      sourceCount: candidate.sourceUrls.length,
      status: "published",
      publishedAt: new Date(),
      validationReport: { hash: validation.hash, modelCount: candidate.models.length, artifactCount: candidate.artifacts.length },
    } });
  });
}

export async function verifyArtifactLink(url: string, fetcher: typeof fetch = fetch) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") return { available: false, status: 0, checkedAt: new Date().toISOString() };
  try {
    const response = await fetcher(parsed, { method: "HEAD", redirect: "manual", signal: AbortSignal.timeout(8_000) });
    return { available: response.ok || (response.status >= 300 && response.status < 400), status: response.status, checkedAt: new Date().toISOString() };
  } catch {
    return { available: false, status: 0, checkedAt: new Date().toISOString() };
  }
}
