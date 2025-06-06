import { Inject, Injectable } from "@nestjs/common";
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
import {
  FriendInfo,
  FriendRequestInfo,
  MessageResponse,
  UserPublicInfo,
} from "./types/user.return.types";
import { SendFriendRequestDto } from "./dto/send.friend.dto";
import { RemoveFriendDto } from "./dto/remove.friend.dto";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { CACHE_USERS } from "./config/cache.keys";

@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(FriendRequest.name)
    private readonly friendRequestModel: Model<FriendRequestDocument>
  ) {}

  async findUserById(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw ApiError.BadRequest("Invalid user ID");
    }

    const cacheKey = CACHE_USERS.USER(id);
    const cached = await this.cacheManager.get<UserDocument>(cacheKey);
    if (cached) return cached;

    const user = await this.userModel.findById(id).exec();
    if (!user) throw ApiError.NotFound(`User with ID ${id} not found`);

    await this.cacheManager.set(cacheKey, user, 3600);
    return user;
  }

  async findUserByEmail(email: string): Promise<UserDocument> {
    if (!email) throw ApiError.BadRequest("Email is required");

    const cacheKey = CACHE_USERS.USER_BY_EMAIL(email);
    const cached = await this.cacheManager.get<UserDocument>(cacheKey);
    if (cached) return cached;

    const user = await this.userModel.findOne({ email }).exec();
    if (!user) throw ApiError.NotFound(`User with email ${email} not found`);

    await this.cacheManager.set(cacheKey, user, 3600);
    return user;
  }

  async findAllUsers(): Promise<UserPublicInfo[]> {
    const cacheKey = CACHE_USERS.ALL_USERS;
    const cached = await this.cacheManager.get<UserPublicInfo[]>(cacheKey);
    if (cached) return cached;

    const users = await this.userModel.find({}, "email name").lean();
    await this.cacheManager.set(cacheKey, users, 0);
    return users;
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { email } = createUserDto;

    const existing = await this.userModel.findOne({ email }).exec();
    if (existing) {
      throw ApiError.BadRequest("User with this email already exists");
    }

    const createdUser = new this.userModel(createUserDto);
    const savedUser = await createdUser.save();

    await this.cacheManager.set(
      CACHE_USERS.USER(savedUser._id.toString()),
      savedUser,
      3600
    );
    await this.cacheManager.set(
      CACHE_USERS.USER_BY_EMAIL(savedUser.email),
      savedUser,
      3600
    );
    await this.cacheManager.del(CACHE_USERS.ALL_USERS);

    return savedUser;
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto
  ): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw ApiError.BadRequest("Invalid user ID");
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();

    if (!updatedUser) {
      throw ApiError.NotFound("User not found");
    }

    await this.cacheManager.set(CACHE_USERS.USER(id), updatedUser, 3600);
    await this.cacheManager.set(
      CACHE_USERS.USER_BY_EMAIL(updatedUser.email),
      updatedUser,
      3600
    );
    await this.cacheManager.del(CACHE_USERS.ALL_USERS);

    return updatedUser;
  }

  async deleteUser(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw ApiError.BadRequest("Invalid user ID");
    }

    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
    if (!deletedUser) {
      throw ApiError.NotFound("User not found");
    }

    await this.cacheManager.del(CACHE_USERS.USER(id));
    await this.cacheManager.del(CACHE_USERS.USER_BY_EMAIL(deletedUser.email));
    await this.cacheManager.del(CACHE_USERS.ALL_USERS);

    return deletedUser;
  }

  async sendFriendRequest(dto: SendFriendRequestDto) {
    const { senderId, receiverId } = dto;

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

  async declineFriendRequest(requestId: string): Promise<MessageResponse> {
    const request = await this.friendRequestModel.findById(requestId);
    if (!request) throw ApiError.NotFound("Friend request not found");

    if (request.status !== Status.PENDING) {
      throw ApiError.BadRequest("Friend request is already processed");
    }

    request.status = Status.DECLINED;
    await request.save();

    return { message: "Friend request declined" };
  }

  async getPendingFriendRequests(
    receiverId: string
  ): Promise<FriendRequestInfo[]> {
    const cacheKey = CACHE_USERS.PENDING_REQUESTS(receiverId);
    const cached = await this.cacheManager.get<FriendRequestInfo[]>(cacheKey);
    if (cached) return cached;

    const requests = await this.friendRequestModel
      .find({ receiverId, status: Status.PENDING })
      .populate<{ senderId: UserDocument }>("senderId", "name photoUrl")
      .exec();

    const result = requests.map((r) => {
      const sender = r.senderId as UserDocument;
      return {
        id: r._id.toString(),
        senderId: sender._id.toString(),
        name: sender.name || "",
        profileImage: sender.photoUrl || "",
      };
    });

    await this.cacheManager.set(cacheKey, result, 3600);
    return result;
  }

  async getFriends(userId: string): Promise<FriendInfo[]> {
    const cacheKey = CACHE_USERS.FRIENDS(userId);
    const cached = await this.cacheManager.get<FriendInfo[]>(cacheKey);
    if (cached) return cached;

    const user = await this.userModel
      .findById(userId)
      .populate<{ friends: UserDocument[] }>("friends", "name photoUrl")
      .exec();

    if (!user) {
      throw ApiError.NotFound("User not found");
    }

    const result = user.friends.map((friend) => ({
      userId: friend._id.toString(),
      name: friend.name || "",
      profileImage: friend.photoUrl || "",
    }));

    await this.cacheManager.set(cacheKey, result, 3600);
    return result;
  }

  async removeFriend(dto: RemoveFriendDto): Promise<MessageResponse> {
    const { userId1, userId2 } = dto;

    const [user1, user2] = await Promise.all([
      this.findUserById(userId1),
      this.findUserById(userId2),
    ]);

    const isFriend =
      user1.friends?.includes(user2._id) && user2.friends?.includes(user1._id);

    if (!isFriend) {
      return { message: "You are not friends" };
    }

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
