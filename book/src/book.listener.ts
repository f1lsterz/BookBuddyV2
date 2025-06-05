import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { BookService } from "./book.service";

@Controller()
export class BookListener {
  constructor(private readonly bookService: BookService) {}

  @MessagePattern({ cmd: "count-books" })
  async countBooks(): Promise<number> {
    return this.bookService.countBooks();
  }

  @MessagePattern({ cmd: "get-books" })
  async getBooks(
    @Payload()
    payload: {
      page?: number;
      limit?: number;
      sortBy?: string;
      order?: "asc" | "desc";
      query?: string;
    }
  ) {
    const {
      page = 1,
      limit = 10,
      sortBy = "title",
      order = "asc",
      query = "",
    } = payload;
    return this.bookService.getBooks(page, limit, sortBy, order, query);
  }

  @MessagePattern({ cmd: "get-book-by-id" })
  async getBookById(@Payload() bookId: string) {
    return this.bookService.getBookById(bookId);
  }

  @MessagePattern({ cmd: "add-comment-to-book" })
  async addCommentToBook(
    @Payload()
    payload: {
      bookId: string;
      userId: string;
      commentText: string;
    }
  ) {
    const { bookId, userId, commentText } = payload;
    return this.bookService.addCommentToBook(bookId, userId, commentText);
  }

  @MessagePattern({ cmd: "get-comments-for-book" })
  async getCommentsForBook(@Payload() bookId: string) {
    return this.bookService.getCommentsForBook(bookId);
  }

  @MessagePattern({ cmd: "delete-comment" })
  async deleteComment(
    @Payload() payload: { commentId: string; userId: string }
  ) {
    const { commentId, userId } = payload;
    return this.bookService.deleteComment(commentId, userId);
  }

  @MessagePattern({ cmd: "toggle-reaction" })
  async toggleReaction(
    @Payload()
    payload: {
      commentId: string;
      userId: string;
      reactionType: string;
    }
  ) {
    const { commentId, userId, reactionType } = payload;
    return this.bookService.toggleReaction(
      commentId,
      userId,
      reactionType as any
    );
  }

  @MessagePattern({ cmd: "calculate-average-rating" })
  async calculateAverageRating(@Payload() bookId: string) {
    return this.bookService.calculateAverageRating(bookId);
  }

  @MessagePattern({ cmd: "get-average-rating" })
  async getAverageRating(@Payload() bookId: string) {
    return this.bookService.getAverageRating(bookId);
  }

  @MessagePattern({ cmd: "get-user-book-rating" })
  async getUserBookRating(
    @Payload() payload: { bookId: string; userId: string }
  ) {
    const { bookId, userId } = payload;
    return this.bookService.getUserBookRating(bookId, userId);
  }

  @MessagePattern({ cmd: "upsert-user-book-rating" })
  async upsertUserBookRating(
    @Payload() payload: { bookId: string; userId: string; newRating: number }
  ) {
    const { bookId, userId, newRating } = payload;
    return this.bookService.upsertUserBookRating(bookId, userId, newRating);
  }

  @MessagePattern({ cmd: "delete-user-book-rating" })
  async deleteUserBookRating(
    @Payload() payload: { bookId: string; userId: string }
  ) {
    const { bookId, userId } = payload;
    return this.bookService.deleteUserBookRating(bookId, userId);
  }
}
