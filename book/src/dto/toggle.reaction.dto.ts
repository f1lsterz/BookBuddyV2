import { IsEnum, IsMongoId } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Reaction } from "schemas/comment.schema";

export class ToggleReactionDto {
  @ApiProperty({
    example: "60d5f483f1a2b12d4c8e4b93",
    description: "Comment ObjectId",
  })
  @IsMongoId()
  commentId: string;

  @ApiProperty({
    example: "60d5f483f1a2b12d4c8e4b92",
    description: "User ObjectId",
  })
  @IsMongoId()
  userId: string;

  @ApiProperty({
    enum: Reaction,
    example: Reaction.LIKE,
    description: "Reaction type",
  })
  @IsEnum(Reaction)
  reactionType: Reaction;
}
