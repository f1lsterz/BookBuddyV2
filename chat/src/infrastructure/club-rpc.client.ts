import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ClubCmd, ClubUserMembershipRpcDto } from "@bookbuddy/shared";
import { lastValueFrom } from "rxjs";

@Injectable()
export class ClubRpcClient {
  constructor(@Inject("CLUB_SERVICE") private readonly clubClient: ClientProxy) {}

  isUserInClub(userId: string, clubId: string) {
    const payload: ClubUserMembershipRpcDto = { userId, clubId };
    return lastValueFrom(
      this.clubClient.send<boolean>({ cmd: ClubCmd.IS_USER_IN_CLUB }, payload),
    );
  }

  isClubAdmin(userId: string, clubId: string) {
    const payload: ClubUserMembershipRpcDto = { userId, clubId };
    return lastValueFrom(
      this.clubClient.send<boolean>({ cmd: ClubCmd.IS_CLUB_ADMIN }, payload),
    );
  }
}
