import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}
  async fetchAndStoreBooks(searchQuery = null) {}

  async countBooks() {}
  async getBooks(
    page = 1,
    limit = 10,
    sortBy = "title",
    order = "ASC",
    query = ""
  ) {}
  async getBookById(bookId) {}
  async addCommentToBook(bookId, userId, commentText) {}
  async getCommentsForBook(bookId) {}
  async deleteComment(commentId, userId) {}
  async toggleReaction(commentId, userId, reactionType) {}
  async calculateAverageRating(bookId) {}
  async getAverageRating(bookId: number) {
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
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
