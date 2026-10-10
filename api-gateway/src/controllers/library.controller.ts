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
import { sendRpc } from "src/common/rpc/send-rpc";
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import {
  CreateCustomLibraryBodyDto,
  CreateCustomLibraryDto,
  LibraryBookBodyDto,
  LibraryBookPayloadDto,
  LibraryCmd,
  LibraryUserScopeDto,
  LibraryViewerBooksDto,
  LibraryViewerScopeDto,
  UpdateLibraryVisibilityBodyDto,
  UpdateLibraryVisibilityDto,
} from "@bookbuddy/shared";
import { CurrentUser } from "../common/decorators/current.user.decorator";
import { RequestUser } from "../common/types/request-user";
import {
  CreateCustomLibraryApiDto,
  LibraryBookPayloadApiDto,
  UpdateLibraryVisibilityApiDto,
} from "../dto/swagger/library.swagger";

@ApiBearerAuth()
@ApiTags("Library (Proxy)")
@Controller("library")
export class LibraryController {
  constructor(@Inject("LIBRARY_SERVICE") private readonly libraryClient: ClientProxy) {}

  @Get("users/:ownerId/shelves")
  @ApiOperation({ summary: "List shelves visible to me for another user" })
  @ApiParam({ name: "ownerId", description: "Library owner user id" })
  async listVisibleShelves(
    @Param("ownerId") ownerId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const payload: LibraryViewerScopeDto = { ownerId, viewerId: user.userId };
    return sendRpc<unknown>(
      this.libraryClient,
      { cmd: LibraryCmd.LIST_VISIBLE_SHELVES },
      payload,
    );
  }

  @Get("users/:ownerId/shelves/:libraryId/books")
  @ApiOperation({ summary: "Books on a shelf visible to me" })
  async getVisibleShelfBooks(
    @Param("ownerId") ownerId: string,
    @Param("libraryId") libraryId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const payload: LibraryViewerBooksDto = {
      ownerId,
      libraryId,
      viewerId: user.userId,
    };
    return sendRpc<unknown>(
      this.libraryClient,
      { cmd: LibraryCmd.GET_BOOKS_FOR_VIEWER },
      payload,
    );
  }

  @Get("me")
  @ApiOperation({ summary: "List my library shelves" })
  async listMyLibraries(@CurrentUser() user: RequestUser) {
    return sendRpc<unknown>(
      this.libraryClient,
      { cmd: LibraryCmd.LIST_LIBRARIES },
      user.userId,
    );
  }

  @Post("custom")
  @ApiOperation({ summary: "Create custom library shelf" })
  @ApiBody({ type: CreateCustomLibraryApiDto })
  async createCustomLibrary(
    @Body() body: CreateCustomLibraryBodyDto,
    @CurrentUser() user: RequestUser,
  ) {
    const payload: CreateCustomLibraryDto = { userId: user.userId, ...body };
    return sendRpc<unknown>(
      this.libraryClient,
      { cmd: LibraryCmd.CREATE_CUSTOM },
      payload,
    );
  }

  @Delete("custom/:libraryId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete custom library" })
  @ApiParam({ name: "libraryId", description: "Library ID" })
  async deleteCustomLibrary(
    @Param("libraryId") libraryId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const payload: LibraryUserScopeDto = { userId: user.userId, libraryId };
    return sendRpc<unknown>(
      this.libraryClient,
      { cmd: LibraryCmd.DELETE_CUSTOM },
      payload,
    );
  }

  @Get("books/:libraryId")
  @ApiOperation({ summary: "Get books in my library shelf" })
  @ApiParam({ name: "libraryId", description: "Library ID" })
  async getBooksInLibrary(
    @Param("libraryId") libraryId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const payload: LibraryUserScopeDto = { userId: user.userId, libraryId };
    return sendRpc<unknown>(this.libraryClient, { cmd: LibraryCmd.GET_BOOKS }, payload);
  }

  @Post("books")
  @ApiOperation({ summary: "Add book to library" })
  @ApiBody({ type: LibraryBookPayloadApiDto })
  async addBookToLibrary(
    @Body() body: LibraryBookBodyDto,
    @CurrentUser() user: RequestUser,
  ) {
    const payload: LibraryBookPayloadDto = { userId: user.userId, ...body };
    return sendRpc<unknown>(this.libraryClient, { cmd: LibraryCmd.ADD_BOOK }, payload);
  }

  @Delete("books")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove book from library" })
  @ApiBody({ type: LibraryBookPayloadApiDto })
  async removeBookFromLibrary(
    @Body() body: LibraryBookBodyDto,
    @CurrentUser() user: RequestUser,
  ) {
    const payload: LibraryBookPayloadDto = { userId: user.userId, ...body };
    return sendRpc<unknown>(this.libraryClient, { cmd: LibraryCmd.REMOVE_BOOK }, payload);
  }

  @Post("books/check")
  @ApiOperation({ summary: "Check if book is in library" })
  @ApiBody({ type: LibraryBookPayloadApiDto })
  async checkBookInLibrary(
    @Body() body: LibraryBookBodyDto,
    @CurrentUser() user: RequestUser,
  ) {
    const payload: LibraryBookPayloadDto = { userId: user.userId, ...body };
    return sendRpc<unknown>(this.libraryClient, { cmd: LibraryCmd.CHECK_BOOK }, payload);
  }

  @Patch("visibility")
  @ApiOperation({ summary: "Update library visibility" })
  @ApiBody({ type: UpdateLibraryVisibilityApiDto })
  async updateLibraryVisibility(
    @Body() body: UpdateLibraryVisibilityBodyDto,
    @CurrentUser() user: RequestUser,
  ) {
    const payload: UpdateLibraryVisibilityDto = { userId: user.userId, ...body };
    return sendRpc<unknown>(
      this.libraryClient,
      { cmd: LibraryCmd.UPDATE_VISIBILITY },
      payload,
    );
  }
}
