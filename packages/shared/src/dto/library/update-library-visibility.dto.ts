import { IsEnum, IsMongoId } from "class-validator";
import { LibraryVisibility } from "../../contracts/library-visibility";

export class UpdateLibraryVisibilityDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  libraryId: string;

  @IsEnum(LibraryVisibility)
  visibility: LibraryVisibility;
}
