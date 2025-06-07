import { IsInt, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class GetBooksDto {
  @ApiPropertyOptional({ example: 1, description: "Page number" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: "Items per page" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ example: "title", description: "Field to sort by" })
  @IsOptional()
  @IsString()
  sortBy?: string = "title";

  @ApiPropertyOptional({ example: "asc", description: "Sort order: asc|desc" })
  @IsOptional()
  @IsString()
  order?: "asc" | "desc" = "asc";

  @ApiPropertyOptional({ example: "Harry", description: "Search query" })
  @IsOptional()
  @IsString()
  query?: string = "";
}
