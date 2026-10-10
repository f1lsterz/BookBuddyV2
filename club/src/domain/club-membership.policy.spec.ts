import { AppError } from "@bookbuddy/shared";
import { ClubMembershipPolicy } from "./club-membership.policy";

describe("ClubMembershipPolicy", () => {
  it("throws when user is already in a club", () => {
    expect(() => ClubMembershipPolicy.assertUserNotInAnyClub(true)).toThrow(AppError);
    expect(() => ClubMembershipPolicy.assertUserNotInAnyClub(true)).toThrow(
      /already in a club/,
    );
  });

  it("allows when user is not in any club", () => {
    expect(() => ClubMembershipPolicy.assertUserNotInAnyClub(false)).not.toThrow();
  });

  it("assertClubExists throws not found when missing", () => {
    try {
      ClubMembershipPolicy.assertClubExists(null);
      fail("expected throw");
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect((e as AppError).statusCode).toBe(404);
    }
  });

  it("assertIsMember throws when not a member", () => {
    expect(() => ClubMembershipPolicy.assertIsMember(false)).toThrow(AppError);
  });

  it("assertIsClubAdmin throws when not admin", () => {
    expect(() => ClubMembershipPolicy.assertIsClubAdmin(false)).toThrow(AppError);
    expect(() => ClubMembershipPolicy.assertIsClubAdmin(true)).not.toThrow();
  });
});
