import { Injectable } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { ClientSession, Connection, Model, Types } from "mongoose";
import {
  Club,
  ClubDocument,
  ClubMember,
  ClubMemberDocument,
  ClubRole,
} from "../../schemas/club.schema";

@Injectable()
export class ClubRepository {
  constructor(
    @InjectModel(Club.name) private readonly clubModel: Model<ClubDocument>,
    @InjectModel(ClubMember.name)
    private readonly clubMemberModel: Model<ClubMemberDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async withTransaction<T>(work: (session: ClientSession) => Promise<T>): Promise<T> {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      try {
        const result = await work(session);
        await session.commitTransaction();
        return result;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      }
    } finally {
      await session.endSession();
    }
  }

  async findMembershipByUser(userId: string) {
    return this.clubMemberModel.findOne({
      userId: new Types.ObjectId(userId),
    });
  }

  async findMembership(userId: string, clubId: string) {
    return this.clubMemberModel.findOne({
      userId: new Types.ObjectId(userId),
      clubId: new Types.ObjectId(clubId),
    });
  }

  async createClubWithAdmin(params: {
    name: string;
    description: string;
    userId: string;
    imageUrl?: string;
  }) {
    const club = new this.clubModel({
      name: params.name,
      description: params.description,
      imageUrl: params.imageUrl,
      memberCount: 1,
      members: [],
    });
    await club.save();

    const member = new this.clubMemberModel({
      clubId: club._id,
      userId: new Types.ObjectId(params.userId),
      role: ClubRole.ADMIN,
    });
    await member.save();

    club.members.push(member._id);
    await club.save();

    return { club, member };
  }

  async search(filter: Record<string, unknown>) {
    return this.clubModel.find(filter).exec();
  }

  async findAll() {
    return this.clubModel.find().exec();
  }

  async findById(clubId: string) {
    return this.clubModel.findById(clubId).exec();
  }

  async saveClub(club: ClubDocument) {
    return club.save();
  }

  async deleteClubAndMembers(club: ClubDocument) {
    await this.clubMemberModel.deleteMany({ clubId: club._id }).exec();
    return this.clubModel.findByIdAndDelete(club._id).exec();
  }

  async addMemberToClub(club: ClubDocument, userId: string, session?: ClientSession) {
    const member = new this.clubMemberModel({
      clubId: club._id,
      userId: new Types.ObjectId(userId),
      role: ClubRole.MEMBER,
    });
    await member.save({ session });

    club.members.push(member._id);
    club.memberCount += 1;
    await club.save({ session });

    return member;
  }

  async removeMembership(
    membership: ClubMemberDocument,
    club: ClubDocument,
    session?: ClientSession,
  ) {
    await this.clubMemberModel.deleteOne({ _id: membership._id }, { session });

    club.memberCount -= 1;
    club.members = club.members.filter(
      (memberId: Types.ObjectId) => !memberId.equals(membership._id),
    );
    await club.save({ session });
  }
}
