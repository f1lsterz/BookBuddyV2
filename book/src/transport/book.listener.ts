import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  AddCommentDto,
  BookCmd,
  BookUserRpcDto,
  DeleteCommentRpcDto,
  GetBooksQueryDto,
  ToggleReactionDto,
  UpsertBookRatingRpcDto,
} from "@bookbuddy/shared";
import { BookApplicationService } from "../application/book.application.service";

@Controller()
export class BookListener {
  constructor(private readonly bookApplication: BookApplicationService) {}

  @MessagePattern({ cmd: BookCmd.COUNT })
  async countBooks(): Promise<number> {
    return this.bookApplication.countBooks();
  }

  @MessagePattern({ cmd: BookCmd.GET_LIST })
  async getBooks(@Payload() dto: GetBooksQueryDto) {
    const { page, limit, sortBy, order, query } = dto;
    return this.bookApplication.getBooks(page, limit, sortBy, order, query);
  }

  @MessagePattern({ cmd: BookCmd.GET_BY_ID })
  async getBookById(@Payload() bookId: string) {
    return this.bookApplication.getBookById(bookId);
  }

  @MessagePattern({ cmd: BookCmd.ADD_COMMENT })
  async addCommentToBook(@Payload() dto: AddCommentDto) {
    return this.bookApplication.addCommentToBook(dto.bookId, dto.userId, dto.commentText);
  }

  @MessagePattern({ cmd: BookCmd.GET_COMMENTS })
  async getCommentsForBook(@Payload() bookId: string) {
    return this.bookApplication.getCommentsForBook(bookId);
  }

  @MessagePattern({ cmd: BookCmd.DELETE_COMMENT })
  async deleteComment(@Payload() payload: DeleteCommentRpcDto) {
    return this.bookApplication.deleteComment(payload.commentId, payload.userId);
  }

  @MessagePattern({ cmd: BookCmd.TOGGLE_REACTION })
  async toggleReaction(@Payload() dto: ToggleReactionDto) {
    return this.bookApplication.toggleReaction(
      dto.commentId,
      dto.userId,
      dto.reactionType,
    );
  }

  @MessagePattern({ cmd: BookCmd.CALCULATE_AVERAGE_RATING })
  async calculateAverageRating(@Payload() bookId: string) {
    return this.bookApplication.calculateAverageRating(bookId);
  }

  @MessagePattern({ cmd: BookCmd.GET_AVERAGE_RATING })
  async getAverageRating(@Payload() bookId: string) {
    return this.bookApplication.getAverageRating(bookId);
  }

  @MessagePattern({ cmd: BookCmd.GET_USER_RATING })
  async getUserBookRating(@Payload() payload: BookUserRpcDto) {
    return this.bookApplication.getUserBookRating(payload.bookId, payload.userId);
  }

  @MessagePattern({ cmd: BookCmd.UPSERT_USER_RATING })
  async upsertUserBookRating(@Payload() payload: UpsertBookRatingRpcDto) {
    return this.bookApplication.upsertUserBookRating(
      payload.bookId,
      payload.userId,
      payload.newRating,
    );
  }

  @MessagePattern({ cmd: BookCmd.DELETE_USER_RATING })
  async deleteUserBookRating(@Payload() payload: BookUserRpcDto) {
    return this.bookApplication.deleteUserBookRating(payload.bookId, payload.userId);
  }
}
