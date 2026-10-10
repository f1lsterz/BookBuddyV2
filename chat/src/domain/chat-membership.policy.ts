import { AppError } from "@bookbuddy/shared";

export class ChatMembershipPolicy {
  static assertIsClubMember(isMember: boolean): void {
    if (!isMember) {
      throw AppError.forbidden("You must be a club member to access this chat");
    }
  }

  static assertIsClubAdmin(isAdmin: boolean): void {
    if (!isAdmin) {
      throw AppError.forbidden("Only club admins can clear the chat");
    }
  }
}
