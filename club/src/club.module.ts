import { Module } from "@nestjs/common";
import { ClubService } from "./club.service";
import { ClubController } from "./club.controller";
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
  controllers: [ClubController],
  providers: [ClubService],
})
export class ClubModule {}
