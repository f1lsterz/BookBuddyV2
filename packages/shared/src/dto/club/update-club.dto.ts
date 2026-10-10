import { IsMongoId, IsOptional, IsString } from "class-validator";

export class UpdateClubDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateClubRpcDto extends UpdateClubDto {
  @IsMongoId()
  clubId: string;

  @IsMongoId()
  actorId: string;

  @IsOptional()
  imageFile?: { filename?: string };
}
