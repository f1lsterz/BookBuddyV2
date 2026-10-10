import { AppError, CommentReactionType } from "@bookbuddy/shared";
import { Types } from "mongoose";

export class BookPolicy {
  static assertValidObjectId(id: string, label = "ID"): void {
    if (!Types.ObjectId.isValid(id)) {
      throw AppError.badRequest(`Invalid ${label}`);
    }
  }

  static assertValidObjectIds(ids: { value: string; label: string }[]): void {
    for (const { value, label } of ids) {
      this.assertValidObjectId(value, label);
    }
  }

  static assertCommentOwned<T>(comment: T | null | undefined): asserts comment is T {
    if (!comment) {
      throw AppError.badRequest("Comment not found or not your comment");
    }
  }

  static assertCommentExists<T>(comment: T | null | undefined): asserts comment is T {
    if (!comment) {
      throw AppError.badRequest("Comment not found");
    }
  }

  static assertValidReactionType(reactionType: CommentReactionType): void {
    if (![CommentReactionType.LIKE, CommentReactionType.DISLIKE].includes(reactionType)) {
      throw AppError.badRequest("Invalid reaction type");
    }
  }

  static assertRatingValue(newRating: number): void {
    if (newRating < 0 || newRating > 5 || newRating % 0.5 !== 0) {
      throw AppError.badRequest("Invalid rating value");
    }
  }
}
