import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { BookService } from "./book.service";
import { GetBooksDto } from "./dto/get.books.dto";
import { AddCommentDto } from "./dto/add.comment.dto";
import { ToggleReactionDto } from "./dto/toggle.reaction.dto";

@Controller()
export class BookListener {
  constructor(private readonly bookService: BookService) {}

  @MessagePattern({ cmd: "count-books" })
  async countBooks(): Promise<number> {
    return this.bookService.countBooks();
  }

  @MessagePattern({ cmd: "get-books" })
  async getBooks(@Payload() dto: GetBooksDto) {
    const { page, limit, sortBy, order, query } = dto;
    return this.bookService.getBooks(page, limit, sortBy, order, query);
  }

  @MessagePattern({ cmd: "get-book-by-id" })
  async getBookById(@Payload() bookId: string) {
    return this.bookService.getBookById(bookId);
  }

  @MessagePattern({ cmd: "add-comment-to-book" })
  async addCommentToBook(@Payload() dto: AddCommentDto) {
    return this.bookService.addCommentToBook(
      dto.bookId,
      dto.userId,
      dto.commentText
    );
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
  async toggleReaction(@Payload() dto: ToggleReactionDto) {
    return this.bookService.toggleReaction(
      dto.commentId,
      dto.userId,
      dto.reactionType
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
