import { AppError } from "@bookbuddy/shared";
import { AuthPolicy } from "./auth.policy";

describe("AuthPolicy", () => {
  it("assertEmailAvailable throws when user exists", () => {
    expect(() => AuthPolicy.assertEmailAvailable({})).toThrow(/already exists/);
  });

  it("assertCredentialsValid throws when invalid", () => {
    expect(() => AuthPolicy.assertCredentialsValid(false)).toThrow(AppError);
  });
});
