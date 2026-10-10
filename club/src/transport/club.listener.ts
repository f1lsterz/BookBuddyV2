import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  ClubCmd,
  ClubIdActorRpcDto,
  ClubIdUserIdRpcDto,
  ClubMemberChangeRpcDto,
  ClubUserMembershipRpcDto,
  CreateClubRpcDto,
  SearchClubsDto,
  UpdateClubRpcDto,
} from "@bookbuddy/shared";
import { ClubApplicationService } from "../application/club.application.service";

@Controller()
export class ClubListener {
  constructor(private readonly clubApplication: ClubApplicationService) {}

  @MessagePattern({ cmd: ClubCmd.CREATE })
  async createBookClub(@Payload() payload: CreateClubRpcDto) {
    return this.clubApplication.createBookClub(
      payload.name,
      payload.description,
      payload.userId,
      payload.imageFile,
    );
  }

  @MessagePattern({ cmd: ClubCmd.SEARCH })
  async searchClubs(@Payload() payload: SearchClubsDto) {
    return this.clubApplication.searchClubs(payload.query, payload.filterFull);
  }

  @MessagePattern({ cmd: ClubCmd.GET_ALL })
  async getAllClubs() {
    return this.clubApplication.getAllClubs();
  }

  @MessagePattern({ cmd: ClubCmd.GET })
  async getClub(@Payload() clubId: string) {
    return this.clubApplication.getClub(clubId);
  }

  @MessagePattern({ cmd: ClubCmd.UPDATE })
  async updateBookClub(@Payload() payload: UpdateClubRpcDto) {
    return this.clubApplication.updateBookClub(
      payload.clubId,
      payload.actorId,
      payload.name,
      payload.description,
      payload.imageFile,
    );
  }

  @MessagePattern({ cmd: ClubCmd.DELETE })
  async deleteBookClub(@Payload() payload: ClubIdActorRpcDto) {
    return this.clubApplication.deleteBookClub(payload.clubId, payload.actorId);
  }

  @MessagePattern({ cmd: ClubCmd.ADD_MEMBER })
  async addMember(@Payload() payload: ClubMemberChangeRpcDto) {
    return this.clubApplication.addMember(
      payload.clubId,
      payload.userId,
      payload.actorId,
    );
  }

  @MessagePattern({ cmd: ClubCmd.LEAVE })
  async leaveFromClub(@Payload() payload: ClubIdUserIdRpcDto) {
    return this.clubApplication.leaveFromClub(payload.clubId, payload.userId);
  }

  @MessagePattern({ cmd: ClubCmd.REMOVE_MEMBER })
  async removeMemberFromClub(@Payload() payload: ClubMemberChangeRpcDto) {
    return this.clubApplication.removeMemberFromClub(
      payload.clubId,
      payload.userId,
      payload.actorId,
    );
  }

  @MessagePattern({ cmd: ClubCmd.IS_USER_IN_CLUB })
  async isUserInClub(@Payload() payload: ClubUserMembershipRpcDto) {
    return this.clubApplication.isUserInClub(payload.userId, payload.clubId);
  }

  @MessagePattern({ cmd: ClubCmd.IS_USER_IN_ANY_CLUB })
  async isUserInAnyClub(@Payload() userId: string) {
    return this.clubApplication.isUserInAnyClub(userId);
  }

  @MessagePattern({ cmd: ClubCmd.IS_CLUB_ADMIN })
  async isClubAdmin(@Payload() payload: ClubUserMembershipRpcDto) {
    return this.clubApplication.isClubAdmin(payload.userId, payload.clubId);
  }
}
