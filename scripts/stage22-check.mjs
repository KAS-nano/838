import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
const required=["README.md","ARCHITECTURE.md","SECURITY.md","PRIVACY.md","KNOWN_ISSUES.md","preview/index.html","preview/styles.css","preview/app.js","src/app/api/health/route.ts","src/components/navigation/site-frame.tsx"];
let failed=false;
for(const file of required){const ok=fs.existsSync(file)&&fs.statSync(file).size>0;console.log(ok?"PASS":"FAIL",file);failed||=!ok}
const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));const v=pkg.version==="1.0.0";console.log(v?"PASS":"FAIL","package v1.0.0");failed||=!v;
const config=fs.readFileSync("next.config.ts","utf8");for(const header of ["X-Content-Type-Options","X-Frame-Options","Permissions-Policy"]){const ok=config.includes(header);console.log(ok?"PASS":"FAIL",`security ${header}`);failed||=!ok}
const agent=fs.readFileSync("apps/hardware-agent/src/index.html","utf8");const agentScript=fs.readFileSync("apps/hardware-agent/src/app.js","utf8");const agentLocal=!/https?:\/\//.test(agent)&&agentScript.includes("window.__TAURI__.core.invoke");console.log(agentLocal?"PASS":"FAIL","agent offline frontend");failed||=!agentLocal;
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)])}
const sources=walk("src").filter(f=>/\.tsx?$/.test(f)&&!f.includes("generated/")&&!f.endsWith(".d.ts"));let syntaxErrors=0;for(const f of sources){const code=fs.readFileSync(f,"utf8");const out=ts.transpileModule(code,{fileName:f,reportDiagnostics:true,compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}});const errs=(out.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);if(errs.length){syntaxErrors++;console.error("FAIL syntax",f,errs.map(e=>ts.flattenDiagnosticMessageText(e.messageText," ")).join(" | "))}}
console.log(syntaxErrors?"FAIL":"PASS",`TS/TSX syntax (${sources.length} files)`);failed||=syntaxErrors>0;
if(failed)process.exit(1);
