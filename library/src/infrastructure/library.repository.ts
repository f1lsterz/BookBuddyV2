import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { LibraryVisibility } from "@bookbuddy/shared";
import {
  Library,
  LibraryBook,
  LibraryBookDocument,
  LibraryDocument,
  LibraryStatus,
} from "../../schemas/library.schema";

@Injectable()
export class LibraryRepository {
  constructor(
    @InjectModel(Library.name) private readonly libraryModel: Model<LibraryDocument>,
    @InjectModel(LibraryBook.name)
    private readonly libraryBookModel: Model<LibraryBookDocument>,
  ) {}

  findByUserId(userId: string) {
    return this.libraryModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
  }

  findAllByUserId(userId: string) {
    return this.libraryModel.find({ userId: new Types.ObjectId(userId) }).exec();
  }

  countByUserId(userId: string) {
    return this.libraryModel
      .countDocuments({ userId: new Types.ObjectId(userId) })
      .exec();
  }

  createStandardShelf(
    userId: string,
    status: LibraryStatus,
    visibility: LibraryVisibility,
  ) {
    const library = new this.libraryModel({
      userId: new Types.ObjectId(userId),
      status,
      visibility,
    });
    return library.save();
  }

  createCustom(userId: string, customName: string, visibility: LibraryVisibility) {
    const library = new this.libraryModel({
      userId: new Types.ObjectId(userId),
      customName,
      visibility,
      status: LibraryStatus.CUSTOM,
    });
    return library.save();
  }

  findCustomForUser(userId: string, libraryId: string) {
    return this.libraryModel.findOne({
      _id: libraryId,
      userId: new Types.ObjectId(userId),
      status: LibraryStatus.CUSTOM,
    });
  }

  deleteById(libraryId: string) {
    return this.libraryModel.deleteOne({ _id: libraryId });
  }

  findOwnedByUser(userId: string, libraryId: string) {
    return this.libraryModel
      .findOne({
        _id: libraryId,
        userId: new Types.ObjectId(userId),
      })
      .exec();
  }

  findById(libraryId: string) {
    return this.libraryModel.findById(libraryId).exec();
  }

  findLibraryBooks(libraryId: Types.ObjectId) {
    return this.libraryBookModel.find({ libraryId }).lean();
  }

  findLibraryBook(bookId: string, libraryId: string) {
    return this.libraryBookModel.findOne({ bookId, libraryId }).exec();
  }

  async addBook(library: LibraryDocument, bookId: string) {
    const libBook = new this.libraryBookModel({ bookId, libraryId: library._id });
    await libBook.save();
    library.books.push(libBook._id);
    await library.save();
    return libBook;
  }

  async removeBook(libraryId: string, libBook: LibraryBookDocument) {
    await this.libraryBookModel.deleteOne({ _id: libBook._id }).exec();
    await this.libraryModel.findByIdAndUpdate(libraryId, {
      $pull: { books: libBook._id },
    });
    return libBook;
  }

  updateVisibility(userId: string, libraryId: string, visibility: LibraryVisibility) {
    return this.libraryModel
      .findOneAndUpdate(
        { _id: libraryId, userId: new Types.ObjectId(userId) },
        { visibility },
        { new: true },
      )
      .exec();
  }
}
