import request from "supertest";

const gateway = process.env.E2E_GATEWAY_URL ?? "http://127.0.0.1:3000";

export type RegisteredUser = {
  accessToken: string;
  userId: string;
  email: string;
};

export async function registerUser(
  suffix: string,
  name: string,
): Promise<RegisteredUser> {
  const email = `e2e-${suffix}-${Date.now()}@bookbuddy.test`;
  const password = "E2eTestPass123!";

  const res = await request(gateway)
    .post("/auth/registration")
    .send({ email, password, name })
    .expect(201);

  const userId = res.body.user?._id as string;
  if (!userId) {
    throw new Error("E2E: registration response missing user._id");
  }

  return {
    accessToken: res.body.accessToken as string,
    userId,
    email,
  };
}

export async function waitFor<T>(
  fn: () => Promise<T>,
  predicate: (value: T) => boolean,
  opts?: { attempts?: number; delayMs?: number },
): Promise<T> {
  const attempts = opts?.attempts ?? 30;
  const delayMs = opts?.delayMs ?? 500;

  let last: T | undefined;
  for (let i = 0; i < attempts; i += 1) {
    last = await fn();
    if (predicate(last)) {
      return last;
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }

  throw new Error(`E2E: condition not met after ${attempts} attempts`);
}
