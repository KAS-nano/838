import type { ComparisonSelection } from '../src/features/comparison/engine';
type Catalog = { id: string; variants: { quantization: string }[] }[];
export const COMPARISON_KEY: string;
export interface SavedComparison { version: number; contextK: number; selections: ComparisonSelection[] }
export function validateComparison(value: unknown, models: Catalog): SavedComparison;
export function saveComparison(models: Catalog, selections: ComparisonSelection[], contextK: number): void;
export function loadComparison(models: Catalog): SavedComparison;
export function deleteComparison(): void;
export function serializeComparison(models: Catalog, selections: ComparisonSelection[], contextK: number): string;
export function readComparisonFile(file: File, models: Catalog): Promise<SavedComparison>;
export function downloadComparison(models: Catalog, selections: ComparisonSelection[], contextK: number): void;
