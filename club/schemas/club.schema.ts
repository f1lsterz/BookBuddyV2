import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ClubDocument = HydratedDocument<Club>;
export type ClubMemberDocument = HydratedDocument<ClubMember>;

export enum ClubRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

@Schema({ timestamps: true })
export class Club {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: 0 })
  memberCount: number;

  @Prop()
  imageUrl?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: "ClubMember" }], default: [] })
  members: Types.ObjectId[];
}

export const ClubSchema = SchemaFactory.createForClass(Club);

@Schema({ timestamps: true })
export class ClubMember {
  @Prop({ required: true, enum: ClubRole })
  role: ClubRole;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Club", required: true })
  clubId: Types.ObjectId;
}

export const ClubMemberSchema = SchemaFactory.createForClass(ClubMember);

ClubMemberSchema.index({ userId: 1, clubId: 1 }, { unique: true });
ClubMemberSchema.index({ userId: 1 }, { unique: true });
