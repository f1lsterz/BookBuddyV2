import { IsMongoId } from "class-validator";

export class DeleteChatMessageRpcDto {
  @IsMongoId()
  messageId: string;

  @IsMongoId()
  userId: string;
}

export class DeleteChatMessageBodyDto {}
