import { spawnSync } from "node:child_process";
import { setTimeout } from "node:timers/promises";

/** Single-node replica sets for Mongo transactions (host clients via published ports). */
const targets = [
  { uri: "mongodb://127.0.0.1:27017", memberHost: "127.0.0.1:27017", label: "user" },
  { uri: "mongodb://127.0.0.1:27018", memberHost: "127.0.0.1:27018", label: "club" },
];

function runMongoshEval(uri, js) {
  const args = [uri, "--quiet", "--eval", js];
  const result = spawnSync("mongosh", args, { encoding: "utf8", shell: true });
  if (result.error) {
    return { ok: false, output: result.error.message };
  }
  return {
    ok: result.status === 0,
    output: (result.stdout ?? "") + (result.stderr ?? ""),
  };
}

async function waitForMongo(uri, label, attempts = 30) {
  for (let i = 0; i < attempts; i++) {
    const ping = runMongoshEval(uri, "db.runCommand({ ping: 1 }).ok");
    if (ping.ok && ping.output.trim().includes("true")) {
      return true;
    }
    await setTimeout(2000);
  }
  console.error(`Mongo (${label}) not reachable at ${uri}`);
  return false;
}

function ensureReplicaSet(uri, memberHost, label) {
  const initJs = `
try {
  const status = rs.status();
  if (status.ok === 1) { print("ok"); }
} catch (e) {
  const res = rs.initiate({
    _id: "rs0",
    members: [{ _id: 0, host: "${memberHost}" }],
  });
  if (res.ok !== 1) { throw new Error(JSON.stringify(res)); }
  print("ok");
}
`;
  const result = runMongoshEval(uri, initJs);
  if (!result.ok || !result.output.includes("ok")) {
    console.error(`Replica set init failed for ${label}:`, result.output);
    process.exit(1);
  }
  console.log(`Replica set ready: ${label} (${memberHost})`);
}

let failed = false;
for (const target of targets) {
  if (!(await waitForMongo(target.uri, target.label))) {
    failed = true;
    continue;
  }
  ensureReplicaSet(target.uri, target.memberHost, target.label);
}

process.exit(failed ? 1 : 0);
