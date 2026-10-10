import { IsMongoId } from "class-validator";

export class LibraryUserScopeDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  libraryId: string;
}
