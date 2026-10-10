import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const pidFile = path.join(serverRoot, ".e2e-stack.pids.json");

const services = [
  "auth",
  "user",
  "book",
  "library",
  "club",
  "chat",
  "analytics",
  "api-gateway",
];

const pids = services.map((name) => {
  const cwd = path.join(serverRoot, name);
  const child = spawn(process.execPath, ["dist/main.js"], {
    cwd,
    detached: true,
    stdio: "ignore",
    env: { ...process.env, NODE_ENV: "test" },
  });
  child.unref();
  return { name, pid: child.pid };
});

writeFileSync(pidFile, JSON.stringify(pids, null, 2));
console.log("E2E workers started:", pids.map((p) => `${p.name}=${p.pid}`).join(", "));

const healthUrl = process.env.E2E_GATEWAY_URL ?? "http://127.0.0.1:3000/health";

for (let i = 0; i < 60; i++) {
  try {
    const res = await fetch(healthUrl);
    if (res.ok) {
      console.log(`Gateway healthy: ${healthUrl}`);
      process.exit(0);
    }
  } catch {
    // retry
  }
  await new Promise((r) => setTimeout(r, 2000));
}

console.error(`Gateway not healthy at ${healthUrl}`);
process.exit(1);
