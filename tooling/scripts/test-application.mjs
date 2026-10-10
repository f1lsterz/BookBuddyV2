import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const packages = ["library", "user", "chat"];
const pattern = "(application\\.service|chat\\.service)\\.spec";

let failed = false;

for (const pkg of packages) {
  const pkgDir = path.join(serverRoot, pkg);
  const jestBin = path.join(pkgDir, "node_modules", "jest", "bin", "jest.js");
  const result = spawnSync(process.execPath, [jestBin, `--testPathPattern=${pattern}`], {
    cwd: pkgDir,
    stdio: "inherit",
    env: process.env,
  });
  if (result.error) {
    console.error(`Failed to run tests in ${pkg}:`, result.error.message);
    failed = true;
    continue;
  }
  if (result.status !== 0) {
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
