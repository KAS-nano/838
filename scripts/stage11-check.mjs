import fs from "node:fs";
import ts from "typescript";

const page = fs.readFileSync("src/app/comparar/page.tsx", "utf8");
const engine = fs.readFileSync("src/features/comparison/engine.ts", "utf8");
const styles = fs.readFileSync("preview/comparison.css", "utf8");
const output = ts.transpileModule(page, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }, reportDiagnostics: true });
const tests = [
  ["syntax", !(output.diagnostics || []).some(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error)],
  ["three responsive selectors", page.includes("DEFAULT_SELECTIONS") && styles.includes("repeat(3, minmax(0, 1fr))")],
  ["compatibility metric", page.includes("Compatibilidade") && engine.includes('"compatibility"')],
  ["performance range", engine.includes("row.perf.low") && engine.includes("row.perf.high")],
  ["shared memory estimator", engine.includes("estimateMemory") && engine.includes("createComparisonRows")],
];
let failed = false;
for (const [name, passed] of tests) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
  if (!passed) failed = true;
}
if (failed) throw new Error("stage11 failed");
