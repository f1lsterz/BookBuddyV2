import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type FriendRequestDocument = HydratedDocument<FriendRequest>;

export enum Status {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
}

@Schema({ timestamps: true })
export class FriendRequest {
  @Prop({ required: true, enum: Status, default: Status.PENDING })
  status: Status;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  senderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  receiverId: Types.ObjectId;
}

export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);
