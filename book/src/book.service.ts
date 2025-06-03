import { Injectable } from "@nestjs/common";
import { ApiError } from "../../api-gateway/src/common/errors/apiError";
import { InjectModel } from "@nestjs/mongoose";
import {
  Book,
  BookDocument,
  BookRating,
  BookRatingDocument,
} from "schemas/book.schema";
import {
  CommentReaction,
  Comment,
  CommentDocument,
  CommentReactionDocument,
  Reaction,
} from "schemas/comment.schema";
import { Model, Types } from "mongoose";

@Injectable()
export class BookService {
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
    @InjectModel(BookRating.name)
    private bookRatingModel: Model<BookRatingDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(CommentReaction.name)
    private commentReactionModel: Model<CommentReactionDocument>
  ) {}
  async countBooks(): Promise<number> {
    return this.bookModel.countDocuments().exec();
  }

  async getBooks(
    page = 1,
    limit = 10,
    sortBy: string = "title",
    order: "asc" | "desc" = "asc",
    query = ""
  ): Promise<Book[]> {
    const skip = (page - 1) * limit;
    const sortOrder = order === "asc" ? 1 : -1;

    return this.bookModel
      .find({ title: { $regex: query, $options: "i" } })
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async getBookById(bookId: string): Promise<BookDocument | null> {
    if (!Types.ObjectId.isValid(bookId)) return null;
    return this.bookModel.findById(bookId).exec();
  }

  async addCommentToBook(
    bookId: string,
    userId: string,
    commentText: string
  ): Promise<CommentDocument> {
    if (!Types.ObjectId.isValid(bookId) || !Types.ObjectId.isValid(userId)) {
      throw ApiError.BadRequest("Invalid IDs");
    }

    const comment = await this.commentModel.create({
      bookId: new Types.ObjectId(bookId),
      userId: new Types.ObjectId(userId),
      comment: commentText,
      likes: 0,
      dislikes: 0,
      reactions: [],
    });

    await this.bookModel
      .findByIdAndUpdate(bookId, { $inc: { commentCount: 1 } })
      .exec();

    return comment;
  }

  async getCommentsForBook(bookId: string): Promise<CommentDocument[]> {
    if (!Types.ObjectId.isValid(bookId)) return [];
    return this.commentModel
      .find({ bookId: new Types.ObjectId(bookId) })
      .exec();
  }

  async deleteComment(
    commentId: string,
    userId: string
  ): Promise<CommentDocument | null> {
    if (!Types.ObjectId.isValid(commentId) || !Types.ObjectId.isValid(userId)) {
      throw ApiError.BadRequest("Invalid IDs");
    }

    const comment = await this.commentModel
      .findOne({ _id: commentId, userId })
      .exec();
    if (!comment)
      throw ApiError.BadRequest("Comment not found or not your comment");

    await this.bookModel
      .findByIdAndUpdate(comment.bookId, { $inc: { commentCount: -1 } })
      .exec();

    return this.commentModel.findByIdAndDelete(commentId).exec();
  }

  async toggleReaction(
    commentId: string,
    userId: string,
    reactionType: "LIKE" | "DISLIKE"
  ): Promise<void> {
    if (!Types.ObjectId.isValid(commentId) || !Types.ObjectId.isValid(userId)) {
      throw ApiError.BadRequest("Invalid IDs");
    }

    if (![Reaction.LIKE, Reaction.DISLIKE].includes(reactionType)) {
      throw ApiError.BadRequest("Invalid reaction type");
    }

    const comment = await this.commentModel.findById(commentId).exec();
    if (!comment) throw ApiError.BadRequest("Comment not found");

    const existingReaction = await this.commentReactionModel
      .findOne({
        commentId,
        userId,
      })
      .exec();

    if (existingReaction) {
      if (existingReaction.reaction === reactionType) {
        await this.commentReactionModel
          .deleteOne({ _id: existingReaction._id })
          .exec();

        if (reactionType === Reaction.LIKE) {
          comment.likes = Math.max(0, comment.likes - 1);
        } else {
          comment.dislikes = Math.max(0, comment.dislikes - 1);
        }
      } else {
        existingReaction.reaction = reactionType;
        await existingReaction.save();

        if (reactionType === Reaction.LIKE) {
          comment.likes = comment.likes + 1;
          comment.dislikes = Math.max(0, comment.dislikes - 1);
        } else {
          comment.dislikes = comment.dislikes + 1;
          comment.likes = Math.max(0, comment.likes - 1);
        }
      }
    } else {
      await this.commentReactionModel.create({
        commentId: new Types.ObjectId(commentId),
        userId: new Types.ObjectId(userId),
        reaction: reactionType,
      });

      if (reactionType === Reaction.LIKE) {
        comment.likes = comment.likes + 1;
      } else {
        comment.dislikes = comment.dislikes + 1;
      }
    }

    await comment.save();
  }

  async calculateAverageRating(bookId: string): Promise<BookDocument | null> {
    if (!Types.ObjectId.isValid(bookId)) return null;

    const ratings = await this.bookRatingModel
      .find({ bookId })
      .select("rating")
      .exec();

    if (!ratings.length) return null;

    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / ratings.length;
    const roundedAverageRating = Math.round(averageRating * 2) / 2;

    return this.bookModel
      .findByIdAndUpdate(
        bookId,
        { averageRating: roundedAverageRating },
        { new: true }
      )
      .exec();
  }

  async getAverageRating(bookId: string): Promise<number | null> {
    if (!Types.ObjectId.isValid(bookId)) return null;

    const book = await this.bookModel
      .findById(bookId)
      .select("averageRating")
      .exec();
    return book?.averageRating ?? null;
  }

  async getUserBookRating(
    bookId: string,
    userId: string
  ): Promise<BookRatingDocument | null> {
    if (!Types.ObjectId.isValid(bookId) || !Types.ObjectId.isValid(userId))
      return null;

    return this.bookRatingModel.findOne({ bookId, userId }).exec();
  }

  async upsertUserBookRating(
    bookId: string,
    userId: string,
    newRating: number
  ): Promise<BookRatingDocument> {
    if (newRating < 0 || newRating > 5 || newRating % 0.5 !== 0) {
      throw ApiError.BadRequest("Invalid rating value");
    }
    if (!Types.ObjectId.isValid(bookId) || !Types.ObjectId.isValid(userId)) {
      throw ApiError.BadRequest("Invalid IDs");
    }

    return this.bookRatingModel
      .findOneAndUpdate(
        { bookId, userId },
        { rating: newRating },
        { upsert: true, new: true }
      )
      .exec();
  }

  async deleteUserBookRating(bookId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(bookId) || !Types.ObjectId.isValid(userId)) {
      throw ApiError.BadRequest("Invalid IDs");
    }

    await this.bookRatingModel.deleteOne({ bookId, userId }).exec();
  }
}
