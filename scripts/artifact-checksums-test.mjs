import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = mkdtempSync(path.join(tmpdir(), "838-artifact-checksums-"));
const script = path.resolve("scripts/write-artifact-checksums.mjs");
const run = (paths, output, jsonPaths, directory) => spawnSync(process.execPath, [script], {
  env: { ...process.env, ARTIFACT_PATHS: paths.join("\n"), ARTIFACT_PATHS_JSON: jsonPaths, CHECKSUM_OUTPUT: output, ARTIFACT_DIRECTORY: directory },
  encoding: "utf8",
});
try {
  const a = path.join(root, "a package.bin"), b = path.join(root, "b.bin");
  writeFileSync(a, "abc");
  writeFileSync(b, "");
  const expected = "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad  a package.bin\n" +
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  b.bin\n";
  const output = path.join(root, "SHA256SUMS");
  assert.equal(run([b, a], output).status, 0);
  assert.equal(readFileSync(output, "utf8"), expected);
  assert.notEqual(run([a, b], output).status, 0);
  assert.equal(readFileSync(output, "utf8"), expected, "saída existente preservada");
  const ordered = path.join(root, "ordered");
  assert.equal(run([a, b], ordered).status, 0);
  assert.equal(readFileSync(ordered, "utf8"), expected, "ordem de entrada não altera resultado");
  const fromJson = path.join(root, "json.sums");
  assert.equal(run([], fromJson, JSON.stringify([b, a])).status, 0);
  assert.equal(readFileSync(fromJson, "utf8"), expected, "contrato JSON da Action");
  for (const [index, invalid] of ["broken", "null", "{}", '[123]', '[""]', "[]"].entries()) {
    const target = path.join(root, `invalid-json-${index}`);
    assert.notEqual(run([], target, invalid).status, 0);
    assert.equal(existsSync(target), false);
  }
  mkdirSync(path.join(root, "other"));
  const duplicate = path.join(root, "other", "A PACKAGE.BIN");
  writeFileSync(duplicate, "different");
  for (const [name, inputs] of [
    ["empty", []], ["duplicate", [a, duplicate]], ["repeated", [a, a]],
    ["missing", [a, path.join(root, "missing")]], ["directory", [root]],
  ]) {
    const target = path.join(root, name + ".sums");
    assert.notEqual(run(inputs, target).status, 0, name);
    assert.equal(existsSync(target), false, `${name}: sem saída parcial`);
  }
  assert.notEqual(run([a], a).status, 0);
  assert.equal(readFileSync(a, "utf8"), "abc", "artefato original preservado");
  const app = path.join(root, "838 Hardware.app");
  mkdirSync(app);
  const staged = path.join(root, "packages");
  assert.notEqual(run([], undefined, JSON.stringify([app]), staged).status, 0);
  assert.equal(existsSync(staged), false, "arquivo compactado ausente: nenhum pacote preparado");
  writeFileSync(`${app}.tar.gz`, "abc");
  assert.equal(run([], undefined, JSON.stringify([app, b]), staged).status, 0);
  assert.deepEqual(readdirSync(staged).sort(), ["838 Hardware.app.tar.gz", "SHA256SUMS", "b.bin"]);
  assert.equal(readFileSync(path.join(staged, "838 Hardware.app.tar.gz"), "utf8"), "abc");
  assert.equal(readFileSync(path.join(staged, "SHA256SUMS"), "utf8"), expected.replace("a package.bin", "838 Hardware.app.tar.gz"));
  assert.notEqual(run([], undefined, JSON.stringify([app]), staged).status, 0, "diretório existente rejeitado");
  const collision = path.join(root, "collision");
  assert.notEqual(run([], undefined, JSON.stringify([app, `${app}.tar.gz`]), collision).status, 0);
  assert.equal(existsSync(collision), false, "caminhos que resolvem para o mesmo arquivo rejeitados");
  console.log("PASS checksums: SHA-256 conhecido, ordem estável, espaços, duplicatas, ausência e sobrescrita.");
} finally {
  rmSync(root, { recursive: true, force: true });
}
