import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { LibraryVisibility } from "../../contracts/library-visibility";

export class CreateCustomLibraryBodyDto {
  @IsString()
  @IsNotEmpty()
  customName: string;

  @IsEnum(LibraryVisibility)
  visibility: LibraryVisibility;
}
