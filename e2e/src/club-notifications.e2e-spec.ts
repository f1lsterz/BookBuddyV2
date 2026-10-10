import request from "supertest";
import { registerUser, waitFor } from "./helpers/auth";

const CLUB_MEMBER_JOINED = "club.member.joined";

const gateway = process.env.E2E_GATEWAY_URL ?? "http://127.0.0.1:3000";

describe("Club member joined → notifications (e2e)", () => {
  it("admin adds member and member receives in-app notification", async () => {
    const admin = await registerUser("club-admin", "E2E Club Admin");
    const member = await registerUser("club-member", "E2E Club Member");

    const clubRes = await request(gateway)
      .post("/club")
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ name: "E2E Readers", description: "End-to-end book club" })
      .expect(201);

    const clubId = clubRes.body._id as string;
    expect(clubId).toBeDefined();

    await request(gateway)
      .post(`/club/${clubId}/members`)
      .set("Authorization", `Bearer ${admin.accessToken}`)
      .send({ userId: member.userId })
      .expect(201);

    const notifications = await waitFor(
      () =>
        request(gateway)
          .get("/user/me/notifications")
          .set("Authorization", `Bearer ${member.accessToken}`)
          .then((res) => {
            if (res.status !== 200) {
              throw new Error(`notifications HTTP ${res.status}`);
            }
            return res.body as Array<{ type: string; read: boolean }>;
          }),
      (list) => list.some((n) => n.type === CLUB_MEMBER_JOINED),
    );

    const joined = notifications.find((n) => n.type === CLUB_MEMBER_JOINED);
    expect(joined?.read).toBe(false);

    await request(gateway)
      .patch(`/user/me/notifications/${(joined as { _id: string })._id}/read`)
      .set("Authorization", `Bearer ${member.accessToken}`)
      .expect(200);

    const unreadOnly = await request(gateway)
      .get("/user/me/notifications?unreadOnly=true")
      .set("Authorization", `Bearer ${member.accessToken}`)
      .expect(200);

    expect(
      (unreadOnly.body as Array<{ type: string }>).some(
        (n) => n.type === CLUB_MEMBER_JOINED,
      ),
    ).toBe(false);
  });
});
