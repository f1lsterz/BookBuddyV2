import { IsMongoId } from "class-validator";

export class LibraryViewerScopeDto {
  @IsMongoId()
  viewerId: string;

  @IsMongoId()
  ownerId: string;
}

export class LibraryViewerBooksDto extends LibraryViewerScopeDto {
  @IsMongoId()
  libraryId: string;
}
