import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type BookDocument = HydratedDocument<Book>;
export type BookRatingDocument = HydratedDocument<BookRating>;

@Schema({ timestamps: true })
export class Book {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop([{ type: String }])
  genres: string[];

  @Prop()
  description?: string;

  @Prop()
  coverUrl?: string;

  @Prop()
  publicationDate?: Date;

  @Prop()
  pageCount?: number;

  @Prop({ default: 0 })
  averageRating: number;

  @Prop({ default: 0 })
  commentCount: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: "BookRating" }], default: [] })
  ratings: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: "Comment" }], default: [] })
  comments: Types.ObjectId[];
}

export const BookSchema = SchemaFactory.createForClass(Book);

@Schema({ timestamps: true })
export class BookRating {
  @Prop({ required: true })
  rating: number;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Book", required: true })
  bookId: Types.ObjectId;
}

export const BookRatingSchema = SchemaFactory.createForClass(BookRating);
BookRatingSchema.index({ bookId: 1, userId: 1 }, { unique: true });
