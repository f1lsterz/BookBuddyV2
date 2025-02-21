import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { EntityByIdNotPipe } from "./EntityByIdNot";

@Injectable()
export class ClubByIdNotPipe extends EntityByIdNotPipe {
  constructor(prisma: PrismaService) {
    super(prisma, "club");
  }
}
