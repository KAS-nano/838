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
const nextVersion = pkg.dependencies?.next;
const configVersion = pkg.devDependencies?.["eslint-config-next"];
if (typeof nextVersion !== "string" || !/^\d+\.\d+\.\d+$/.test(nextVersion) || nextVersion !== configVersion) {
  console.error("FAIL Next.js and eslint-config-next must use the same exact version");
  failed = true;
} else console.log(`PASS Next.js ${nextVersion} aligned with eslint-config-next`);
process.exit(failed ? 1 : 0);
