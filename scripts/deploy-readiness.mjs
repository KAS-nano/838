import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const [pkg, support, gitignore] = await Promise.all([
  readFile("package.json", "utf8").then(JSON.parse),
  readFile("src/data/project-support.ts", "utf8"),
  readFile(".gitignore", "utf8"),
]);

assert.equal(pkg.private, true, "package must remain private to prevent accidental npm publication");
assert.match(pkg.engines.node, /22/, "Node 22 must remain supported by the deployment runtime");
assert.match(support, /8a8fbfbe-0cb5-4c9d-9648-058c58f95617/, "public support key must be the approved random Pix key");
assert.doesNotMatch(support, /alastorlluar@gmail\.com/i, "personal email must not be published as the Pix key");
for (const entry of ["/.next/", "/.vercel/", ".env*"]) assert.ok(gitignore.includes(entry), `${entry} must be ignored`);
await Promise.all(["public/favicon.ico", "preview/favicon.ico"].map((path) => access(path)));

console.log("PASS deployment readiness: private package, Node runtime, random Pix key, favicon and local deployment secrets.");
