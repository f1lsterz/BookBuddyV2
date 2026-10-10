import { IsMongoId } from "class-validator";

export class LibraryBookPayloadDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  bookId: string;

  @IsMongoId()
  libraryId: string;
}
