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
const transcription = scenarioPresets.find(item => item.id === "transcription")!;
check("text-only catalog cannot recommend transcription", recommendHybrid(demoHardwareProfile, transcription.objective, seedModels, seedApiModels, transcription).length === 0);
const vision = scenarioPresets.find(item => item.id === "vision")!;
check("image recommendations require vision", recommendHybrid(demoHardwareProfile, vision.objective, seedModels, seedApiModels, vision).every(item => item.mode === "local" && seedModels.find(model => model.id === item.modelId)!.modalities.includes("vision")));
const fullContext = recommendHybrid(demoHardwareProfile, short.objective, seedModels, seedApiModels, { ...short, contextK: 256 });
check("256K request excludes smaller windows", fullContext.length > 0 && fullContext.every(item => item.contextK >= 256));
const audioModel = { ...seedModels[0], id: "audio-fixture", modalities: ["audio" as const], objectives: ["Transcrição" as const] };
check("audio-capable model remains eligible", recommendHybrid(demoHardwareProfile, transcription.objective, [audioModel], [], transcription).some(item => item.modelId === audioModel.id));
const fixtures = [
  { ...seedApiModels[0], id: "cheap", name: "Cheap", inputUsdPerM: .01, outputUsdPerM: .01, benchmark: { outputTokensPerSecond: 20, timeToFirstTokenMs: 400, source: "fixture", date: "2026-09-16", confidence: "low" as const } },
  { ...seedApiModels[0], id: "fast", name: "Fast", inputUsdPerM: 10, outputUsdPerM: 30, benchmark: { outputTokensPerSecond: 300, timeToFirstTokenMs: 50, source: "fixture", date: "2026-09-16", confidence: "low" as const } },
];
const chooseApi = (priority: "cost" | "speed") => recommendHybrid(demoHardwareProfile, short.objective, [], fixtures, { ...short, priority })[0].name;
check("cost and speed choose different suitable APIs", chooseApi("cost") === "Cheap" && chooseApi("speed") === "Fast");
check("unknown API modalities do not imply audio", recommendHybrid(demoHardwareProfile, transcription.objective, [], [{ ...fixtures[0], strengths: ["Transcrição"] }], transcription).length === 0);
check("explicit API audio capability is eligible", recommendHybrid(demoHardwareProfile, transcription.objective, [], [{ ...fixtures[0], modalities: ["audio"] }], transcription).length === 1);
check("response must fit model context", recommendHybrid(demoHardwareProfile, short.objective, [], [{ ...fixtures[0], contextK: 8 }], { ...short, responseTokens: 32768 }).length === 0);
for (const scenario of [{ ...short, version: 2 }, { ...short, contextK: 0 }, { ...short, responseTokens: 63 }, { ...short, concurrency: 65 }, { ...short, id: "unknown" }, { ...short, label: "" }, { ...short, priority: "unknown" }]) {
  try { validateScenario(scenario as RecommendationScenario); failures.push("invalid scenario accepted"); } catch { /* expected */ }
}
check("invalid ranges and scenario fields rejected", !failures.includes("invalid scenario accepted"));
if (failures.length) throw new Error(`stage43 failed: ${failures.join(", ")}`);
