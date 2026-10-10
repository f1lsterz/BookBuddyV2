import request from "supertest";
import { registerUser, waitFor } from "./helpers/auth";

const gateway = process.env.E2E_GATEWAY_URL ?? "http://127.0.0.1:3000";
const FRIEND_REQUEST_SENT = "user.friend.request.sent";
const FRIEND_REQUEST_ACCEPTED = "user.friend.request.accepted";

describe("Friend requests → notifications (e2e)", () => {
  it("sender gets notification when receiver accepts", async () => {
    const sender = await registerUser("friend-sender", "E2E Sender");
    const receiver = await registerUser("friend-receiver", "E2E Receiver");

    const requestRes = await request(gateway)
      .post("/user/friend-request")
      .set("Authorization", `Bearer ${sender.accessToken}`)
      .send({ receiverId: receiver.userId })
      .expect(201);

    const requestId = requestRes.body._id as string;

    await waitFor(
      () =>
        request(gateway)
          .get("/user/me/notifications")
          .set("Authorization", `Bearer ${receiver.accessToken}`)
          .then((res) => res.body as Array<{ type: string }>),
      (list) => list.some((n) => n.type === FRIEND_REQUEST_SENT),
    );

    await request(gateway)
      .post(`/user/friend-request/${requestId}/accept`)
      .set("Authorization", `Bearer ${receiver.accessToken}`)
      .expect(200);

    await waitFor(
      () =>
        request(gateway)
          .get("/user/me/notifications")
          .set("Authorization", `Bearer ${sender.accessToken}`)
          .then((res) => res.body as Array<{ type: string }>),
      (list) => list.some((n) => n.type === FRIEND_REQUEST_ACCEPTED),
    );
  });
});
