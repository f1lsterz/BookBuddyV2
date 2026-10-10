import { AppError } from "@bookbuddy/shared";
import { UserPolicy } from "./user.policy";

describe("UserPolicy", () => {
  it("rejects invalid object id", () => {
    expect(() => UserPolicy.assertValidObjectId("not-an-id")).toThrow(AppError);
  });

  it("accepts valid object id", () => {
    expect(() =>
      UserPolicy.assertValidObjectId("507f1f77bcf86cd799439011"),
    ).not.toThrow();
  });

  it("assertUserExists throws not found", () => {
    try {
      UserPolicy.assertUserExists(undefined);
      fail("expected throw");
    } catch (e) {
      expect((e as AppError).statusCode).toBe(404);
    }
  });

  it("assertEmailNotTaken throws when email exists", () => {
    expect(() => UserPolicy.assertEmailNotTaken({})).toThrow(/already exists/);
  });
});
