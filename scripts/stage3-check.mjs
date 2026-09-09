import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const require = createRequire(import.meta.url);
const output = fs.mkdtempSync(path.join(os.tmpdir(), "838-validation-"));
let validateHardware, validateGoals;
try {
  execFileSync(process.execPath, [require.resolve("typescript/bin/tsc"),
    "src/features/onboarding/validation.ts", "--outDir", output,
    "--module", "commonjs", "--target", "es2022", "--skipLibCheck",
    "--rootDir", "src/features/onboarding"], { stdio: "inherit" });
  ({ validateHardware, validateGoals } = require(path.join(output, "validation.js")));
} finally {
  fs.rmSync(output, { recursive: true, force: true });
}

const base = { deviceType:"desktop",cpu:"Ryzen 7 5700X",gpu:"RX 9070 XT",vramGb:16,ramGb:32,storageTotalGb:1000,storageFreeGb:500,os:"windows",distro:"",preference:"both",objectives:["Programação"],priority:"quality" };
const tests = [
  ["valid hardware", Object.keys(validateHardware(base)).length === 0],
  ["empty CPU rejected", Boolean(validateHardware({...base,cpu:""}).cpu)],
  ["negative VRAM rejected", Boolean(validateHardware({...base,vramGb:-1}).vramGb)],
  ["free disk > total rejected", Boolean(validateHardware({...base,storageFreeGb:1200}).storageFreeGb)],
  ["Linux distro required", Boolean(validateHardware({...base,os:"linux",distro:""}).distro)],
  ["goals required", Boolean(validateGoals({...base,objectives:[]}).objectives)],
  ["preview onboarding exists", fs.existsSync("preview/onboarding.html")],
  ["localStorage persistence", fs.readFileSync("src/features/profile/local-store.ts","utf8").includes("localStorage.setItem")],
];
let fail=false; for(const [name,pass] of tests){console.log(`${pass?"PASS":"FAIL"} ${name}`);if(!pass)fail=true} process.exit(fail?1:0);
