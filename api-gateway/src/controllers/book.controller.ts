import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  HttpStatus,
  HttpCode,
  Query,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { sendRpc } from "src/common/rpc/send-rpc";
import {
  AddCommentBodyDto,
  AddCommentDto,
  BookCmd,
  BookUserRpcDto,
  DeleteCommentRpcDto,
  GetBooksQueryDto,
  ToggleReactionBodyDto,
  ToggleReactionDto,
  UpsertBookRatingBodyDto,
  UpsertBookRatingRpcDto,
} from "@bookbuddy/shared";
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { Public } from "../common/decorators/public.decorator";
import { CurrentUser } from "../common/decorators/current.user.decorator";
import { RequestUser } from "../common/types/request-user";
import {
  AddCommentBodyApiDto,
  ToggleReactionBodyApiDto,
  UpsertBookRatingBodyApiDto,
} from "../dto/swagger/book.swagger";

@ApiBearerAuth()
@ApiTags("Books (Proxy)")
@Controller("book")
export class BookController {
  constructor(@Inject("BOOK_SERVICE") private readonly bookClient: ClientProxy) {}

  @Public()
  @Get("count")
  @ApiOperation({ summary: "Count all books" })
  async countBooks() {
    return sendRpc<unknown>(this.bookClient, { cmd: BookCmd.COUNT }, {});
  }

  @Public()
  @Get()
  @ApiOperation({ summary: "Get paginated list of books" })
  async getBooks(@Query() payload: GetBooksQueryDto) {
    return sendRpc<unknown>(this.bookClient, { cmd: BookCmd.GET_LIST }, payload);
  }

  @Public()
  @Get(":id")
  @ApiOperation({ summary: "Get book by ID" })
  @ApiParam({ name: "id", required: true, description: "Book ID" })
  async getBookById(@Param("id") id: string) {
    return sendRpc<unknown>(this.bookClient, { cmd: BookCmd.GET_BY_ID }, id);
  }

  @Post(":id/comment")
  @ApiOperation({ summary: "Add comment to book" })
  @ApiBody({ type: AddCommentBodyApiDto })
  async addCommentToBook(
    @Param("id") bookId: string,
    @Body() body: AddCommentBodyDto,
    @CurrentUser() user: RequestUser,
  ) {
    const dto: AddCommentDto = {
      bookId,
      userId: user.userId,
      commentText: body.commentText,
    };
    return sendRpc<unknown>(this.bookClient, { cmd: BookCmd.ADD_COMMENT }, dto);
  }

  @Public()
  @Get(":id/comments")
  @ApiOperation({ summary: "Get comments for book" })
  async getCommentsForBook(@Param("id") bookId: string) {
    return sendRpc<unknown>(this.bookClient, { cmd: BookCmd.GET_COMMENTS }, bookId);
  }

  @Delete("comment/:commentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete comment" })
  async deleteComment(
    @Param("commentId") commentId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const payload: DeleteCommentRpcDto = { commentId, userId: user.userId };
    return sendRpc<unknown>(this.bookClient, { cmd: BookCmd.DELETE_COMMENT }, payload);
  }

  @Post("comment/:commentId/reaction")
  @ApiOperation({ summary: "Toggle reaction on comment" })
  @ApiBody({ type: ToggleReactionBodyApiDto })
  async toggleReaction(
    @Param("commentId") commentId: string,
    @Body() body: ToggleReactionBodyDto,
    @CurrentUser() user: RequestUser,
  ) {
    const dto: ToggleReactionDto = {
      commentId,
      userId: user.userId,
      reactionType: body.reactionType,
    };
    return sendRpc<unknown>(this.bookClient, { cmd: BookCmd.TOGGLE_REACTION }, dto);
  }

  @Public()
  @Get(":id/average-rating")
  @ApiOperation({ summary: "Get average rating for book" })
  async getAverageRating(@Param("id") bookId: string) {
    return sendRpc<unknown>(this.bookClient, { cmd: BookCmd.GET_AVERAGE_RATING }, bookId);
  }

  @Get(":id/user-rating/me")
  @ApiOperation({ summary: "Get my rating for book" })
  async getMyBookRating(@Param("id") bookId: string, @CurrentUser() user: RequestUser) {
    const payload: BookUserRpcDto = { bookId, userId: user.userId };
    return sendRpc<unknown>(this.bookClient, { cmd: BookCmd.GET_USER_RATING }, payload);
  }

  @Post(":id/user-rating")
  @ApiOperation({ summary: "Create or update my rating for book" })
  @ApiBody({ type: UpsertBookRatingBodyApiDto })
  async upsertUserBookRating(
    @Param("id") bookId: string,
    @Body() body: UpsertBookRatingBodyDto,
    @CurrentUser() user: RequestUser,
  ) {
    const payload: UpsertBookRatingRpcDto = {
      bookId,
      userId: user.userId,
      newRating: body.newRating,
    };
    return sendRpc<unknown>(
      this.bookClient,
      { cmd: BookCmd.UPSERT_USER_RATING },
      payload,
    );
  }

  @Delete(":id/user-rating/me")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete my rating for book" })
  async deleteMyBookRating(
    @Param("id") bookId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const payload: BookUserRpcDto = { bookId, userId: user.userId };
    return sendRpc<unknown>(
      this.bookClient,
      { cmd: BookCmd.DELETE_USER_RATING },
      payload,
    );
  }
}
