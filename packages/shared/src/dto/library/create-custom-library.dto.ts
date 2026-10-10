import { IsEnum, IsMongoId, IsNotEmpty, IsString } from "class-validator";
import { LibraryVisibility } from "../../contracts/library-visibility";

export class CreateCustomLibraryDto {
  @IsMongoId()
  userId: string;

  @IsString()
  @IsNotEmpty()
  customName: string;

  @IsEnum(LibraryVisibility)
  visibility: LibraryVisibility;
}
