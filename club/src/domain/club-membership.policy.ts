import { AppError } from "@bookbuddy/shared";

/** Domain rules for book clubs (no Mongoose / Nest). */
export class ClubMembershipPolicy {
  static assertUserNotInAnyClub(
    isInAnyClub: boolean,
    message = "User is already in a club",
  ): void {
    if (isInAnyClub) {
      throw AppError.badRequest(message);
    }
  }

  static assertClubExists<T>(club: T | null | undefined): asserts club is T {
    if (!club) {
      throw AppError.notFound("Club not found");
    }
  }

  static assertIsMember(isMember: boolean): void {
    if (!isMember) {
      throw AppError.badRequest("User is not a member of this club");
    }
  }

  static assertMembershipRecord<T>(
    membership: T | null | undefined,
  ): asserts membership is T {
    if (!membership) {
      throw AppError.notFound("Member not found in this club");
    }
  }

  static assertIsClubAdmin(isAdmin: boolean): void {
    if (!isAdmin) {
      throw AppError.forbidden("Only club admins can perform this action");
    }
  }
}
