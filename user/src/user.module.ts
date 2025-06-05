import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "schemas/user.schema";
import {
  FriendRequest,
  FriendRequestSchema,
} from "schemas/friend.request.schema";
import { UserListener } from "./user.listener";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: FriendRequest.name, schema: FriendRequestSchema },
    ]),
  ],
  controllers: [UserListener],
  providers: [UserService],
})
export class UserModule {}
