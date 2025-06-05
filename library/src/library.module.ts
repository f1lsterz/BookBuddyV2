import { Module } from "@nestjs/common";
import { LibraryService } from "./library.service";
import { LibraryController } from "./library.controller";
import { MongooseModule } from "@nestjs/mongoose";
import {
  Library,
  LibraryBook,
  LibraryBookSchema,
  LibrarySchema,
} from "schemas/library.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Library.name, schema: LibrarySchema },
      { name: LibraryBook.name, schema: LibraryBookSchema },
    ]),
  ],
  providers: [LibraryService],
  controllers: [LibraryController],
})
export class LibraryModule {}
