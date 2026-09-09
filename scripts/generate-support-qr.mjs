import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import QRCode from "qrcode";

const root = fileURLToPath(new URL("..", import.meta.url));

// These own, pure modules have no imports or browser/Node side effects.
export async function loadSupportModule(relativePath) {
  const source = await fs.readFile(path.join(root, relativePath), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

export async function generateSupportPayment({ check = false } = {}) {
  const [{ projectSupport }, { createPixPayload }] = await Promise.all([
    loadSupportModule("src/data/project-support.ts"),
    loadSupportModule("src/features/support/pix.ts"),
  ]);
  const payload = createPixPayload(projectSupport.pix);
  const qrDataUrl = await QRCode.toDataURL(payload, {
    type: "image/png",
    errorCorrectionLevel: "M",
    margin: 4,
    scale: 8,
    color: { dark: "#000000ff", light: "#ffffffff" },
  });
  const payment = { ...projectSupport.pix, payload, qrDataUrl };
  const output = `// Generated locally by scripts/generate-support-qr.mjs. Do not edit.\nexport const supportPayment = ${JSON.stringify(payment, null, 2)} as const;\n`;
  const target = path.join(root, "src/data/support-payment.ts");
  if (check) {
    const current = await fs.readFile(target, "utf8").catch(() => "");
    if (current !== output) throw new Error("Os dados/QR Pix estão desatualizados. Execute npm run preview:generate.");
  } else {
    await fs.writeFile(target, output);
  }
  return payment;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await generateSupportPayment({ check: process.argv.includes("--check") });
  console.log("Pix com valor livre e QR local sincronizados.");
}
