import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Book, BookRating, BookRatingSchema, BookSchema } from "schemas/book.schema";
import {
  Comment,
  CommentReaction,
  CommentReactionSchema,
  CommentSchema,
} from "schemas/comment.schema";
import { BookApplicationService } from "./application/book.application.service";
import { BookRepository } from "./infrastructure/book.repository";
import { CommentRepository } from "./infrastructure/comment.repository";
import { BookListener } from "./transport/book.listener";
import { HealthListener } from "./transport/health.listener";
import { MongoHealthService } from "@bookbuddy/nest-common";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      { name: BookRating.name, schema: BookRatingSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentReaction.name, schema: CommentReactionSchema },
    ]),
  ],
  controllers: [BookListener, HealthListener],
  providers: [
    BookRepository,
    CommentRepository,
    BookApplicationService,
    MongoHealthService,
  ],
})
export class BookModule {}
