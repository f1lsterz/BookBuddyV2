import { IsInt, IsMongoId, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class BookUserRpcDto {
  @IsMongoId()
  bookId: string;

  @IsMongoId()
  userId: string;
}

export class UpsertBookRatingBodyDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  newRating: number;
}

export class UpsertBookRatingRpcDto extends BookUserRpcDto {
  @IsInt()
  @Min(1)
  @Max(5)
  newRating: number;
}
