import { Module } from "@nestjs/common";
import { ClubService } from "./club.service";
import { ClubListener } from "./club.listener";
import { MongooseModule } from "@nestjs/mongoose";
import {
  Club,
  ClubMember,
  ClubMemberSchema,
  ClubSchema,
} from "schemas/club.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Club.name, schema: ClubSchema },
      { name: ClubMember.name, schema: ClubMemberSchema },
    ]),
  ],
  controllers: [ClubListener],
  providers: [ClubService],
})
export class ClubModule {}
