import { Injectable } from "@nestjs/common";
import {
  Book,
  Library,
  LibraryBook,
  LibraryStatus,
  LibraryVisibility,
} from "@prisma/client";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class LibraryService {
  constructor(private readonly prisma: PrismaService) {}

  async getLibrary(userId: number): Promise<Library | null> {
    return this.prisma.library.findUnique({ where: { id: userId } });
  }

  async createCustomLibrary(
    userId: number,
    customName: string,
    visibility: LibraryVisibility
  ): Promise<Library> {
    return this.prisma.library.create({
      data: {
        userId,
        customName,
        visibility,
        status: LibraryStatus.CUSTOM,
      },
    });
  }

  async deleteCustomLibrary(
    userId: number,
    libraryId: number
  ): Promise<Library> {
    const customLibrary = await this.prisma.library.findUnique({
      where: { id: libraryId, userId, status: LibraryStatus.CUSTOM },
    });

    if (!customLibrary) {
      throw ApiError.BadRequest(
        "Custom list not found or does not belong to this user"
      );
    }

    return this.prisma.library.delete({
      where: { id: libraryId, userId, status: LibraryStatus.CUSTOM },
    });
  }

  async getBooksInLibrary(userId: number, libraryId: number): Promise<Book[]> {
    const library = await this.prisma.library.findUnique({
      where: { id: libraryId, userId },
      include: {
        books: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!library) {
      throw ApiError.BadRequest(
        "Library not found or does not belong to this user"
      );
    }

    return library.books.map((lb) => lb.book);
  }

  async addBookToLibrary(
    bookId: number,
    libraryId: number
  ): Promise<LibraryBook> {
    const library = await this.prisma.library.findUnique({
      where: { id: libraryId },
    });

    if (!library) {
      throw ApiError.BadRequest(
        "Library not found or does not belong to this user"
      );
    }

    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw ApiError.BadRequest(
        "Library not found or does not belong to this user"
      );
    }

    const alreadyAdded = await this.prisma.libraryBook.findUnique({
      where: {
        libraryId_bookId: { libraryId, bookId },
      },
    });

    if (alreadyAdded) {
      throw ApiError.BadRequest(
        "Library not found or does not belong to this user"
      );
    }

    return this.prisma.libraryBook.create({
      data: {
        libraryId,
        bookId,
      },
    });
  }

  async removeBookFromLibrary(
    bookId: number,
    libraryId: number
  ): Promise<LibraryBook> {
    const library = await this.prisma.library.findUnique({
      where: { id: libraryId },
    });

    if (!library) {
      throw ApiError.BadRequest(
        "Library not found or does not belong to this user"
      );
    }

    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw ApiError.BadRequest(
        "Library not found or does not belong to this user"
      );
    }

    const alreadyAdded = await this.prisma.libraryBook.findUnique({
      where: {
        libraryId_bookId: { libraryId, bookId },
      },
    });

    if (!alreadyAdded) {
      throw ApiError.BadRequest(
        "Library not found or does not belong to this user"
      );
    }

    return this.prisma.libraryBook.delete({
      where: {
        libraryId_bookId: { libraryId, bookId },
      },
    });
  }

  async checkBookInLibrary(
    bookId: number,
    libraryId: number
  ): Promise<boolean> {
    const library = await this.prisma.library.findUnique({
      where: { id: libraryId },
    });

    if (!library) {
      throw ApiError.BadRequest(
        "Library not found or does not belong to this user"
      );
    }

    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw ApiError.BadRequest(
        "Library not found or does not belong to this user"
      );
    }

    const alreadyAdded = await this.prisma.libraryBook.findUnique({
      where: {
        libraryId_bookId: { libraryId, bookId },
      },
    });

    return alreadyAdded ? true : false;
  }

  async updateLibraryVisibility(
    userId: number,
    libraryId: number,
    visibility: LibraryVisibility
  ): Promise<Library> {
    const library = await this.prisma.library.findUnique({
      where: { id: libraryId, userId },
    });

    if (!library) {
      throw ApiError.BadRequest(
        "Library not found or does not belong to this user"
      );
    }

    if (!["Private", "Friends", "Public"].includes(visibility)) {
      throw ApiError.BadRequest("Incorrect visibility");
    }

    return this.prisma.library.update({
      where: {
        id: libraryId,
        userId,
      },
      data: {
        visibility,
      },
    });
  }
}
