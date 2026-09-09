import type { AiModel, ModelModality, ModelVariant, Quantization } from "../../features/catalog/types";
import type { Objective } from "../../features/onboarding/types";
import { objectives } from "../../features/onboarding/types";
import { seedModels } from "../../data/seed-models";
import { getPrisma } from "../../lib/prisma";

export interface CatalogRepository {
  listModels(): Promise<AiModel[]>;
  getModel(id: string): Promise<AiModel | undefined>;
}

export class SeedCatalogRepository implements CatalogRepository {
  async listModels() { return seedModels; }
  async getModel(id: string) { return seedModels.find((model) => model.id === id); }
}

type DatabaseModel = {
  id: string;
  name: string;
  family: string;
  paramsB: number;
  activeParamsB: number | null;
  contextK: number;
  license: string;
  source: string;
  sourceUrl: string | null;
  description: string;
  modalities: string[];
  objectives: string[];
  benchmarkClass: string;
  variants: Array<{
    quantization: string;
    diskGb: number;
    weightVramGb: number;
    qualityFactor: number;
  }>;
};

const quantizations = new Set<Quantization>(["Q8_0", "Q6_K", "Q5_K_M", "Q4_K_M", "Q3_K_M"]);
const modalities = new Set<ModelModality>(["text", "vision", "audio", "video"]);
const benchmarkClasses = new Set<AiModel["benchmarkClass"]>(["small", "medium", "large", "moe"]);

export function databaseModelToCatalogModel(model: DatabaseModel): AiModel {
  if (!benchmarkClasses.has(model.benchmarkClass as AiModel["benchmarkClass"])) throw new Error(`Classe inválida no modelo ${model.id}.`);
  if (!model.modalities.every((value) => modalities.has(value as ModelModality))) throw new Error(`Modalidade inválida no modelo ${model.id}.`);
  if (!model.objectives.every((value) => objectives.includes(value as Objective))) throw new Error(`Objetivo inválido no modelo ${model.id}.`);
  if (!model.variants.every((variant) => quantizations.has(variant.quantization as Quantization))) throw new Error(`Quantização inválida no modelo ${model.id}.`);
  return {
    id: model.id,
    name: model.name,
    family: model.family,
    paramsB: model.paramsB,
    activeParamsB: model.activeParamsB ?? undefined,
    contextK: model.contextK,
    license: model.license,
    source: model.source,
    sourceUrl: model.sourceUrl ?? undefined,
    description: model.description,
    modalities: model.modalities as ModelModality[],
    objectives: model.objectives as Objective[],
    benchmarkClass: model.benchmarkClass as AiModel["benchmarkClass"],
    variants: model.variants.map((variant): ModelVariant => ({
      quantization: variant.quantization as Quantization,
      diskGb: variant.diskGb,
      weightVramGb: variant.weightVramGb,
      qualityFactor: variant.qualityFactor,
    })),
  };
}

export class PrismaCatalogRepository implements CatalogRepository {
  async listModels() {
    const rows = await getPrisma().aiModel.findMany({ include: { variants: true }, orderBy: [{ family: "asc" }, { paramsB: "asc" }] });
    return rows.map(databaseModelToCatalogModel);
  }

  async getModel(id: string) {
    const row = await getPrisma().aiModel.findUnique({ where: { id }, include: { variants: true } });
    return row ? databaseModelToCatalogModel(row) : undefined;
  }
}

export function getCatalogRepository(): CatalogRepository {
  return process.env.CATALOG_SOURCE === "database" ? new PrismaCatalogRepository() : new SeedCatalogRepository();
}

export async function upsertSeedCatalog() {
  const prisma = getPrisma();
  for (const model of seedModels) {
    const data = {
      name: model.name,
      family: model.family,
      paramsB: model.paramsB,
      activeParamsB: model.activeParamsB,
      contextK: model.contextK,
      license: model.license,
      source: model.source,
      sourceUrl: model.sourceUrl,
      description: model.description,
      modalities: model.modalities,
      objectives: model.objectives,
      benchmarkClass: model.benchmarkClass,
    };
    await prisma.aiModel.upsert({
      where: { id: model.id },
      create: { id: model.id, ...data, variants: { create: model.variants } },
      update: { ...data, variants: { deleteMany: {}, create: model.variants } },
    });
  }
  return seedModels.length;
}

export const catalogRepository: CatalogRepository = getCatalogRepository();
