import { Injectable } from "@nestjs/common";
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

@Injectable()
export class LibraryService {
  constructor(
    @InjectModel(Library.name) private libraryModel: Model<LibraryDocument>,
    @InjectModel(LibraryBook.name)
    private libraryBookModel: Model<LibraryBookDocument>
  ) {}

  async getLibrary(userId: string): Promise<Library | null> {
    return this.libraryModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();
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
    return library.save();
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

    await this.libraryModel.deleteOne({ _id: libraryId });
    return library;
  }

  async getBooksInLibrary(userId: string, libraryId: string) {
    const library = await this.libraryModel
      .findOne({
        _id: libraryId,
        userId: new Types.ObjectId(userId),
      })
      .populate({
        path: "books",
        populate: { path: "bookId", model: "Book" },
      })
      .exec();

    if (!library) {
      throw ApiError.BadRequest(
        "Library not found or does not belong to this user"
      );
    }

    return await Promise.all(
      (library.books as Types.ObjectId[]).map(async (bookRef: any) => {
        const libBook = await this.libraryBookModel
          .findById(bookRef)
          .populate("bookId")
          .exec();
        return libBook?.bookId;
      })
    );
  }

  async addBookToLibrary(
    bookId: string,
    libraryId: string
  ): Promise<LibraryBook> {
    const library = await this.libraryModel.findById(libraryId).exec();
    if (!library)
      throw ApiError.BadRequest(
        "Library not found or does not belong to this user"
      );

    const book = await this.bookModel.findById(bookId).exec();
    if (!book) throw ApiError.BadRequest("Book not found");

    const exists = await this.libraryBookModel
      .findOne({ bookId, libraryId })
      .exec();
    if (exists) throw ApiError.BadRequest("Book already added to the library");

    const libraryBook = new this.libraryBookModel({ bookId, libraryId });
    await libraryBook.save();

    library.books.push(libraryBook._id);
    await library.save();

    return libraryBook;
  }

  async removeBookFromLibrary(
    bookId: string,
    libraryId: string
  ): Promise<LibraryBook> {
    const library = await this.libraryModel.findById(libraryId).exec();
    if (!library)
      throw ApiError.BadRequest(
        "Library not found or does not belong to this user"
      );

    const libraryBook = await this.libraryBookModel
      .findOneAndDelete({
        bookId,
        libraryId,
      })
      .exec();

    if (!libraryBook) {
      throw ApiError.BadRequest("Book not found in the library");
    }

    await this.libraryModel.findByIdAndUpdate(libraryId, {
      $pull: { books: libraryBook._id },
    });

    return libraryBook;
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

    const library = await this.libraryModel.findOneAndUpdate(
      {
        _id: libraryId,
        userId: new Types.ObjectId(userId),
      },
      { visibility },
      { new: true }
    );

    if (!library) {
      throw ApiError.BadRequest(
        "Library not found or does not belong to this user"
      );
    }

    return library;
  }
}
