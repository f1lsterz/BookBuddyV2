import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type CommentDocument = HydratedDocument<Comment>;
export type CommentReactionDocument = HydratedDocument<CommentReaction>;

export enum Reaction {
  LIKE = "LIKE",
  DISLIKE = "DISLIKE",
}

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Comment {
  @Prop({ required: true, default: 0 })
  likes: number;

  @Prop({ required: true, default: 0 })
  dislikes: number;

  @Prop({ required: true })
  comment: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Book", required: true })
  bookId: Types.ObjectId;

  @Prop({
    type: [{ type: Types.ObjectId, ref: "CommentReaction" }],
    default: [],
  })
  reactions: Types.ObjectId[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

@Schema({ timestamps: true })
export class CommentReaction {
  @Prop({ required: true, enum: Reaction })
  reaction: Reaction;

  @Prop({ type: Types.ObjectId, ref: "Comment", required: true })
  commentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;
}

export const CommentReactionSchema =
  SchemaFactory.createForClass(CommentReaction);

CommentReactionSchema.index({ userId: 1, commentId: 1 }, { unique: true });
