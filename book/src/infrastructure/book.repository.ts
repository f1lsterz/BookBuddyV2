import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  Book,
  BookDocument,
  BookRating,
  BookRatingDocument,
} from "../../schemas/book.schema";

@Injectable()
export class BookRepository {
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
    @InjectModel(BookRating.name)
    private readonly bookRatingModel: Model<BookRatingDocument>,
  ) {}

  countDocuments() {
    return this.bookModel.countDocuments().exec();
  }

  findPaginated(
    page: number,
    limit: number,
    sortBy: string,
    order: "asc" | "desc",
    query: string,
  ) {
    const skip = (page - 1) * limit;
    const sortOrder = order === "asc" ? 1 : -1;
    return this.bookModel
      .find({ title: { $regex: query, $options: "i" } })
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  findById(bookId: string) {
    return this.bookModel.findById(bookId).exec();
  }

  findByIdSelectAverage(bookId: string) {
    return this.bookModel.findById(bookId).select("averageRating").exec();
  }

  incrementCommentCount(bookId: string, delta: number) {
    return this.bookModel
      .findByIdAndUpdate(bookId, { $inc: { commentCount: delta } })
      .exec();
  }

  updateAverageRating(bookId: string, averageRating: number) {
    return this.bookModel
      .findByIdAndUpdate(bookId, { averageRating }, { new: true })
      .exec();
  }

  findRatingsByBook(bookId: string) {
    return this.bookRatingModel.find({ bookId }).select("rating").exec();
  }

  findUserRating(bookId: string, userId: string) {
    return this.bookRatingModel.findOne({ bookId, userId }).exec();
  }

  upsertUserRating(bookId: string, userId: string, rating: number) {
    return this.bookRatingModel
      .findOneAndUpdate({ bookId, userId }, { rating }, { upsert: true, new: true })
      .exec();
  }

  deleteUserRating(bookId: string, userId: string) {
    return this.bookRatingModel.deleteOne({ bookId, userId }).exec();
  }
}
