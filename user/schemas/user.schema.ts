import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type UserDocument = HydratedDocument<User>;

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
  COURIER = "COURIER",
  PARTNER = "PARTNER",
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  name?: string;

  @Prop()
  password?: string;

  @Prop()
  photoUrl?: string;

  @Prop()
  bio?: string;

  @Prop({ enum: Role, default: Role.USER })
  role: Role;

  @Prop({ type: Object })
  favouriteGenres?: Record<string, any>;

  @Prop({ type: [{ type: Types.ObjectId, ref: "User" }] })
  friends: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: "FriendRequest" }] })
  friendRequestsSent: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: "FriendRequest" }] })
  friendRequestsReceived: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId }] })
  commentReactionIds: Types.ObjectId[];

  @Prop({ type: Types.ObjectId })
  clubMembershipId?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId }] })
  bookRatingIds: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId }] })
  libraryIds: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
