import { Module } from "@nestjs/common";
import { BookService } from "./book.service";
import { BookListener } from "./book.listener";
import { MongooseModule } from "@nestjs/mongoose";
import {
  Book,
  BookRating,
  BookRatingSchema,
  BookSchema,
} from "schemas/book.schema";
import {
  Comment,
  CommentReaction,
  CommentReactionSchema,
  CommentSchema,
} from "schemas/comment.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      { name: BookRating.name, schema: BookRatingSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentReaction.name, schema: CommentReactionSchema },
    ]),
  ],
  controllers: [BookListener],
  providers: [BookService],
})
export class BookModule {}
