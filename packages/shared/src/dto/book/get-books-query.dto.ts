import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export class GetBooksQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = "title";

  @IsOptional()
  @IsIn(["asc", "desc"])
  order?: "asc" | "desc" = "asc";

  @IsOptional()
  @IsString()
  query?: string = "";
}
