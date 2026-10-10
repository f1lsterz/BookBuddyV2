import { Injectable } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { ClientSession, Connection, Model, Types } from "mongoose";
import { CreateUserDto } from "@bookbuddy/shared";
import { UpdateUserDto } from "@bookbuddy/shared";
import { User, UserDocument } from "../../schemas/user.schema";
import { UserPublicInfo } from "../types/user.return.types";

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
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

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  findAllPublic() {
    return this.userModel.find({}, "email name").lean<UserPublicInfo[]>();
  }

  create(dto: CreateUserDto) {
    const created = new this.userModel(dto);
    return created.save();
  }

  updateById(id: string, dto: UpdateUserDto) {
    return this.userModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  deleteById(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  addFriendship(
    userIdA: Types.ObjectId,
    userIdB: Types.ObjectId,
    session?: ClientSession,
  ) {
    return Promise.all([
      this.userModel.findByIdAndUpdate(
        userIdA,
        {
          $addToSet: { friends: userIdB },
        },
        { session },
      ),
      this.userModel.findByIdAndUpdate(
        userIdB,
        {
          $addToSet: { friends: userIdA },
        },
        { session },
      ),
    ]);
  }

  removeFriendship(userId1: string, userId2: Types.ObjectId, userId1Ref: Types.ObjectId) {
    return Promise.all([
      this.userModel.findByIdAndUpdate(userId1, {
        $pull: { friends: userId2 },
      }),
      this.userModel.findByIdAndUpdate(userId2, {
        $pull: { friends: userId1Ref },
      }),
    ]);
  }

  findByIdWithFriendsPopulated(userId: string) {
    return this.userModel
      .findById(userId)
      .populate<{ friends: UserDocument[] }>("friends", "name photoUrl")
      .exec();
  }
}
