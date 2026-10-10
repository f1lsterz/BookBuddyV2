import { IsEnum, IsMongoId } from "class-validator";
import { CommentReactionType } from "../../contracts/comment-reaction";

export class ToggleReactionDto {
  @IsMongoId()
  commentId: string;

  @IsMongoId()
  userId: string;

  @IsEnum(CommentReactionType)
  reactionType: CommentReactionType;
}

export class ToggleReactionBodyDto {
  @IsEnum(CommentReactionType)
  reactionType: CommentReactionType;
}
