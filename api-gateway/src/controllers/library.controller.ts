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
} from "@nestjs/swagger";
import { LibraryVisibility } from "../../../library/schemas/library.schema";

@ApiTags("Library (Proxy)")
@Controller("library")
export class LibraryController {
  constructor(
    @Inject("LIBRARY_SERVICE") private readonly libraryClient: ClientProxy
  ) {}

  @Get(":userId")
  @ApiOperation({ summary: "Get user library" })
  @ApiParam({ name: "userId", required: true, description: "User ID" })
  @ApiResponse({ status: HttpStatus.OK, description: "User library data" })
  async getLibrary(@Param("userId") userId: string) {
    return firstValueFrom(
      this.libraryClient.send({ cmd: "get-library" }, userId)
    );
  }

  @Post("custom")
  @ApiOperation({ summary: "Create custom library" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        userId: { type: "string" },
        customName: { type: "string" },
        visibility: { type: "string", enum: Object.values(LibraryVisibility) },
      },
      required: ["userId", "customName", "visibility"],
    },
  })
  @ApiResponse({ status: HttpStatus.CREATED, description: "Library created" })
  async createCustomLibrary(
    @Body()
    payload: {
      userId: string;
      customName: string;
      visibility: LibraryVisibility;
    }
  ) {
    return firstValueFrom(
      this.libraryClient.send({ cmd: "create-custom-library" }, payload)
    );
  }

  @Delete("custom/:userId/:libraryId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete custom library" })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiParam({ name: "libraryId", description: "Library ID" })
  async deleteCustomLibrary(
    @Param("userId") userId: string,
    @Param("libraryId") libraryId: string
  ) {
    return firstValueFrom(
      this.libraryClient.send(
        { cmd: "delete-custom-library" },
        { userId, libraryId }
      )
    );
  }

  @Get("books/:userId/:libraryId")
  @ApiOperation({ summary: "Get books in library" })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiParam({ name: "libraryId", description: "Library ID" })
  async getBooksInLibrary(
    @Param("userId") userId: string,
    @Param("libraryId") libraryId: string
  ) {
    return firstValueFrom(
      this.libraryClient.send(
        { cmd: "get-books-in-library" },
        { userId, libraryId }
      )
    );
  }

  @Post("books")
  @ApiOperation({ summary: "Add book to library" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        bookId: { type: "string" },
        libraryId: { type: "string" },
      },
      required: ["bookId", "libraryId"],
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: "Book added" })
  async addBookToLibrary(
    @Body() payload: { bookId: string; libraryId: string }
  ) {
    return firstValueFrom(
      this.libraryClient.send({ cmd: "add-book-to-library" }, payload)
    );
  }

  @Delete("books")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove book from library" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        bookId: { type: "string" },
        libraryId: { type: "string" },
      },
      required: ["bookId", "libraryId"],
    },
  })
  async removeBookFromLibrary(
    @Body() payload: { bookId: string; libraryId: string }
  ) {
    return firstValueFrom(
      this.libraryClient.send({ cmd: "remove-book-from-library" }, payload)
    );
  }

  @Post("books/check")
  @ApiOperation({ summary: "Check if book is in library" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        bookId: { type: "string" },
        libraryId: { type: "string" },
      },
      required: ["bookId", "libraryId"],
    },
  })
  async checkBookInLibrary(
    @Body() payload: { bookId: string; libraryId: string }
  ) {
    return firstValueFrom(
      this.libraryClient.send({ cmd: "check-book-in-library" }, payload)
    );
  }

  @Patch("visibility")
  @ApiOperation({ summary: "Update library visibility" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        userId: { type: "string" },
        libraryId: { type: "string" },
        visibility: { type: "string", enum: Object.values(LibraryVisibility) },
      },
      required: ["userId", "libraryId", "visibility"],
    },
  })
  async updateLibraryVisibility(
    @Body()
    payload: {
      userId: string;
      libraryId: string;
      visibility: LibraryVisibility;
    }
  ) {
    return firstValueFrom(
      this.libraryClient.send({ cmd: "update-library-visibility" }, payload)
    );
  }
}
