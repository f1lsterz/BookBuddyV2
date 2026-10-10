import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import { LibraryVisibility } from "@bookbuddy/shared";
import {
  LibraryBookDocument,
  Library as LibraryEntity,
  LibraryDocument,
  LibraryStatus,
} from "../../schemas/library.schema";
import { CACHE_LIBRARY } from "../config/cache.keys";
import { LibraryPolicy } from "../domain/library.policy";
import { BookCatalogClient } from "../infrastructure/book-catalog.client";
import { LibraryRepository } from "../infrastructure/library.repository";
import { UserRpcClient } from "../infrastructure/user-rpc.client";

@Injectable()
export class LibraryApplicationService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly libraryRepository: LibraryRepository,
    private readonly bookCatalog: BookCatalogClient,
    private readonly userRpc: UserRpcClient,
  ) {}

  private async loadBooksForLibrary(library: LibraryDocument): Promise<unknown[]> {
    const cacheKey = CACHE_LIBRARY.BOOKS(library._id.toString());
    const cached = await this.cacheManager.get<unknown[]>(cacheKey);
    if (cached) return cached;

    const libBooks = await this.libraryRepository.findLibraryBooks(library._id);
    const books = await Promise.all(
      libBooks.map((lb) => this.bookCatalog.getBookById(lb.bookId.toString())),
    );
    await this.cacheManager.set(cacheKey, books, 3600);
    return books;
  }

  private static readonly STANDARD_SHELVES: LibraryStatus[] = [
    LibraryStatus.FAVOURITE,
    LibraryStatus.READING,
    LibraryStatus.ALREADY_READ,
    LibraryStatus.WANNA_READ,
    LibraryStatus.DROPPED,
  ];

  async listUserLibraries(userId: string): Promise<LibraryEntity[]> {
    const cacheKey = CACHE_LIBRARY.LIBRARY(userId);
    const cached = await this.cacheManager.get<LibraryEntity[]>(cacheKey);
    if (cached) return cached;

    const libraries = await this.libraryRepository.findAllByUserId(userId);
    await this.cacheManager.set(cacheKey, libraries, 3600);
    return libraries;
  }

  async provisionDefaultLibraries(userId: string): Promise<LibraryEntity[]> {
    const existing = await this.libraryRepository.countByUserId(userId);
    if (existing > 0) {
      return this.libraryRepository.findAllByUserId(userId);
    }

    const created = await Promise.all(
      LibraryApplicationService.STANDARD_SHELVES.map((status) =>
        this.libraryRepository.createStandardShelf(
          userId,
          status,
          LibraryVisibility.PRIVATE,
        ),
      ),
    );

    await this.cacheManager.del(CACHE_LIBRARY.LIBRARY(userId));
    return created;
  }

  async createCustomLibrary(
    userId: string,
    customName: string,
    visibility: LibraryVisibility,
  ): Promise<LibraryEntity> {
    LibraryPolicy.assertValidVisibility(visibility);

    const saved = await this.libraryRepository.createCustom(
      userId,
      customName,
      visibility,
    );

    await this.cacheManager.del(CACHE_LIBRARY.LIBRARY(userId));
    await this.cacheManager.del(CACHE_LIBRARY.CUSTOM_LIBRARIES(userId));

    return saved;
  }

  async deleteCustomLibrary(userId: string, libraryId: string): Promise<LibraryEntity> {
    const library = await this.libraryRepository.findCustomForUser(userId, libraryId);
    LibraryPolicy.assertCustomLibrary(library);

    await Promise.all([
      this.cacheManager.del(CACHE_LIBRARY.LIBRARY(userId)),
      this.cacheManager.del(CACHE_LIBRARY.CUSTOM_LIBRARIES(userId)),
      this.cacheManager.del(CACHE_LIBRARY.BOOKS(libraryId)),
    ]);
    await this.libraryRepository.deleteById(libraryId);
    return library;
  }

  async getBooksInLibrary(userId: string, libraryId: string): Promise<unknown[]> {
    const library = await this.libraryRepository.findOwnedByUser(userId, libraryId);
    LibraryPolicy.assertOwnedLibrary(library);
    return this.loadBooksForLibrary(library);
  }

  async listVisibleShelves(ownerId: string, viewerId: string): Promise<LibraryEntity[]> {
    const shelves = await this.libraryRepository.findAllByUserId(ownerId);
    if (ownerId === viewerId) {
      return shelves;
    }
    const areFriends = await this.userRpc.areFriends(ownerId, viewerId);
    return shelves.filter((shelf) =>
      LibraryPolicy.canViewShelf(shelf, ownerId, viewerId, areFriends),
    );
  }

  async getBooksForViewer(
    viewerId: string,
    ownerId: string,
    libraryId: string,
  ): Promise<unknown[]> {
    const library = await this.libraryRepository.findOwnedByUser(ownerId, libraryId);
    LibraryPolicy.assertOwnedLibrary(library);
    const areFriends = await this.userRpc.areFriends(ownerId, viewerId);
    LibraryPolicy.assertCanViewShelf(library, ownerId, viewerId, areFriends);
    return this.loadBooksForLibrary(library);
  }

  async addBookToLibrary(
    userId: string,
    bookId: string,
    libraryId: string,
  ): Promise<LibraryBookDocument> {
    const library = await this.libraryRepository.findOwnedByUser(userId, libraryId);
    LibraryPolicy.assertOwnedLibrary(library);

    const book = await this.bookCatalog.getBookById(bookId);
    LibraryPolicy.assertBookExists(book);

    const exists = await this.libraryRepository.findLibraryBook(bookId, libraryId);
    LibraryPolicy.assertBookNotInLibrary(exists);

    const libBook = await this.libraryRepository.addBook(library, bookId);

    await this.cacheManager.del(CACHE_LIBRARY.BOOKS(libraryId));
    return libBook;
  }

  async removeBookFromLibrary(userId: string, bookId: string, libraryId: string) {
    const library = await this.libraryRepository.findOwnedByUser(userId, libraryId);
    LibraryPolicy.assertOwnedLibrary(library);

    const libBook = await this.libraryRepository.findLibraryBook(bookId, libraryId);
    LibraryPolicy.assertBookInLibrary(libBook);

    await this.cacheManager.del(CACHE_LIBRARY.BOOKS(libraryId));
    return this.libraryRepository.removeBook(libraryId, libBook);
  }

  async checkBookInLibrary(
    userId: string,
    bookId: string,
    libraryId: string,
  ): Promise<boolean> {
    const library = await this.libraryRepository.findOwnedByUser(userId, libraryId);
    LibraryPolicy.assertOwnedLibrary(library);
    const exists = await this.libraryRepository.findLibraryBook(bookId, libraryId);
    return !!exists;
  }

  async updateLibraryVisibility(
    userId: string,
    libraryId: string,
    visibility: LibraryVisibility,
  ): Promise<LibraryEntity> {
    LibraryPolicy.assertValidVisibility(visibility);

    const updated = await this.libraryRepository.updateVisibility(
      userId,
      libraryId,
      visibility,
    );
    LibraryPolicy.assertLibraryExists(updated);

    await this.cacheManager.del(CACHE_LIBRARY.LIBRARY(userId));
    return updated;
  }
}
