import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("public/manifest.webmanifest", "utf8"));
const worker = fs.readFileSync("public/sw.js", "utf8");
const layout = fs.readFileSync("src/app/layout.tsx", "utf8");
const frame = fs.readFileSync("src/components/navigation/site-frame.tsx", "utf8");

const tests = [
  ["manifest instalável", manifest.display === "standalone" && manifest.start_url === "/" && manifest.scope === "/"],
  ["manifest com ícone", Array.isArray(manifest.icons) && manifest.icons.length > 0],
  ["service worker com shell", worker.includes("APP_SHELL") && worker.includes("self.skipWaiting")],
  ["cache não captura APIs", worker.includes("!url.pathname.startsWith(\"/api/\")")],
  ["cache não captura auth", worker.includes("!url.pathname.startsWith(\"/auth/\")")],
  ["registro apenas produção", frame.includes('process.env.NODE_ENV !== "production"') && frame.includes('serviceWorker.register("/sw.js"')],
  ["layout referencia manifesto", layout.includes('manifest: "/manifest.webmanifest"')],
];

let failed = false;
for (const [name, passed] of tests) {
  console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
  if (!passed) failed = true;
}
if (failed) process.exitCode = 1;
