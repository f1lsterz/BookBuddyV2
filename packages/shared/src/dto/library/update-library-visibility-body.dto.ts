import { IsEnum, IsMongoId } from "class-validator";
import { LibraryVisibility } from "../../contracts/library-visibility";

export class UpdateLibraryVisibilityBodyDto {
  @IsMongoId()
  libraryId: string;

  @IsEnum(LibraryVisibility)
  visibility: LibraryVisibility;
}
