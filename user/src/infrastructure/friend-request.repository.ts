import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Model } from "mongoose";
import {
  FriendRequest,
  FriendRequestDocument,
  Status,
} from "../../schemas/friend.request.schema";
import { UserDocument } from "../../schemas/user.schema";
import { SendFriendRequestDto } from "@bookbuddy/shared";

@Injectable()
export class FriendRequestRepository {
  constructor(
    @InjectModel(FriendRequest.name)
    private readonly friendRequestModel: Model<FriendRequestDocument>,
  ) {}

  findPendingDuplicate(senderId: string, receiverId: string) {
    return this.friendRequestModel.findOne({
      senderId,
      receiverId,
      status: Status.PENDING,
    });
  }

  async createPending(dto: SendFriendRequestDto, session?: ClientSession) {
    const [doc] = await this.friendRequestModel.create(
      [
        {
          senderId: dto.senderId,
          receiverId: dto.receiverId,
          status: Status.PENDING,
        },
      ],
      { session },
    );
    return doc;
  }

  findById(requestId: string) {
    return this.friendRequestModel.findById(requestId);
  }

  save(request: FriendRequestDocument, session?: ClientSession) {
    return request.save({ session });
  }

  findPendingForReceiver(receiverId: string) {
    return this.friendRequestModel
      .find({ receiverId, status: Status.PENDING })
      .populate<{ senderId: UserDocument }>("senderId", "name photoUrl")
      .exec();
  }
}
