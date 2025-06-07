import { IsMongoId, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AddCommentDto {
  @ApiProperty({
    example: "60d5f483f1a2b12d4c8e4b91",
    description: "Book ObjectId",
  })
  @IsMongoId()
  bookId: string;

  @ApiProperty({
    example: "60d5f483f1a2b12d4c8e4b92",
    description: "User ObjectId",
  })
  @IsMongoId()
  userId: string;

  @ApiProperty({ example: "Great book!", description: "Comment text" })
  @IsString()
  @MinLength(1)
  commentText: string;
}
