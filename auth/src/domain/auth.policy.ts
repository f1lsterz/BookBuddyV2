import { AppError } from "@bookbuddy/shared";
import type { AuthUserRecord } from "../types/auth-user.record";

export class AuthPolicy {
  static assertUserFound(
    user: AuthUserRecord | null | undefined,
    message = "Invalid email or password",
  ): asserts user is AuthUserRecord {
    if (!user) {
      throw AppError.unauthorized(message);
    }
  }
  static assertCredentialsValid(isValid: boolean): void {
    if (!isValid) {
      throw AppError.unauthorized("Invalid email or password");
    }
  }

  static assertPasswordLoginAllowed(password: string): void {
    if (password === "") {
      throw AppError.unauthorized("Please login with Google");
    }
  }

  static assertEmailAvailable(existing: unknown): void {
    if (existing) {
      throw AppError.badRequest("User with this email already exists");
    }
  }
}
