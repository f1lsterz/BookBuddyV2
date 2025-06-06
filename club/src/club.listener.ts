import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { ClubService } from "./club.service";

@Controller()
export class ClubListener {
  constructor(private readonly clubService: ClubService) {}

  @MessagePattern({ cmd: "create-book-club" })
  async createBookClub(
    @Payload()
    payload: {
      name: string;
      description: string;
      userId: string;
      imageFile?: any;
    }
  ) {
    return this.clubService.createBookClub(
      payload.name,
      payload.description,
      payload.userId,
      payload.imageFile
    );
  }

  @MessagePattern({ cmd: "search-clubs" })
  async searchClubs(
    @Payload() payload: { query?: string; filterFull?: boolean }
  ) {
    return this.clubService.searchClubs(payload.query, payload.filterFull);
  }

  @MessagePattern({ cmd: "get-all-clubs" })
  async getAllClubs() {
    return this.clubService.getAllClubs();
  }

  @MessagePattern({ cmd: "get-club" })
  async getClub(@Payload() clubId: string) {
    return this.clubService.getClub(clubId);
  }

  @MessagePattern({ cmd: "update-book-club" })
  async updateBookClub(
    @Payload()
    payload: {
      clubId: string;
      name?: string;
      description?: string;
      imageFile?: any;
    }
  ) {
    return this.clubService.updateBookClub(
      payload.clubId,
      payload.name,
      payload.description,
      payload.imageFile
    );
  }

  @MessagePattern({ cmd: "delete-book-club" })
  async deleteBookClub(@Payload() clubId: string) {
    return this.clubService.deleteBookClub(clubId);
  }

  @MessagePattern({ cmd: "add-member" })
  async addMember(@Payload() payload: { clubId: string; userId: string }) {
    return this.clubService.addMember(payload.clubId, payload.userId);
  }

  @MessagePattern({ cmd: "leave-from-club" })
  async leaveFromClub(@Payload() payload: { clubId: string; userId: string }) {
    return this.clubService.leaveFromClub(payload.clubId, payload.userId);
  }

  @MessagePattern({ cmd: "remove-member-from-club" })
  async removeMemberFromClub(
    @Payload() payload: { clubId: string; userId: string }
  ) {
    return this.clubService.removeMemberFromClub(
      payload.clubId,
      payload.userId
    );
  }

  @MessagePattern({ cmd: "is-user-in-club" })
  async isUserInClub(@Payload() payload: { userId: string; clubId: string }) {
    return this.clubService.isUserInClub(payload.userId, payload.clubId);
  }

  @MessagePattern({ cmd: "is-user-in-any-club" })
  async isUserInAnyClub(@Payload() userId: string) {
    return this.clubService.isUserInAnyClub(userId);
  }
}
