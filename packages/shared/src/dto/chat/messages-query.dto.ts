import { IsInt, IsMongoId, IsOptional, Min } from "class-validator";
import { Type } from "class-transformer";

export class ClubMessagesQueryDto {
  @IsMongoId()
  clubId: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;
}

export class UserMessagesQueryDto {
  @IsMongoId()
  userId: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;
}
