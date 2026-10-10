import { IsMongoId, IsString, MinLength } from "class-validator";

export class AddCommentDto {
  @IsMongoId()
  bookId: string;

  @IsMongoId()
  userId: string;

  @IsString()
  @MinLength(1)
  commentText: string;
}

export class AddCommentBodyDto {
  @IsString()
  @MinLength(1)
  commentText: string;
}
