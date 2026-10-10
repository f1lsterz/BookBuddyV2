import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function runNode(script) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script], {
      cwd: serverRoot,
      stdio: "inherit",
      env: process.env,
    });
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${script} exit ${code}`)),
    );
  });
}

function runPnpm(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("pnpm", args, {
      cwd: serverRoot,
      stdio: "inherit",
      shell: true,
      env: process.env,
    });
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`pnpm exit ${code}`)),
    );
  });
}

try {
  await runNode("tooling/scripts/init-mongo-replset.mjs");
  await runNode("tooling/scripts/init-rabbit-domain-topology.mjs");
  await runNode("tooling/scripts/e2e-start-stack.mjs");
  await runPnpm(["--filter", "@bookbuddy/e2e", "run", "test"]);
} finally {
  await runNode("tooling/scripts/e2e-stop-stack.mjs");
}
