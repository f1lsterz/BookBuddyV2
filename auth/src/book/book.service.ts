import { Injectable } from "@nestjs/common";
import { ApiError } from "src/common/errors/apiError";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}
  async fetchAndStoreBooks(searchQuery = null) {}

  async countBooks() {
    return await this.prisma.book.count();
  }

  async getBooks(
    page = 1,
    limit = 10,
    sortBy = "title",
    order = "ASC",
    query = ""
  ) {
    await this.prisma.book.findMany({ where: { title: { contains: query } } });
  }
  async getBookById(bookId) {
    return await this.prisma.book.findUnique({
      where: { id: bookId },
    });
  }
  async addCommentToBook(bookId, userId, commentText) {
    const comment = await this.prisma.comment.create({
      data: { bookId, userId, comment: commentText },
    });

    await this.prisma.book.update({
      where: { id: bookId },
      data: { commentCount: { increment: 1 } },
    });

    return comment;
  }
  async getCommentsForBook(bookId) {
    return await this.prisma.comment.findMany({ where: { bookId } });
  }

  async deleteComment(commentId, userId) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId, userId },
    });

    if (!comment) {
      throw ApiError.BadRequest("Rating not found");
    }

    const bookId = comment.bookId;

    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (book) {
      await this.prisma.book.update({
        where: { id: bookId },
        data: { commentCount: Math.max(0, book.commentCount - 1) },
      });
    }

    return await this.prisma.comment.delete({
      where: { id: commentId, userId },
    });
  }
  async toggleReaction(commentId, userId, reactionType) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw ApiError.BadRequest("Rating not found");
    }

    if (!["like", "dislike"].includes(reactionType)) {
      throw ApiError.BadRequest("Rating not found");
    }

    const reaction = await this.prisma.commentReaction.findUnique({
      where: { id: commentId, userId },
    });

    if (reaction) {
      if (reaction.reaction === reactionType) {
        await this.prisma.commentReaction.delete({
          where: { id: commentId, userId },
        });

        if (reactionType === "like") {
          comment.likes = Math.max(0, comment.likes - 1);

          await this.prisma.comment.update({
            where: { id: commentId },
            data: { likes: comment.likes },
          });
        } else {
          comment.dislikes = Math.max(0, comment.dislikes - 1);

          await this.prisma.comment.update({
            where: { id: commentId },
            data: { dislikes: comment.dislikes },
          });
        }
      } else {
        await this.prisma.commentReaction.create({
          data: { commentId, userId, reaction: reactionType },
        });

        if (reactionType === "like") {
          comment.likes = Math.max(0, comment.likes + 1);

          await this.prisma.comment.update({
            where: { id: commentId },
            data: { likes: comment.likes },
          });
        } else {
          comment.dislikes = Math.max(0, comment.dislikes + 1);

          await this.prisma.comment.update({
            where: { id: commentId },
            data: { dislikes: comment.dislikes },
          });
        }
      }
    }
  }
  async calculateAverageRating(bookId) {
    const ratings = await this.prisma.bookRating.findMany({
      where: { bookId },
      select: { rating: true },
    });

    if (!ratings) return 0;

    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);

    const averageRating = totalRating / ratings.length;

    const roundedAverageRating = Math.round(averageRating * 2) / 2;

    return await this.prisma.book.update({
      where: { id: bookId },
      data: { averageRating: roundedAverageRating },
    });
  }
  async getAverageRating(bookId: number) {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
      select: { averageRating: true },
    });

    return book?.averageRating ?? null;
  }
  async getUserBookRating(bookId, userId) {
    const rating = await this.prisma.bookRating.findUnique({
      where: { bookId_userId: { bookId, userId } },
    });

    if (!rating) {
      throw ApiError.BadRequest("Rating not found");
    }

    return rating || null;
  }
  async upsertUserBookRating(bookId, userId, newRating) {
    if (newRating < 0 || newRating > 5 || newRating % 0.5 !== 0) {
      throw ApiError.BadRequest("Rating not found");
    }

    const userRating = this.prisma.bookRating.findUnique({
      where: { bookId_userId: { bookId, userId } },
    });

    if (!userRating) {
      throw ApiError.BadRequest("Rating not found");
    }

    return this.prisma.bookRating.update({
      where: { bookId_userId: { bookId, userId } },
      data: {},
    });
  }
  async deleteUserBookRating(bookId: number, userId: number) {
    const userRating = this.prisma.bookRating.findUnique({
      where: { bookId_userId: { bookId, userId } },
    });

    if (!userRating) {
      throw ApiError.BadRequest("Rating not found");
    }

    this.prisma.bookRating.delete({
      where: { bookId_userId: { bookId, userId } },
    });
  }
  async getRecommendedBooks(userId) {}
}
