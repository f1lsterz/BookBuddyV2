import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  Library,
  LibraryBook,
  LibraryBookDocument,
  LibraryDocument,
  LibraryStatus,
  LibraryVisibility,
} from "schemas/library.schema";
import { ApiError } from "../../api-gateway/src/common/errors/apiError";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { CACHE_LIBRARY } from "./config/cache.keys";

@Injectable()
export class LibraryService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectModel(Library.name) private libraryModel: Model<LibraryDocument>,
    @InjectModel(LibraryBook.name)
    private libraryBookModel: Model<LibraryBookDocument>,
    @Inject("BOOK_SERVICE") private readonly bookClient: ClientProxy
  ) {}

  async getLibrary(userId: string): Promise<Library | null> {
    const cacheKey = CACHE_LIBRARY.LIBRARY(userId);
    const cached = await this.cacheManager.get<Library>(cacheKey);
    if (cached) return cached;

    const lib = await this.libraryModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();
    await this.cacheManager.set(cacheKey, lib, 3600);
    return lib;
  }

  async createCustomLibrary(
    userId: string,
    customName: string,
    visibility: LibraryVisibility
  ): Promise<Library> {
    const library = new this.libraryModel({
      userId: new Types.ObjectId(userId),
      customName,
      visibility,
      status: LibraryStatus.CUSTOM,
    });
    const saved = await library.save();

    await this.cacheManager.del(CACHE_LIBRARY.LIBRARY(userId));
    await this.cacheManager.del(CACHE_LIBRARY.CUSTOM_LIBRARIES(userId));

    return saved;
  }

  async deleteCustomLibrary(
    userId: string,
    libraryId: string
  ): Promise<Library> {
    const library = await this.libraryModel.findOne({
      _id: libraryId,
      userId: new Types.ObjectId(userId),
      status: LibraryStatus.CUSTOM,
    });

    if (!library) {
      throw ApiError.BadRequest(
        "Custom list not found or does not belong to this user"
      );
    }

    await Promise.all([
      this.cacheManager.del(CACHE_LIBRARY.LIBRARY(userId)),
      this.cacheManager.del(CACHE_LIBRARY.CUSTOM_LIBRARIES(userId)),
      this.cacheManager.del(CACHE_LIBRARY.BOOKS(libraryId)),
    ]);
    await this.libraryModel.deleteOne({ _id: libraryId });
    return library;
  }

  async getBooksInLibrary(userId: string, libraryId: string): Promise<any[]> {
    const cacheKey = CACHE_LIBRARY.BOOKS(libraryId);
    const cached = await this.cacheManager.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const library = await this.libraryModel
      .findOne({
        _id: libraryId,
        userId: new Types.ObjectId(userId),
      })
      .exec();
    if (!library) {
      throw ApiError.BadRequest(
        "Library not found or does not belong to this user"
      );
    }
    const libBooks = await this.libraryBookModel
      .find({ libraryId: library._id })
      .lean();

    const books = await Promise.all(
      libBooks.map((lb) =>
        firstValueFrom(
          this.bookClient.send({ cmd: "get-book-by-id" }, lb.bookId.toString())
        )
      )
    );

    await this.cacheManager.set(cacheKey, books, 3600);

    return books;
  }

  async addBookToLibrary(
    bookId: string,
    libraryId: string
  ): Promise<LibraryBook> {
    const library = await this.libraryModel.findById(libraryId).exec();
    if (!library) throw ApiError.BadRequest("Library not found");

    const book = await firstValueFrom(
      this.bookClient.send({ cmd: "get-book-by-id" }, bookId)
    );
    if (!book) throw ApiError.BadRequest("Book not found");

    const exists = await this.libraryBookModel
      .findOne({ bookId, libraryId })
      .exec();
    if (exists) throw ApiError.BadRequest("Book already in library");

    const libBook = new this.libraryBookModel({ bookId, libraryId });
    await libBook.save();
    library.books.push(libBook._id);
    await library.save();

    await this.cacheManager.del(CACHE_LIBRARY.BOOKS(libraryId));
    return libBook;
  }

  async removeBookFromLibrary(
    bookId: string,
    libraryId: string
  ): Promise<LibraryBook> {
    const library = await this.libraryModel.findById(libraryId).exec();
    if (!library) throw ApiError.BadRequest("Library not found");

    const libBook = await this.libraryBookModel
      .findOne({ bookId, libraryId })
      .exec();
    if (!libBook) throw ApiError.BadRequest("Book not in library");

    await this.libraryBookModel.deleteOne({ _id: libBook._id }).exec();
    await this.libraryModel.findByIdAndUpdate(libraryId, {
      $pull: { books: libBook._id },
    });

    await this.cacheManager.del(CACHE_LIBRARY.BOOKS(libraryId));
    return libBook;
  }

  async checkBookInLibrary(
    bookId: string,
    libraryId: string
  ): Promise<boolean> {
    const exists = await this.libraryBookModel
      .findOne({ bookId, libraryId })
      .exec();
    return !!exists;
  }

  async updateLibraryVisibility(
    userId: string,
    libraryId: string,
    visibility: LibraryVisibility
  ): Promise<Library> {
    if (!["PUBLIC", "PRIVATE", "FRIENDS"].includes(visibility)) {
      throw ApiError.BadRequest("Incorrect visibility");
    }

    const updated = await this.libraryModel
      .findOneAndUpdate(
        { _id: libraryId, userId: new Types.ObjectId(userId) },
        { visibility },
        { new: true }
      )
      .exec();
    if (!updated) throw ApiError.BadRequest("Library not found");

    await this.cacheManager.del(CACHE_LIBRARY.LIBRARY(userId));
    return updated;
  }
}
