const gatewayUrl = process.env.E2E_GATEWAY_URL ?? "http://127.0.0.1:3000";
const healthUrl = `${gatewayUrl.replace(/\/$/, "")}/health`;

async function waitForGateway(maxAttempts = 45, delayMs = 2000): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(healthUrl);
      if (res.ok) {
        return;
      }
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(
    `E2E: gateway not reachable at ${healthUrl}. Start stack: pnpm run e2e:up (or pnpm run dev:all + infra).`,
  );
}

export default async function globalSetup(): Promise<void> {
  if (process.env.E2E_SKIP_HEALTH_WAIT === "1") {
    return;
  }
  await waitForGateway();
}
