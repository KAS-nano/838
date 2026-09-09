import fs from "node:fs";
import path from "node:path";
const required = ["package.json","tsconfig.json","src/app/page.tsx","src/app/layout.tsx","src/app/globals.css","preview/index.html"];
let failed = false;
for (const file of required) {
  const full = path.resolve(file);
  if (!fs.existsSync(full) || fs.statSync(full).size === 0) { console.error(`FAIL ${file}`); failed = true; }
  else console.log(`PASS ${file}`);
}
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
if (pkg.dependencies.next !== "16.3.3") { console.error("FAIL Next.js version"); failed = true; } else console.log("PASS Next.js 16.3.3");
process.exit(failed ? 1 : 0);
