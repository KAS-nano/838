import fs from "node:fs";
const page = fs.readFileSync("src/app/page.tsx", "utf8");
const preview = fs.readFileSync("preview/index.html", "utf8");
const checks = [
  ["headline", page.includes("A IA certa.") && page.includes("sua máquina.")],
  ["primary CTA", page.includes("Analisar meu sistema")],
  ["single onboarding entry", page.includes('href="/onboarding"')],
  ["explore CTA", page.includes("Explorar ferramentas sem analisar")],
  ["responsive preview viewport", preview.includes('name="viewport"')],
  ["preview description", preview.includes('name="description"')],
  ["preview main experience", preview.includes("Modelo × sua máquina") && preview.includes(">838<")],
];
let fail = false;
for (const [name, pass] of checks) { console.log(`${pass ? "PASS" : "FAIL"} ${name}`); if (!pass) fail = true; }
process.exit(fail ? 1 : 0);
