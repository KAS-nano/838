import type { RecommendationScenario } from "../src/features/recommendation/scenario";

type Validator = (value: unknown) => RecommendationScenario;
export type SavedScenario = { name: string; scenario: RecommendationScenario };
export const SAVED_SCENARIOS_KEY: string;
export const SAVED_SCENARIOS_LIMIT: number;
export function listSavedScenarios(validateScenario: Validator): SavedScenario[];
export function saveScenario(name: string, scenario: RecommendationScenario, validateScenario: Validator): RecommendationScenario;
export function loadSavedScenario(name: string, validateScenario: Validator): RecommendationScenario;
export function removeSavedScenario(name: string, validateScenario: Validator): SavedScenario[];
export function createScenarioShareUrl(scenario: RecommendationScenario, validateScenario: Validator, baseUrl: string): string;
export function readScenarioShareUrl(url: string, validateScenario: Validator): RecommendationScenario | null;
