import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";

const sha256 = async (path) =>
  createHash("sha256").update(await readFile(path)).digest("hex");

const commit = process.env.GITHUB_SHA ?? process.env.RELEASE_COMMIT;
if (!commit || !/^[0-9a-f]{40}$/i.test(commit)) {
  throw new Error("Defina GITHUB_SHA ou RELEASE_COMMIT com o SHA completo do commit.");
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const materials = ["package-lock.json", "apps/hardware-agent/src-tauri/Cargo.lock"];
const subjects = ["sbom-web.cdx.json", "sbom-rust.cdx.json"];
const digestEntries = async (paths) =>
  Promise.all(paths.map(async (path) => ({ path, sha256: await sha256(path) })));

const provenance = {
  schemaVersion: 1,
  type: "https://838.vercel.app/schemas/release-provenance/v1",
  package: { name: packageJson.name, version: packageJson.version },
  source: {
    repository: process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`
      : null,
    ref: process.env.GITHUB_REF ?? null,
    commit: commit.toLowerCase(),
  },
  builder: {
    workflow: process.env.GITHUB_WORKFLOW_REF ?? "local",
    runId: process.env.GITHUB_RUN_ID ?? null,
  },
  materials: await digestEntries(materials),
  subjects: await digestEntries(subjects),
};

await writeFile("release-provenance.json", `${JSON.stringify(provenance, null, 2)}\n`);
console.log("Manifesto de proveniência gerado em release-provenance.json.");
