import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "../..");
const services = [
  "api-gateway",
  "auth",
  "user",
  "book",
  "library",
  "club",
  "chat",
  "analytics",
];

function readJwtSecret(envPath) {
  if (!fs.existsSync(envPath)) return null;
  const text = fs.readFileSync(envPath, "utf8");
  const line = text.split("\n").find((l) => l.startsWith("JWT_SECRET="));
  return line?.slice("JWT_SECRET=".length).trim() || null;
}

function setJwtSecret(envPath, secret) {
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  const updated = text.includes("JWT_SECRET=")
    ? text.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${secret}`)
    : `${text.trimEnd()}\nJWT_SECRET=${secret}\n`;
  fs.writeFileSync(envPath, updated);
}

for (const name of services) {
  const example = path.join(root, name, ".env.example");
  const target = path.join(root, name, ".env");
  if (!fs.existsSync(example)) {
    console.warn(`Skip ${name}: no .env.example`);
    continue;
  }
  if (!fs.existsSync(target)) {
    fs.copyFileSync(example, target);
    console.log(`Created ${name}/.env from .env.example`);
  } else {
    console.log(`Keep ${name}/.env (already exists)`);
  }
}

const masterSecret =
  process.env.JWT_SECRET ||
  readJwtSecret(path.join(root, "api-gateway", ".env")) ||
  "change-me-in-production";

for (const name of services) {
  setJwtSecret(path.join(root, name, ".env"), masterSecret);
}
console.log(`JWT_SECRET aligned across services.`);
