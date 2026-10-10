import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { UserCmd, UserPairRpcDto } from "@bookbuddy/shared";
import { lastValueFrom } from "rxjs";

@Injectable()
export class UserRpcClient {
  constructor(@Inject("USER_SERVICE") private readonly userClient: ClientProxy) {}

  areFriends(userId1: string, userId2: string) {
    const payload: UserPairRpcDto = { userId1, userId2 };
    return lastValueFrom(
      this.userClient.send<boolean>({ cmd: UserCmd.ARE_FRIENDS }, payload),
    );
  }
}
