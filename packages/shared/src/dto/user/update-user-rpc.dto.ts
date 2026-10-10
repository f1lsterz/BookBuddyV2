import { IsMongoId, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { UpdateUserDto } from "./update-user.dto";

export class UpdateUserRpcDto {
  @IsMongoId()
  id: string;

  @ValidateNested()
  @Type(() => UpdateUserDto)
  dto: UpdateUserDto;
}
