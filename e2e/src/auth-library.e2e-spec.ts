import request from "supertest";

const gateway = process.env.E2E_GATEWAY_URL ?? "http://127.0.0.1:3000";

describe("Auth + library (e2e)", () => {
  const email = `e2e-${Date.now()}@bookbuddy.test`;
  const password = "E2eTestPass123!";

  it("GET /health is public", async () => {
    await request(gateway).get("/health").expect(200);
  });

  it("registers user, refresh cookie, and default library shelves", async () => {
    const agent = request.agent(gateway);

    const reg = await agent
      .post("/auth/registration")
      .send({ email, password, name: "E2E User" })
      .expect(201);

    expect(reg.body.accessToken).toBeDefined();
    expect(reg.body.refreshToken).toBeUndefined();
    expect(reg.body.user?.email).toBe(email);
    const setCookie = reg.headers["set-cookie"];
    const cookieHeader = Array.isArray(setCookie)
      ? setCookie.join(";")
      : (setCookie ?? "");
    expect(cookieHeader).toMatch(/refreshToken=/);

    const refreshed = await agent.post("/auth/refresh").send({}).expect(200);
    expect(refreshed.body.accessToken).toBeDefined();
    expect(refreshed.body.refreshToken).toBeUndefined();

    const token = refreshed.body.accessToken as string;

    const libs = await request(gateway)
      .get("/library/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(libs.body)).toBe(true);
    expect(libs.body.length).toBeGreaterThanOrEqual(5);

    const books = await request(gateway).get("/book?limit=1").expect(200);
    expect(Array.isArray(books.body)).toBe(true);

    if (books.body.length === 0) {
      throw new Error("E2E: book catalog empty — run `pnpm run seed:books` before e2e");
    }

    const libraryId = libs.body[0]._id as string;
    const bookId = books.body[0]._id as string;

    await request(gateway)
      .post("/library/books")
      .set("Authorization", `Bearer ${token}`)
      .send({ bookId, libraryId })
      .expect(201);

    const check = await request(gateway)
      .post("/library/books/check")
      .set("Authorization", `Bearer ${token}`)
      .send({ bookId, libraryId })
      .expect(200);

    expect(check.body).toBe(true);
  });
});
