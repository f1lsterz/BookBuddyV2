import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/createUserDto";
import { UpdateUserDto } from "./dto/updateUserDto";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "schemas/user.schema";
import { Model, Types } from "mongoose";
import { ApiError } from "../../api-gateway/src/common/errors/apiError";
import {
  FriendRequest,
  FriendRequestDocument,
  Status,
} from "schemas/friend.request.schema";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(FriendRequest.name)
    private readonly friendRequestModel: Model<FriendRequestDocument>
  ) {}

  async findUserById(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw ApiError.BadRequest("Invalid user ID");
    }

    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw ApiError.NotFound(`User with ID ${id} not found`);
    }

    return user;
  }

  async findUserByEmail(email: string): Promise<UserDocument> {
    if (!email) {
      throw ApiError.BadRequest("Email is required");
    }

    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw ApiError.NotFound(`User with email ${email} not found`);
    }

    return user;
  }

  async findAllUsers(): Promise<Partial<User>[]> {
    const users = await this.userModel.find({}, "email name").exec();
    return users;
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { email } = createUserDto;

    const existing = await this.userModel.findOne({ email }).exec();
    if (existing) {
      throw ApiError.BadRequest("User with this email already exists");
    }

    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw ApiError.BadRequest("Invalid user ID");
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();

    if (!updatedUser) {
      throw ApiError.NotFound("User not found");
    }

    return updatedUser;
  }

  async deleteUser(id: string): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw ApiError.BadRequest("Invalid user ID");
    }

    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw ApiError.NotFound("User not found");
    }

    return deletedUser;
  }

  async sendFriendRequest(senderId: string, receiverId: string) {
    const [sender, receiver] = await Promise.all([
      this.findUserById(senderId),
      this.findUserById(receiverId),
    ]);

    const existing = await this.friendRequestModel.findOne({
      senderId,
      receiverId,
      status: Status.PENDING,
    });
    if (existing) throw ApiError.BadRequest("Friend request already sent");

    const areFriends = sender.friends?.includes(receiver._id);
    if (areFriends) throw ApiError.BadRequest("You are already friends");

    const request = await this.friendRequestModel.create({
      senderId,
      receiverId,
      status: Status.PENDING,
    });

    return request;
  }

  async acceptFriendRequest(requestId: string) {
    const request = await this.friendRequestModel.findById(requestId);
    if (!request) throw ApiError.NotFound("Friend request not found");

    const [sender, receiver] = await Promise.all([
      this.findUserById(String(request.senderId)),
      this.findUserById(String(request.receiverId)),
    ]);

    await Promise.all([
      this.userModel.findByIdAndUpdate(sender._id, {
        $addToSet: { friends: receiver._id },
      }),
      this.userModel.findByIdAndUpdate(receiver._id, {
        $addToSet: { friends: sender._id },
      }),
    ]);

    request.status = Status.ACCEPTED;
    await request.save();

    return { message: "Friend request accepted" };
  }

  async declineFriendRequest(requestId: string) {
    const request = await this.friendRequestModel.findById(requestId);
    if (!request) throw ApiError.NotFound("Friend request not found");

    if (request.status !== Status.PENDING) {
      throw ApiError.BadRequest("Friend request is already processed");
    }

    request.status = Status.DECLINED;
    await request.save();

    return { message: "Friend request declined" };
  }

  async getPendingFriendRequests(receiverId: string) {
    const requests = await this.friendRequestModel
      .find({ receiverId, status: Status.PENDING })
      .populate("senderId", "name photoUrl");

    return requests.map((r) => ({
      id: r._id,
      senderId: r.senderId._id,
      name: r.senderId.name,
      profileImage: r.senderId.photoUrl,
    }));
  }

  async getFriends(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .populate("friends", "name photoUrl");

    if (!user) throw ApiError.NotFound("User not found");

    return user.friends.map((friend: any) => ({
      userId: friend._id,
      name: friend.name,
      profileImage: friend.photoUrl,
    }));
  }

  async removeFriend(userId1: string, userId2: string) {
    const [user1, user2] = await Promise.all([
      this.findUserById(userId1),
      this.findUserById(userId2),
    ]);

    const isFriend =
      user1.friends?.includes(user2._id) && user2.friends?.includes(user1._id);

    if (!isFriend) return { message: "You are not friends" };

    await Promise.all([
      this.userModel.findByIdAndUpdate(userId1, {
        $pull: { friends: user2._id },
      }),
      this.userModel.findByIdAndUpdate(userId2, {
        $pull: { friends: user1._id },
      }),
    ]);

    return { message: "Friendship removed" };
  }
}
