import { ApiProperty } from "@nestjs/swagger";
import {
  CreateCustomLibraryBodyDto,
  LibraryBookBodyDto,
  LibraryVisibility,
  UpdateLibraryVisibilityBodyDto,
} from "@bookbuddy/shared";

export class CreateCustomLibraryApiDto extends CreateCustomLibraryBodyDto {
  @ApiProperty({ example: "Summer reads" })
  declare customName: string;

  @ApiProperty({ enum: LibraryVisibility })
  declare visibility: LibraryVisibility;
}

export class LibraryBookPayloadApiDto extends LibraryBookBodyDto {
  @ApiProperty()
  declare bookId: string;

  @ApiProperty()
  declare libraryId: string;
}

export class UpdateLibraryVisibilityApiDto extends UpdateLibraryVisibilityBodyDto {
  @ApiProperty()
  declare libraryId: string;

  @ApiProperty({ enum: LibraryVisibility })
  declare visibility: LibraryVisibility;
}
