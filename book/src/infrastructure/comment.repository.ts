import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CommentReactionType } from "@bookbuddy/shared";
import { Model, Types } from "mongoose";
import {
  Comment,
  CommentDocument,
  CommentReaction,
  CommentReactionDocument,
} from "../../schemas/comment.schema";

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
    @InjectModel(CommentReaction.name)
    private readonly commentReactionModel: Model<CommentReactionDocument>,
  ) {}

  createComment(bookId: string, userId: string, commentText: string) {
    return this.commentModel.create({
      bookId: new Types.ObjectId(bookId),
      userId: new Types.ObjectId(userId),
      comment: commentText,
      likes: 0,
      dislikes: 0,
      reactions: [],
    });
  }

  findByBook(bookId: string) {
    return this.commentModel.find({ bookId: new Types.ObjectId(bookId) }).exec();
  }

  findOwned(commentId: string, userId: string) {
    return this.commentModel.findOne({ _id: commentId, userId }).exec();
  }

  deleteById(commentId: string) {
    return this.commentModel.findByIdAndDelete(commentId).exec();
  }

  findById(commentId: string) {
    return this.commentModel.findById(commentId).exec();
  }

  findUserReaction(commentId: string, userId: string) {
    return this.commentReactionModel.findOne({ commentId, userId }).exec();
  }

  deleteReaction(reactionId: Types.ObjectId) {
    return this.commentReactionModel.deleteOne({ _id: reactionId }).exec();
  }

  createReaction(commentId: string, userId: string, reactionType: CommentReactionType) {
    return this.commentReactionModel.create({
      commentId: new Types.ObjectId(commentId),
      userId: new Types.ObjectId(userId),
      reaction: reactionType,
    });
  }
}
