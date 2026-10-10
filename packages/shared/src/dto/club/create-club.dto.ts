import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateClubDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsMongoId()
  userId: string;
}

/** RPC payload after gateway (optional uploaded file metadata). */
export class CreateClubRpcDto extends CreateClubDto {
  @IsOptional()
  imageFile?: { filename?: string };
}
