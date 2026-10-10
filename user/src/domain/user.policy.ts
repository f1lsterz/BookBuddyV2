import { AppError } from "@bookbuddy/shared";
import { Types } from "mongoose";

export class UserPolicy {
  static assertValidObjectId(id: string, label = "user ID"): void {
    if (!Types.ObjectId.isValid(id)) {
      throw AppError.badRequest(`Invalid ${label}`);
    }
  }

  static assertEmailPresent(email: string): void {
    if (!email) {
      throw AppError.badRequest("Email is required");
    }
  }

  static assertUserExists<T>(
    user: T | null | undefined,
    message = "User not found",
  ): asserts user is T {
    if (!user) {
      throw AppError.notFound(message);
    }
  }

  static assertEmailNotTaken(existing: unknown): void {
    if (existing) {
      throw AppError.badRequest("User with this email already exists");
    }
  }
}
