import { IsInt, IsMongoId, IsOptional, Min } from "class-validator";
import { Type } from "class-transformer";

export class ClubMessagesRpcDto {
  @IsMongoId()
  userId: string;

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

export class ClearClubChatRpcDto {
  @IsMongoId()
  clubId: string;

  @IsMongoId()
  actorId: string;
}
