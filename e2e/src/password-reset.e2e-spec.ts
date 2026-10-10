import request from "supertest";
import { registerUser } from "./helpers/auth";

const gateway = process.env.E2E_GATEWAY_URL ?? "http://127.0.0.1:3000";

describe("Password reset (e2e)", () => {
  it("resets password with devResetToken and logs in with new password", async () => {
    const user = await registerUser("pwd-reset", "E2E Reset User");
    const newPassword = "NewE2ePass456!";

    const forgot = await request(gateway)
      .post("/auth/forgot-password")
      .send({ email: user.email })
      .expect(200);

    const token = forgot.body.devResetToken as string | undefined;
    if (!token) {
      throw new Error("E2E: devResetToken missing — run with NODE_ENV !== production");
    }

    await request(gateway)
      .post("/auth/reset-password")
      .send({ token, password: newPassword })
      .expect(200);

    await request(gateway)
      .post("/auth/login")
      .send({ email: user.email, password: newPassword })
      .expect(200);
  });
});
