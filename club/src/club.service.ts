import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  Club,
  ClubDocument,
  ClubMember,
  ClubMemberDocument,
  ClubRole,
} from "schemas/club.schema";
import { ApiError } from "../../api-gateway/src/common/errors/apiError";

@Injectable()
export class ClubService {
  constructor(
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
      throw ApiError.BadRequest(
        "User is already a member of another club and cannot create a new club."
      );
    }

    let imageUrl = null;
    if (imageFile) {
      imageUrl = `/uploads/${imageFile.filename}`;
    }

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

    return club;
  }

  async searchClubs(query?: string, filterFull?: boolean) {
    const maxMembers = Number(process.env.MAX_MEMBER_COUNT) || 50;

    const filter: any = {};
    if (query) filter.name = { $regex: query, $options: "i" };
    if (filterFull) filter.memberCount = { $lt: maxMembers };

    return this.clubModel.find(filter).exec();
  }

  async getAllClubs() {
    return this.clubModel.find().exec();
  }

  async getClub(clubId: string) {
    const club = await this.clubModel.findById(clubId).exec();
    if (!club) {
      throw ApiError.NotFound("Club not found");
    }
    return club;
  }

  async updateBookClub(
    clubId: string,
    name?: string,
    description?: string,
    imageFile?: Express.Multer.File
  ) {
    const club = await this.clubModel.findById(clubId).exec();
    if (!club) {
      throw ApiError.NotFound("Club not found");
    }

    if (name) club.name = name;
    if (description) club.description = description;
    if (imageFile) club.imageUrl = `/uploads/${imageFile.filename}`;

    return club.save();
  }

  async deleteBookClub(clubId: string) {
    const club = await this.clubModel.findById(clubId).exec();
    if (!club) {
      throw ApiError.NotFound("Club not found");
    }

    await this.clubMemberModel.deleteMany({ clubId: club._id }).exec();
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
    const membership = await this.clubMemberModel.findOneAndDelete({
      userId: new Types.ObjectId(userId),
      clubId: new Types.ObjectId(clubId),
    });

    if (!membership) {
      throw ApiError.NotFound("Member not found in this club");
    }

    await this.clubModel.findByIdAndUpdate(clubId, {
      $inc: { memberCount: -1 },
      $pull: { members: membership._id },
    });
  }

  async removeMemberFromClub(clubId: string, userId: string) {
    const isMember = await this.isUserInClub(userId, clubId);
    if (!isMember) {
      throw ApiError.BadRequest("User is not a member of this club");
    }

    const membership = await this.clubMemberModel.findOneAndDelete({
      userId: new Types.ObjectId(userId),
      clubId: new Types.ObjectId(clubId),
    });

    if (!membership) {
      throw ApiError.NotFound("Member not found");
    }

    await this.clubModel.findByIdAndUpdate(clubId, {
      $inc: { memberCount: -1 },
      $pull: { members: membership._id },
    });
  }

  async getClubMembers(clubId: string) {
    return this.clubMemberModel.find({
      clubId: new Types.ObjectId(clubId),
    });
  }
}
