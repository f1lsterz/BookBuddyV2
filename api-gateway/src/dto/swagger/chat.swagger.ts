import { ApiProperty } from "@nestjs/swagger";
import { SendMessageBodyDto } from "@bookbuddy/shared";

export class SendMessageApiDto extends SendMessageBodyDto {
  @ApiProperty()
  declare clubId: string;

  @ApiProperty({ example: "Hello club!" })
  declare message: string;
}
