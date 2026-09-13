import { createHash } from "node:crypto";
import { constants, createReadStream } from "node:fs";
import { copyFile, mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const jsonPaths = process.env.ARTIFACT_PATHS_JSON;
const paths = jsonPaths !== undefined ? JSON.parse(jsonPaths) : (process.env.ARTIFACT_PATHS ?? "")
  .split(/\r?\n/)
  .map((entry) => entry.trim())
  .filter(Boolean);
const directory = process.env.ARTIFACT_DIRECTORY;
const output = directory ? path.join(directory, "SHA256SUMS") : process.env.CHECKSUM_OUTPUT ?? "NATIVE-SHA256SUMS";

if (!Array.isArray(paths) || paths.some((entry) => typeof entry !== "string" || !entry.trim())) {
  throw new Error("ARTIFACT_PATHS_JSON deve conter uma lista de caminhos não vazios.");
}

if (paths.length === 0) throw new Error("ARTIFACT_PATHS não contém pacotes nativos.");

const names = new Set();
const artifacts = [];
for (const inputPath of paths) {
  // A Action informa .app antes de criar o arquivo .app.tar.gz.
  const inputStat = await stat(inputPath);
  const artifactPath = inputStat.isDirectory() && inputPath.endsWith(".app")
    ? `${inputPath}.tar.gz` : inputPath;
  const name = path.basename(artifactPath);
  // A lista deve continuar verificável depois de extrair os pacotes no Windows.
  const normalized = name.toLowerCase();
  if (directory && normalized === "sha256sums") throw new Error("Nome reservado para o manifesto de checksums.");
  if (names.has(normalized)) throw new Error(`Nome de artefato duplicado: ${name}`);
  if (/[\x00-\x1f\x7f\\]/.test(name)) throw new Error("Nome de artefato incompatível com SHA256SUMS.");
  if (path.resolve(artifactPath) === path.resolve(output)) throw new Error("A saída não pode substituir um artefato.");
  if (!(await stat(artifactPath)).isFile()) throw new Error(`Artefato não é arquivo: ${artifactPath}`);
  names.add(normalized);
  artifacts.push({ artifactPath, name });
}

// mkdir sem recursive rejeita diretório existente, evitando artefatos antigos no upload.
if (directory) await mkdir(directory);
const lines = [];
for (const { artifactPath, name } of artifacts.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
  const hash = createHash("sha256");
  const checksumPath = directory ? path.join(directory, name) : artifactPath;
  if (directory) await copyFile(artifactPath, checksumPath, constants.COPYFILE_EXCL);
  for await (const chunk of createReadStream(checksumPath)) hash.update(chunk);
  lines.push(`${hash.digest("hex")}  ${name}`);
}

await writeFile(output, `${lines.join("\n")}\n`, { flag: "wx" });
console.log(`${paths.length} checksum(s) gravado(s) em ${output}.`);
