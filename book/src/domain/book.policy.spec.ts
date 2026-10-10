import { AppError, CommentReactionType } from "@bookbuddy/shared";
import { BookPolicy } from "./book.policy";

describe("BookPolicy", () => {
  it("rejects invalid object id", () => {
    expect(() => BookPolicy.assertValidObjectId("bad")).toThrow(AppError);
  });

  it("assertRatingValue rejects out of range", () => {
    expect(() => BookPolicy.assertRatingValue(6)).toThrow(/Invalid rating/);
    expect(() => BookPolicy.assertRatingValue(4)).not.toThrow();
  });

  it("assertValidReactionType accepts LIKE", () => {
    expect(() =>
      BookPolicy.assertValidReactionType(CommentReactionType.LIKE),
    ).not.toThrow();
  });
});
