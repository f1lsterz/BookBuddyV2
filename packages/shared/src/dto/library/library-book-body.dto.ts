import { IsMongoId } from "class-validator";

/** HTTP body: shelf + book (user id comes from JWT on gateway). */
export class LibraryBookBodyDto {
  @IsMongoId()
  bookId: string;

  @IsMongoId()
  libraryId: string;
}
