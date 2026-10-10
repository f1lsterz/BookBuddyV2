import { readFileSync, existsSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const pidFile = path.join(serverRoot, ".e2e-stack.pids.json");

if (!existsSync(pidFile)) {
  process.exit(0);
}

const entries = JSON.parse(readFileSync(pidFile, "utf8"));
for (const { pid, name } of entries) {
  try {
    process.kill(pid);
    console.log(`Stopped ${name} (pid ${pid})`);
  } catch {
    // already stopped
  }
}

unlinkSync(pidFile);
