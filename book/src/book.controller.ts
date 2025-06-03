import {
  Controller,
  Get,
  Post,
  Delete,
  HttpCode,
  Param,
  Body,
} from "@nestjs/common";
import { BookService } from "./book.service";
import { BookByIdPipe } from "src/common/pipes/ExistById/BookById";
import { UserByIdPipe } from "src/common/pipes/NotExistById/UserByIdNot";
import { CommentByIdPipe } from "src/common/pipes/ExistById/CommentById";
import { BookRatingByIdPipe } from "src/common/pipes/ExistById/BookRatingById";

@Controller("book")
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get()
  @HttpCode(200)
  async getBooks() {
    return await this.bookService.getBooks();
  }

  @Get(":bookId")
  @HttpCode(200)
  async getBookById(@Param("bookId", BookByIdPipe) bookId: number) {
    return await this.bookService.getBookById(bookId);
  }

  @Post(":bookId/comment")
  @HttpCode(201)
  async addCommentToBook(
    @Param("bookId", BookByIdPipe) bookId: number,
    @Body("userId", UserByIdPipe) userId: number,
    @Body("commentText") commentText: string
  ) {
    return await this.bookService.addCommentToBook(bookId, userId, commentText);
  }

  @Get(":bookId/comment")
  @HttpCode(200)
  async getCommentsForBook(@Param("bookId", BookByIdPipe) bookId: number) {
    return await this.bookService.getCommentsForBook(bookId);
  }

  @Delete("comment/:commentId/:userId")
  @HttpCode(204)
  async deleteComment(
    @Param("commentId", CommentByIdPipe) commentId: number,
    @Param("userId", UserByIdPipe) userId: number
  ) {
    return await this.bookService.deleteComment(commentId, userId);
  }

  @Get("comment/:commentId/reaction")
  @HttpCode(200)
  async toggleReaction(
    @Param("commentId", CommentByIdPipe) commentId: number,
    @Body("userId", UserByIdPipe) userId: number,
    @Body("reactionType") reactionType: string
  ) {
    return await this.bookService.toggleReaction(
      commentId,
      userId,
      reactionType
    );
  }

  @Get(":bookId/avgrating")
  @HttpCode(200)
  async getAverageRating(@Param("bookId") bookId: number) {
    return await this.bookService.getAverageRating(bookId);
  }

  @Get(":bookId/:userId/rating")
  @HttpCode(200)
  async getUserBookRating(
    @Param("bookId", BookRatingByIdPipe) bookId: number,
    @Param("userId") userId: number
  ) {
    return await this.bookService.getUserBookRating(bookId, userId);
  }

  @Post(":bookId/:userId/rating")
  @HttpCode(200)
  async upsertUserBookRating(
    @Param("bookId") bookId: number,
    @Param("userId") userId: number,
    @Body("rating") rating: number
  ) {
    return await this.bookService.upsertUserBookRating(bookId, userId, rating);
  }

  @Delete(":bookId/:userId/rating")
  @HttpCode(204)
  async deleteUserBookRating(
    @Param("bookId", BookRatingByIdPipe) bookId: number,
    @Param("userId") userId: number
  ) {
    return await this.bookService.deleteUserBookRating(bookId, userId);
  }

  @Get(":userId/recommended")
  @HttpCode(200)
  async getRecommendedBooks(@Param("userId") userId: number) {
    return await this.bookService.getRecommendedBooks(userId);
  }
}
