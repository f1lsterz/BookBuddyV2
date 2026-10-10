import { IsMongoId } from "class-validator";

export class DeleteCommentRpcDto {
  @IsMongoId()
  commentId: string;

  @IsMongoId()
  userId: string;
}

export class DeleteCommentBodyDto {}
