import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { CommentReactionType } from "@bookbuddy/shared";
import { Cache } from "cache-manager";
import { Types } from "mongoose";
import { Book, BookDocument, BookRatingDocument } from "../../schemas/book.schema";
import { CommentDocument } from "../../schemas/comment.schema";
import { CACHE_BOOKS } from "../config/cache.keys";
import { BookPolicy } from "../domain/book.policy";
import { BookRepository } from "../infrastructure/book.repository";
import { CommentRepository } from "../infrastructure/comment.repository";

@Injectable()
export class BookApplicationService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly bookRepository: BookRepository,
    private readonly commentRepository: CommentRepository,
  ) {}

  async countBooks(): Promise<number> {
    return this.bookRepository.countDocuments();
  }

  async getBooks(
    page = 1,
    limit = 10,
    sortBy: string = "title",
    order: "asc" | "desc" = "asc",
    query = "",
  ): Promise<Book[]> {
    const key = CACHE_BOOKS.BOOK_LIST(page, limit, query);
    const cached = await this.cacheManager.get<Book[]>(key);
    if (cached) return cached;

    const books = await this.bookRepository.findPaginated(
      page,
      limit,
      sortBy,
      order,
      query,
    );
    await this.cacheManager.set(key, books, 3600);
    return books;
  }

  async getBookById(bookId: string): Promise<BookDocument | null> {
    if (!Types.ObjectId.isValid(bookId)) return null;

    const key = CACHE_BOOKS.BOOK(bookId);
    const cached = await this.cacheManager.get<BookDocument>(key);
    if (cached) return cached;

    const book = await this.bookRepository.findById(bookId);
    await this.cacheManager.set(key, book, 3600);
    return book;
  }

  async addCommentToBook(
    bookId: string,
    userId: string,
    commentText: string,
  ): Promise<CommentDocument> {
    BookPolicy.assertValidObjectIds([
      { value: bookId, label: "book ID" },
      { value: userId, label: "user ID" },
    ]);

    const comment = await this.commentRepository.createComment(
      bookId,
      userId,
      commentText,
    );
    await this.bookRepository.incrementCommentCount(bookId, 1);
    await this.cacheManager.del(CACHE_BOOKS.COMMENTS(bookId));
    return comment;
  }

  async getCommentsForBook(bookId: string): Promise<CommentDocument[]> {
    if (!Types.ObjectId.isValid(bookId)) return [];

    const key = CACHE_BOOKS.COMMENTS(bookId);
    const cached = await this.cacheManager.get<CommentDocument[]>(key);
    if (cached) return cached;

    const comments = await this.commentRepository.findByBook(bookId);
    await this.cacheManager.set(key, comments, 3600);
    return comments;
  }

  async deleteComment(
    commentId: string,
    userId: string,
  ): Promise<CommentDocument | null> {
    BookPolicy.assertValidObjectIds([
      { value: commentId, label: "comment ID" },
      { value: userId, label: "user ID" },
    ]);

    const comment = await this.commentRepository.findOwned(commentId, userId);
    BookPolicy.assertCommentOwned(comment);

    await this.bookRepository.incrementCommentCount(comment.bookId.toString(), -1);
    await this.commentRepository.deleteById(commentId);
    await this.cacheManager.del(CACHE_BOOKS.COMMENTS(comment.bookId.toString()));
    return comment;
  }

  async toggleReaction(
    commentId: string,
    userId: string,
    reactionType: CommentReactionType,
  ): Promise<void> {
    BookPolicy.assertValidObjectIds([
      { value: commentId, label: "comment ID" },
      { value: userId, label: "user ID" },
    ]);
    BookPolicy.assertValidReactionType(reactionType);

    const comment = await this.commentRepository.findById(commentId);
    BookPolicy.assertCommentExists(comment);

    const existingReaction = await this.commentRepository.findUserReaction(
      commentId,
      userId,
    );

    if (existingReaction) {
      if (existingReaction.reaction === reactionType) {
        await this.commentRepository.deleteReaction(existingReaction._id);
        if (reactionType === CommentReactionType.LIKE) {
          comment.likes = Math.max(0, comment.likes - 1);
        } else {
          comment.dislikes = Math.max(0, comment.dislikes - 1);
        }
      } else {
        existingReaction.reaction = reactionType;
        await existingReaction.save();
        if (reactionType === CommentReactionType.LIKE) {
          comment.likes = comment.likes + 1;
          comment.dislikes = Math.max(0, comment.dislikes - 1);
        } else {
          comment.dislikes = comment.dislikes + 1;
          comment.likes = Math.max(0, comment.likes - 1);
        }
      }
    } else {
      await this.commentRepository.createReaction(commentId, userId, reactionType);
      if (reactionType === CommentReactionType.LIKE) {
        comment.likes = comment.likes + 1;
      } else {
        comment.dislikes = comment.dislikes + 1;
      }
    }

    await comment.save();
  }

  async calculateAverageRating(bookId: string): Promise<BookDocument | null> {
    if (!Types.ObjectId.isValid(bookId)) return null;

    const ratings = await this.bookRepository.findRatingsByBook(bookId);
    if (!ratings.length) return null;

    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / ratings.length;
    const roundedAverageRating = Math.round(averageRating * 2) / 2;

    return this.bookRepository.updateAverageRating(bookId, roundedAverageRating);
  }

  async getAverageRating(bookId: string): Promise<number | null> {
    if (!Types.ObjectId.isValid(bookId)) return null;
    const book = await this.bookRepository.findByIdSelectAverage(bookId);
    return book?.averageRating ?? null;
  }

  async getUserBookRating(
    bookId: string,
    userId: string,
  ): Promise<BookRatingDocument | null> {
    if (!Types.ObjectId.isValid(bookId) || !Types.ObjectId.isValid(userId)) return null;
    return this.bookRepository.findUserRating(bookId, userId);
  }

  async upsertUserBookRating(
    bookId: string,
    userId: string,
    newRating: number,
  ): Promise<BookRatingDocument> {
    BookPolicy.assertRatingValue(newRating);
    BookPolicy.assertValidObjectIds([
      { value: bookId, label: "book ID" },
      { value: userId, label: "user ID" },
    ]);
    return this.bookRepository.upsertUserRating(bookId, userId, newRating);
  }

  async deleteUserBookRating(bookId: string, userId: string): Promise<void> {
    BookPolicy.assertValidObjectIds([
      { value: bookId, label: "book ID" },
      { value: userId, label: "user ID" },
    ]);
    await this.bookRepository.deleteUserRating(bookId, userId);
  }
}
