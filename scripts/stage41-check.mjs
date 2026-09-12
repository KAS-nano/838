import { readFileSync } from "node:fs";

const component = readFileSync("src/components/navigation/site-frame.tsx", "utf8");
const css = readFileSync("src/app/globals.css", "utf8");
const previewCss = readFileSync("preview/styles.css", "utf8");
const previews = ["preview/home.html", "preview/index.html", "preview/onboarding.html"].map((file) => readFileSync(file, "utf8"));
const failures = [];

for (const contract of ["header-side-start", "header-side-end", "site-logo", "header-action"]) if (!component.includes(contract)) failures.push(`header Next sem ${contract}`);
for (const contract of ["grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr)", ".skip-link:focus", ".header-action:hover", ".site-header::after"]) if (!css.includes(contract)) failures.push(`CSS Next sem ${contract}`);
for (const contract of ["grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)", ".header-action:hover", ".topbar:after"]) if (!previewCss.includes(contract)) failures.push(`CSS preview sem ${contract}`);
for (const [index, html] of previews.entries()) {
  if (!html.includes("styles.css?v=20260912")) failures.push(`preview ${index + 1} usa CSS antigo`);
  if (!html.includes("brand-center")) failures.push(`preview ${index + 1} sem marca textual`);
  if (/brand-center[^>]*>\s*<img/i.test(html)) failures.push(`preview ${index + 1} recolocou imagem no header`);
}
if (!previews[1].includes("Meu hardware")) failures.push("dashboard preview sem ação de hardware");

if (failures.length) { failures.forEach((failure) => console.error(`FAIL ${failure}`)); process.exit(1); }
console.log("PASS header: marca central, laterais simétricas, ação consistente e skip link sob foco.");
