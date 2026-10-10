import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  AddCommentBodyDto,
  CommentReactionType,
  GetBooksQueryDto,
  ToggleReactionBodyDto,
  UpsertBookRatingBodyDto,
} from "@bookbuddy/shared";

export class GetBooksQueryApiDto extends GetBooksQueryDto {
  @ApiPropertyOptional({ example: 1 })
  declare page?: number;

  @ApiPropertyOptional({ example: 10 })
  declare limit?: number;

  @ApiPropertyOptional({ example: "title" })
  declare sortBy?: string;

  @ApiPropertyOptional({ enum: ["asc", "desc"] })
  declare order?: "asc" | "desc";

  @ApiPropertyOptional({ example: "Harry" })
  declare query?: string;
}

export class AddCommentBodyApiDto extends AddCommentBodyDto {
  @ApiProperty({ example: "Great book!" })
  declare commentText: string;
}

export class ToggleReactionBodyApiDto extends ToggleReactionBodyDto {
  @ApiProperty({ enum: CommentReactionType })
  declare reactionType: CommentReactionType;
}

export class UpsertBookRatingBodyApiDto extends UpsertBookRatingBodyDto {
  @ApiProperty({ minimum: 1, maximum: 5, example: 4 })
  declare newRating: number;
}
