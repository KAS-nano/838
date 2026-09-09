import fs from "node:fs";
import ts from "typescript";
const files=["src/features/dashboard/metrics.ts","src/components/gauges/speed-gauge.tsx","src/app/dashboard/page.tsx"];
let failed=false;
for(const f of files){const s=fs.readFileSync(f,"utf8");const out=ts.transpileModule(s,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext},reportDiagnostics:true});const bad=(out.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);console.log(`${bad.length?"FAIL":"PASS"} syntax ${f}`);if(bad.length)failed=true;}
const source=fs.readFileSync("src/features/dashboard/metrics.ts","utf8");
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};Function("module","exports",js)(mod,mod.exports);
const {metricStatus,clampPercent}=mod.exports;
const tests=[
 ["comfortable",metricStatus(6,10)==="comfortable"],
 ["moderate",metricStatus(8,10)==="moderate"],
 ["limit",metricStatus(9.2,10)==="limit"],
 ["insufficient",metricStatus(11,10)==="insufficient"],
 ["clamp high",clampPercent(20,10)===100],
 ["clamp invalid",clampPercent(1,0)===0]
];
for(const [n,p] of tests){console.log(`${p?"PASS":"FAIL"} ${n}`);if(!p)failed=true;}
process.exit(failed?1:0);
