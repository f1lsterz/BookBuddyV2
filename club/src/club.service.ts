import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  Club,
  ClubDocument,
  ClubMember,
  ClubMemberDocument,
  ClubRole,
} from "../schemas/club.schema";
import { ApiError } from "../../api-gateway/src/common/errors/apiError";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { CACHE_CLUBS } from "./config/cache.keys";

@Injectable()
export class ClubService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectModel(Club.name) private clubModel: Model<ClubDocument>,
    @InjectModel(ClubMember.name)
    private clubMemberModel: Model<ClubMemberDocument>
  ) {}

  async createBookClub(
    name: string,
    description: string,
    userId: string,
    imageFile?: Express.Multer.File
  ) {
    if (await this.isUserInAnyClub(userId)) {
      throw ApiError.BadRequest("User is already in a club");
    }

    const gatewayBaseUrl = process.env.GATEWAY_URL || "http://localhost:3000";
    const imageUrl = imageFile
      ? `${gatewayBaseUrl}/uploads/${imageFile.filename}`
      : undefined;

    const club = new this.clubModel({
      name,
      description,
      imageUrl,
      memberCount: 1,
      members: [],
    });
    await club.save();

    const member = new this.clubMemberModel({
      clubId: club._id,
      userId: new Types.ObjectId(userId),
      role: ClubRole.ADMIN,
    });
    await member.save();

    club.members.push(member._id);
    await club.save();

    await this.cacheManager.del(CACHE_CLUBS.ALL_CLUBS);

    return club;
  }

  async searchClubs(query?: string, filterFull?: boolean) {
    const maxMembers = Number(process.env.MAX_MEMBER_COUNT) || 50;
    const cacheKey = CACHE_CLUBS.SEARCH_CLUBS(query || "", filterFull || false);
    const cached = await this.cacheManager.get<ClubDocument[]>(cacheKey);
    if (cached) return cached;

    const filter: any = {};
    if (query) filter.name = { $regex: query, $options: "i" };
    if (filterFull) filter.memberCount = { $lt: maxMembers };

    const clubs = await this.clubModel.find(filter).exec();
    await this.cacheManager.set(cacheKey, clubs, 3600);
    return clubs;
  }

  async getAllClubs() {
    const cacheKey = CACHE_CLUBS.ALL_CLUBS;
    const cached = await this.cacheManager.get<ClubDocument[]>(cacheKey);
    if (cached) return cached;

    const clubs = await this.clubModel.find().exec();
    await this.cacheManager.set(cacheKey, clubs, 3600);
    return clubs;
  }

  async getClub(clubId: string) {
    const cacheKey = CACHE_CLUBS.CLUB(clubId);
    const cached = await this.cacheManager.get<ClubDocument>(cacheKey);
    if (cached) return cached;

    const club = await this.clubModel.findById(clubId).exec();
    if (!club) {
      throw ApiError.NotFound("Club not found");
    }

    await this.cacheManager.set(cacheKey, club, 3600);
    return club;
  }

  async updateBookClub(
    clubId: string,
    name?: string,
    description?: string,
    imageFile?
  ) {
    const club = await this.clubModel.findById(clubId).exec();
    if (!club) {
      throw ApiError.NotFound("Club not found");
    }

    if (name) club.name = name;
    if (description) club.description = description;
    if (imageFile) club.imageUrl = `/uploads/${imageFile.filename}`;

    await this.cacheManager.del(CACHE_CLUBS.CLUB(clubId));
    await this.cacheManager.del(CACHE_CLUBS.ALL_CLUBS);

    return club.save();
  }

  async deleteBookClub(clubId: string) {
    const club = await this.clubModel.findById(clubId).exec();
    if (!club) {
      throw ApiError.NotFound("Club not found");
    }

    await this.clubMemberModel.deleteMany({ clubId: club._id }).exec();
    await this.cacheManager.del(CACHE_CLUBS.CLUB(clubId));
    await this.cacheManager.del(CACHE_CLUBS.ALL_CLUBS);
    return this.clubModel.findByIdAndDelete(club._id).exec();
  }

  async addMember(clubId: string, userId: string) {
    const club = await this.clubModel.findById(clubId).exec();
    if (!club) {
      throw ApiError.NotFound("Club not found");
    }

    if (await this.isUserInAnyClub(userId)) {
      throw ApiError.BadRequest("User is already a member of another club.");
    }

    const member = new this.clubMemberModel({
      clubId: club._id,
      userId: new Types.ObjectId(userId),
      role: ClubRole.MEMBER,
    });
    await member.save();

    club.members.push(member._id);
    club.memberCount += 1;
    await club.save();

    return member;
  }

  async isUserInClub(userId: string, clubId: string) {
    const member = await this.clubMemberModel.findOne({
      userId: new Types.ObjectId(userId),
      clubId: new Types.ObjectId(clubId),
    });
    return !!member;
  }

  async isUserInAnyClub(userId: string) {
    const member = await this.clubMemberModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    return !!member;
  }

  async leaveFromClub(clubId: string, userId: string) {
    const membership = await this.clubMemberModel.findOne({
      userId: new Types.ObjectId(userId),
      clubId: new Types.ObjectId(clubId),
    });

    if (!membership || !membership._id) {
      throw ApiError.NotFound("Member not found in this club");
    }

    await this.clubMemberModel.deleteOne({ _id: membership._id });

    const club = await this.clubModel.findById(clubId);
    if (!club) {
      throw ApiError.NotFound("Club not found");
    }

    club.memberCount -= 1;
    club.members = club.members.filter(
      (memberId: Types.ObjectId) => !memberId.equals(membership._id)
    );

    await club.save();
  }

  async removeMemberFromClub(clubId: string, userId: string) {
    const isMember = await this.isUserInClub(userId, clubId);
    if (!isMember) {
      throw ApiError.BadRequest("User is not a member of this club");
    }

    const membership = await this.clubMemberModel.findOne({
      userId: new Types.ObjectId(userId),
      clubId: new Types.ObjectId(clubId),
    });

    if (!membership || !membership._id) {
      throw ApiError.NotFound("Member not found");
    }

    await this.clubMemberModel.deleteOne({ _id: membership._id });

    const club = await this.clubModel.findById(clubId);
    if (!club) {
      throw ApiError.NotFound("Club not found");
    }

    club.memberCount -= 1;
    club.members = club.members.filter(
      (memberId: Types.ObjectId) => !memberId.equals(membership._id)
    );

    await club.save();
  }
}
