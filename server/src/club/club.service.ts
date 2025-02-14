import { Injectable } from "@nestjs/common";
import { ClubRole } from "@prisma/client";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class ClubService {
  constructor(private readonly prisma: PrismaService) {}

  async createBookClub(name, description, userId, imageFile) {
    if (await this.isUserInAnyClub(userId)) {
      throw ApiError.BadRequest(
        "User is already a member of another club and cannot create a new club."
      );
    }

    let imageUrl = null;
    if (imageFile) {
      imageUrl = `/uploads/${imageFile.filename}`
    }

    const club = await this.prisma.club.create({data: {
      name,
      description,
      imageUrl,
      memberCount: 1 
    }});

    await this.prisma.clubMember.create({data: {
      clubId: club.id,
      userId: userId,
      role: ClubRole.ADMIN
    }})

    return club;
  }

  async searchClubs(query?: string, filterFull?: boolean) {
    const clubs = await this.prisma.club.findMany({
      where: {
        name: query ? { contains: query } : undefined,
        memberCount: filterFull ? { lt: Number(process.env.MAX_MEMBER_COUNT) || 50 } : undefined,
      },
    });
  
    return clubs;
  }

  async getAllClubs() {
    return await this.prisma.club.findMany();
  }

  async getClub(clubId) {
    const club = this.prisma.club.findUnique({ where: { id: clubId } });

    if (!club) {
      throw ApiError.BadRequest("Club not found");
    }

    return club;
  }

  async updateBookClub(clubId, name, description, image) {
    const club = this.prisma.club.findUnique({ where: { id: clubId } });

    if (!club) {
      throw ApiError.BadRequest("Club not found");
    }

    if (image)
  }

  async deleteBookClub(clubId) {
    const club = this.prisma.club.findUnique({ where: { id: clubId } });

    if (!club) {
      throw ApiError.BadRequest("Club not found");
    }

    await this.prisma.clubMember.deleteMany({where: {clubId}});
    return await this.prisma.club.delete({where: {id: clubId}});
  }

  async addMember(clubId, userId) {
    const club = this.prisma.club.findUnique({ where: { id: clubId } });

    if (!club) {
      throw ApiError.BadRequest("Club not found");
    }


  }

  async isUserInClub(userId, clubId) {}

  async isUserInAnyClub(userId) {
    return !!(await this.prisma.clubMember.findUnique({ where: { userId } }));
  }

  async leaveFromClub(clubId, userId) {
    const membership = await this.prisma.clubMember.findUnique({
      where: { userId_clubId: { clubId, userId } },
    });

    if (!membership) {
      throw ApiError.BadRequest("Member not found in this club");
    }

    await this.prisma.clubMember.delete({
      where: { userId_clubId: { userId, clubId } },
    });

    await this.prisma.club.update({
      where: { id: clubId },
      data: { memberCount: { decrement: 1 } },
    });
  }

  async removeMemberFromClub(clubId, userId) {
    if (!await this.isUserInClub(userId)) {
      throw ApiError.BadRequest(
        "User is already a member of another club and cannot create a new club."
      );
    }

    await this.prisma.clubMember.delete({where: {userId, clubId}})

    const club = this.prisma.club.findUnique({ where: { id: clubId } });

    if (!club) {
      throw ApiError.BadRequest("Club not found");
    }

    await this.prisma.club.update({data: {memberCount: }})
  }

  async getClubMembers(clubId) {
    return this.prisma.clubMember.findMany({where: {clubId}})
  }
}
