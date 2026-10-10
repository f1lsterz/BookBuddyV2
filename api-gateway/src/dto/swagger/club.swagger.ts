import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  AddClubMemberDto,
  CreateClubBodyDto,
  SearchClubsDto,
  UpdateClubDto,
} from "@bookbuddy/shared";

export class CreateClubApiDto extends CreateClubBodyDto {
  @ApiProperty({ example: "Kyiv Readers" })
  declare name: string;

  @ApiProperty({ example: "Weekly meetups" })
  declare description: string;
}

export class CreateClubMultipartApiDto extends CreateClubApiDto {
  @ApiPropertyOptional({ type: "string", format: "binary" })
  imageFile?: Express.Multer.File;
}

export class UpdateClubApiDto extends UpdateClubDto {
  @ApiPropertyOptional()
  declare name?: string;

  @ApiPropertyOptional()
  declare description?: string;
}

export class SearchClubsApiDto extends SearchClubsDto {
  @ApiPropertyOptional({ example: "fantasy" })
  declare query?: string;

  @ApiPropertyOptional({ example: false })
  declare filterFull?: boolean;
}

export class AddClubMemberApiDto extends AddClubMemberDto {
  @ApiProperty({ example: "6648bd14fdd295bb7f328fa2" })
  declare userId: string;
}
