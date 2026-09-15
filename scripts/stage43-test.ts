import { seedApiModels } from "../src/data/seed-api-models";
import { seedModels } from "../src/data/seed-models";
import { demoHardwareProfile } from "../src/features/profile/local-store";
import { recommendHybrid } from "../src/features/recommendation/hybrid";
import { scenarioExplanations, scenarioPresets, validateScenario, type RecommendationScenario } from "../src/features/recommendation/scenario";

const failures: string[] = [];
const check = (name: string, pass: boolean) => { console.log(`${pass ? "PASS" : "FAIL"} ${name}`); if (!pass) failures.push(name); };
const short = scenarioPresets.find((item) => item.id === "short-chat")!;
const batch = scenarioPresets.find((item) => item.id === "batch")!;
const quality = { ...short, priority: "quality" as const };
const privacy = { ...short, priority: "privacy" as const };
const longResponse = { ...short, responseTokens: 4096 };
const shortRanking = recommendHybrid(demoHardwareProfile, short.objective, seedModels, seedApiModels, short);
const batchRanking = recommendHybrid(demoHardwareProfile, batch.objective, seedModels, seedApiModels, batch);
const qualityRanking = recommendHybrid(demoHardwareProfile, quality.objective, seedModels, seedApiModels, quality);
const privacyRanking = recommendHybrid(demoHardwareProfile, privacy.objective, seedModels, seedApiModels, privacy);
const longRanking = recommendHybrid(demoHardwareProfile, longResponse.objective, seedModels, seedApiModels, longResponse);
const average = (items: typeof shortRanking, mode: "local" | "api") => items.filter((item) => item.mode === mode).reduce((sum, item) => sum + item.score, 0) / items.filter((item) => item.mode === mode).length;

check("six valid versioned presets", scenarioPresets.length === 6 && scenarioPresets.every((item) => item.version === 1 && validateScenario(item).id === item.id));
check("scenario explanations include all inputs", scenarioExplanations(short).join(" ").includes("512") && scenarioExplanations(short).join(" ").includes("8K"));
check("concurrency favors API capacity", average(batchRanking, "api") > average(shortRanking, "api") && average(batchRanking, "local") < average(shortRanking, "local"));
check("privacy shifts score from API to local", average(privacyRanking, "local") >= average(qualityRanking, "local") && average(privacyRanking, "api") < average(qualityRanking, "api") && average(privacyRanking, "local") - average(privacyRanking, "api") > average(qualityRanking, "local") - average(qualityRanking, "api"));
check("long responses explain local resource cost", longRanking.some((item) => item.mode === "local" && item.scenarioReasons.some((reason) => reason.includes("Respostas longas"))));
check("scores remain sorted and bounded", [shortRanking, batchRanking, privacyRanking].every((ranking) => ranking.every((item, index) => item.score >= 0 && item.score <= 100 && (index === 0 || ranking[index - 1].score >= item.score))));
for (const scenario of [{ ...short, version: 2 }, { ...short, contextK: 0 }, { ...short, responseTokens: 63 }, { ...short, concurrency: 65 }, { ...short, id: "unknown" }]) {
  try { validateScenario(scenario as RecommendationScenario); failures.push("invalid scenario accepted"); } catch { /* expected */ }
}
check("invalid ranges and preset IDs rejected", !failures.includes("invalid scenario accepted"));
if (failures.length) throw new Error(`stage43 failed: ${failures.join(", ")}`);
