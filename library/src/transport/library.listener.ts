import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  LibraryBookPayloadDto,
  LibraryCmd,
  LibraryUserScopeDto,
  LibraryViewerBooksDto,
  LibraryViewerScopeDto,
  CreateCustomLibraryDto,
  UpdateLibraryVisibilityDto,
} from "@bookbuddy/shared";
import { LibraryApplicationService } from "../application/library.application.service";

@Controller()
export class LibraryListener {
  constructor(private readonly libraryApplication: LibraryApplicationService) {}

  @MessagePattern({ cmd: LibraryCmd.GET_LIBRARY })
  async getLibrary(@Payload() userId: string) {
    return this.libraryApplication.listUserLibraries(userId);
  }

  @MessagePattern({ cmd: LibraryCmd.LIST_LIBRARIES })
  async listLibraries(@Payload() userId: string) {
    return this.libraryApplication.listUserLibraries(userId);
  }

  @MessagePattern({ cmd: LibraryCmd.PROVISION_DEFAULT })
  async provisionDefault(@Payload() userId: string) {
    return this.libraryApplication.provisionDefaultLibraries(userId);
  }

  @MessagePattern({ cmd: LibraryCmd.CREATE_CUSTOM })
  async createCustomLibrary(@Payload() payload: CreateCustomLibraryDto) {
    const { userId, customName, visibility } = payload;
    return this.libraryApplication.createCustomLibrary(userId, customName, visibility);
  }

  @MessagePattern({ cmd: LibraryCmd.DELETE_CUSTOM })
  async deleteCustomLibrary(@Payload() payload: LibraryUserScopeDto) {
    const { userId, libraryId } = payload;
    return this.libraryApplication.deleteCustomLibrary(userId, libraryId);
  }

  @MessagePattern({ cmd: LibraryCmd.GET_BOOKS })
  async getBooksInLibrary(@Payload() payload: LibraryUserScopeDto) {
    const { userId, libraryId } = payload;
    return this.libraryApplication.getBooksInLibrary(userId, libraryId);
  }

  @MessagePattern({ cmd: LibraryCmd.ADD_BOOK })
  async addBookToLibrary(@Payload() payload: LibraryBookPayloadDto) {
    const { userId, bookId, libraryId } = payload;
    return this.libraryApplication.addBookToLibrary(userId, bookId, libraryId);
  }

  @MessagePattern({ cmd: LibraryCmd.REMOVE_BOOK })
  async removeBookFromLibrary(@Payload() payload: LibraryBookPayloadDto) {
    const { userId, bookId, libraryId } = payload;
    return this.libraryApplication.removeBookFromLibrary(userId, bookId, libraryId);
  }

  @MessagePattern({ cmd: LibraryCmd.CHECK_BOOK })
  async checkBookInLibrary(@Payload() payload: LibraryBookPayloadDto) {
    const { userId, bookId, libraryId } = payload;
    return this.libraryApplication.checkBookInLibrary(userId, bookId, libraryId);
  }

  @MessagePattern({ cmd: LibraryCmd.UPDATE_VISIBILITY })
  async updateLibraryVisibility(@Payload() payload: UpdateLibraryVisibilityDto) {
    const { userId, libraryId, visibility } = payload;
    return this.libraryApplication.updateLibraryVisibility(userId, libraryId, visibility);
  }

  @MessagePattern({ cmd: LibraryCmd.LIST_VISIBLE_SHELVES })
  async listVisibleShelves(@Payload() payload: LibraryViewerScopeDto) {
    return this.libraryApplication.listVisibleShelves(payload.ownerId, payload.viewerId);
  }

  @MessagePattern({ cmd: LibraryCmd.GET_BOOKS_FOR_VIEWER })
  async getBooksForViewer(@Payload() payload: LibraryViewerBooksDto) {
    return this.libraryApplication.getBooksForViewer(
      payload.viewerId,
      payload.ownerId,
      payload.libraryId,
    );
  }
}
