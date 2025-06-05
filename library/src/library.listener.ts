import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { LibraryService } from "./library.service";
import { LibraryVisibility } from "schemas/library.schema";

@Controller()
export class LibraryListener {
  constructor(private readonly libraryService: LibraryService) {}

  @MessagePattern({ cmd: "get-library" })
  async getLibrary(@Payload() userId: string) {
    return this.libraryService.getLibrary(userId);
  }

  @MessagePattern({ cmd: "create-custom-library" })
  async createCustomLibrary(
    @Payload()
    payload: {
      userId: string;
      customName: string;
      visibility: LibraryVisibility;
    }
  ) {
    const { userId, customName, visibility } = payload;
    return this.libraryService.createCustomLibrary(
      userId,
      customName,
      visibility
    );
  }

  @MessagePattern({ cmd: "delete-custom-library" })
  async deleteCustomLibrary(
    @Payload() payload: { userId: string; libraryId: string }
  ) {
    const { userId, libraryId } = payload;
    return this.libraryService.deleteCustomLibrary(userId, libraryId);
  }

  @MessagePattern({ cmd: "get-books-in-library" })
  async getBooksInLibrary(
    @Payload() payload: { userId: string; libraryId: string }
  ) {
    const { userId, libraryId } = payload;
    return this.libraryService.getBooksInLibrary(userId, libraryId);
  }

  @MessagePattern({ cmd: "add-book-to-library" })
  async addBookToLibrary(
    @Payload() payload: { bookId: string; libraryId: string }
  ) {
    const { bookId, libraryId } = payload;
    return this.libraryService.addBookToLibrary(bookId, libraryId);
  }

  @MessagePattern({ cmd: "remove-book-from-library" })
  async removeBookFromLibrary(
    @Payload() payload: { bookId: string; libraryId: string }
  ) {
    const { bookId, libraryId } = payload;
    return this.libraryService.removeBookFromLibrary(bookId, libraryId);
  }

  @MessagePattern({ cmd: "check-book-in-library" })
  async checkBookInLibrary(
    @Payload() payload: { bookId: string; libraryId: string }
  ) {
    const { bookId, libraryId } = payload;
    return this.libraryService.checkBookInLibrary(bookId, libraryId);
  }

  @MessagePattern({ cmd: "update-library-visibility" })
  async updateLibraryVisibility(
    @Payload()
    payload: {
      userId: string;
      libraryId: string;
      visibility: LibraryVisibility;
    }
  ) {
    const { userId, libraryId, visibility } = payload;
    return this.libraryService.updateLibraryVisibility(
      userId,
      libraryId,
      visibility
    );
  }
}
