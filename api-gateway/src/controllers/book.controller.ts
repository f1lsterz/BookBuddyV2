import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";

@ApiTags("Books (Proxy)")
@Controller("book")
export class BookController {
  constructor(
    @Inject("BOOK_SERVICE") private readonly bookClient: ClientProxy
  ) {}

  @Get("count")
  @ApiOperation({ summary: "Count all books" })
  @ApiResponse({ status: HttpStatus.OK, description: "Number of books" })
  async countBooks() {
    return firstValueFrom(this.bookClient.send({ cmd: "count-books" }, {}));
  }

  @Get()
  @ApiOperation({ summary: "Get paginated list of books" })
  @ApiResponse({ status: HttpStatus.OK, description: "List of books" })
  async getBooks(
    @Body()
    payload: {
      page?: number;
      limit?: number;
      sortBy?: string;
      order?: "asc" | "desc";
      query?: string;
    }
  ) {
    return firstValueFrom(this.bookClient.send({ cmd: "get-books" }, payload));
  }

  @Get(":id")
  @ApiOperation({ summary: "Get book by ID" })
  @ApiParam({ name: "id", required: true, description: "Book ID" })
  @ApiResponse({ status: HttpStatus.OK, description: "Book found" })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: "Book not found" })
  async getBookById(@Param("id") id: string) {
    return firstValueFrom(this.bookClient.send({ cmd: "get-book-by-id" }, id));
  }

  @Post(":id/comment")
  @ApiOperation({ summary: "Add comment to book" })
  @ApiParam({ name: "id", required: true, description: "Book ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        userId: { type: "string" },
        commentText: { type: "string" },
      },
      required: ["userId", "commentText"],
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: "Comment added" })
  async addCommentToBook(
    @Param("id") bookId: string,
    @Body() body: { userId: string; commentText: string }
  ) {
    return firstValueFrom(
      this.bookClient.send(
        { cmd: "add-comment-to-book" },
        { bookId, userId: body.userId, commentText: body.commentText }
      )
    );
  }

  @Get(":id/comments")
  @ApiOperation({ summary: "Get comments for book" })
  @ApiParam({ name: "id", required: true, description: "Book ID" })
  @ApiResponse({ status: HttpStatus.OK, description: "List of comments" })
  async getCommentsForBook(@Param("id") bookId: string) {
    return firstValueFrom(
      this.bookClient.send({ cmd: "get-comments-for-book" }, bookId)
    );
  }

  @Delete("comment/:commentId")
  @ApiOperation({ summary: "Delete comment" })
  @ApiParam({ name: "commentId", required: true, description: "Comment ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        userId: { type: "string" },
      },
      required: ["userId"],
    },
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: "Comment deleted",
  })
  async deleteComment(
    @Param("commentId") commentId: string,
    @Body() body: { userId: string }
  ) {
    return firstValueFrom(
      this.bookClient.send(
        { cmd: "delete-comment" },
        { commentId, userId: body.userId }
      )
    );
  }

  @Post("comment/:commentId/reaction")
  @ApiOperation({ summary: "Toggle reaction on comment" })
  @ApiParam({ name: "commentId", required: true, description: "Comment ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        userId: { type: "string" },
        reactionType: { type: "string" },
      },
      required: ["userId", "reactionType"],
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: "Reaction toggled" })
  async toggleReaction(
    @Param("commentId") commentId: string,
    @Body() body: { userId: string; reactionType: string }
  ) {
    return firstValueFrom(
      this.bookClient.send(
        { cmd: "toggle-reaction" },
        { commentId, userId: body.userId, reactionType: body.reactionType }
      )
    );
  }

  @Get(":id/average-rating")
  @ApiOperation({ summary: "Get average rating for book" })
  @ApiParam({ name: "id", required: true, description: "Book ID" })
  async getAverageRating(@Param("id") bookId: string) {
    return firstValueFrom(
      this.bookClient.send({ cmd: "get-average-rating" }, bookId)
    );
  }

  @Get(":id/user-rating/:userId")
  @ApiOperation({ summary: "Get user's rating for book" })
  @ApiParam({ name: "id", required: true, description: "Book ID" })
  @ApiParam({ name: "userId", required: true, description: "User ID" })
  async getUserBookRating(
    @Param("id") bookId: string,
    @Param("userId") userId: string
  ) {
    return firstValueFrom(
      this.bookClient.send({ cmd: "get-user-book-rating" }, { bookId, userId })
    );
  }

  @Post(":id/user-rating")
  @ApiOperation({ summary: "Create or update user's rating for book" })
  @ApiParam({ name: "id", required: true, description: "Book ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        userId: { type: "string" },
        newRating: { type: "number" },
      },
      required: ["userId", "newRating"],
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: "Rating saved" })
  async upsertUserBookRating(
    @Param("id") bookId: string,
    @Body() body: { userId: string; newRating: number }
  ) {
    return firstValueFrom(
      this.bookClient.send(
        { cmd: "upsert-user-book-rating" },
        { bookId, userId: body.userId, newRating: body.newRating }
      )
    );
  }

  @Delete(":id/user-rating/:userId")
  @ApiOperation({ summary: "Delete user's rating for book" })
  @ApiParam({ name: "id", required: true, description: "Book ID" })
  @ApiParam({ name: "userId", required: true, description: "User ID" })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: "Rating deleted" })
  async deleteUserBookRating(
    @Param("id") bookId: string,
    @Param("userId") userId: string
  ) {
    return firstValueFrom(
      this.bookClient.send(
        { cmd: "delete-user-book-rating" },
        { bookId, userId }
      )
    );
  }
}
