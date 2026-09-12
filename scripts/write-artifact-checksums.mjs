import { createHash } from "node:crypto";
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const paths = (process.env.ARTIFACT_PATHS ?? "")
  .split(/\r?\n/)
  .map((entry) => entry.trim())
  .filter(Boolean);
const output = process.env.CHECKSUM_OUTPUT ?? "NATIVE-SHA256SUMS";

if (paths.length === 0) throw new Error("ARTIFACT_PATHS não contém pacotes nativos.");

const lines = [];
for (const artifactPath of paths.sort()) {
  if (!(await stat(artifactPath)).isFile()) throw new Error(`Artefato não é arquivo: ${artifactPath}`);
  const digest = createHash("sha256").update(await readFile(artifactPath)).digest("hex");
  lines.push(`${digest}  ${path.basename(artifactPath)}`);
}

await writeFile(output, `${lines.join("\n")}\n`, { flag: "wx" });
console.log(`${paths.length} checksum(s) gravado(s) em ${output}.`);
