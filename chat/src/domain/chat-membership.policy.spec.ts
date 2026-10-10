import { AppError } from "@bookbuddy/shared";
import { ChatMembershipPolicy } from "./chat-membership.policy";

describe("ChatMembershipPolicy", () => {
  it("assertIsClubMember throws when not a member", () => {
    expect(() => ChatMembershipPolicy.assertIsClubMember(false)).toThrow(AppError);
  });

  it("assertIsClubAdmin throws when not admin", () => {
    expect(() => ChatMembershipPolicy.assertIsClubAdmin(false)).toThrow(AppError);
  });
});
