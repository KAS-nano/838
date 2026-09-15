import type { ComparisonSelection } from '../src/features/comparison/engine';
import type { SavedComparison } from './comparison-storage.mjs';
type Catalog = { id: string; variants: { quantization: string }[] }[];
export interface NamedComparison { name: string; comparison: SavedComparison }
export const NAMED_COMPARISONS_KEY: string;
export function listNamedComparisons(): NamedComparison[];
export function addNamedComparison(name: string, models: Catalog, selections: ComparisonSelection[], contextK: number): NamedComparison[];
export function loadNamedComparison(name: string, models: Catalog): SavedComparison;
export function removeNamedComparison(name: string): NamedComparison[];
