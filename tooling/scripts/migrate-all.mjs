import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const migrateMongoBin = path.join(
  serverRoot,
  "node_modules",
  "migrate-mongo",
  "bin",
  "migrate-mongo.js",
);
const services = ["club", "user", "book", "library", "chat"];

let failed = false;

for (const service of services) {
  const cwd = path.join(serverRoot, service);
  console.log(`\n— migrate-mongo: ${service}`);
  const result = spawnSync(
    process.execPath,
    [migrateMongoBin, "up", "-f", "migrate-mongo-config.cjs"],
    { cwd, stdio: "inherit", env: process.env },
  );
  if (result.status !== 0) {
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
