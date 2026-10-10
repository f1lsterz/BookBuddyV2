import { Transform } from "class-transformer";
import { IsBoolean, IsMongoId, IsOptional } from "class-validator";

export class ListNotificationsQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  unreadOnly?: boolean;
}

export class ListNotificationsRpcDto {
  @IsMongoId()
  userId: string;

  @IsOptional()
  @IsBoolean()
  unreadOnly?: boolean;
}

export class MarkNotificationReadRpcDto {
  @IsMongoId()
  userId: string;

  @IsMongoId()
  notificationId: string;
}
