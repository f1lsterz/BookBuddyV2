import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { EntityByIdNotPipe } from "./EntityByIdNot";

@Injectable()
export class UserByIdPipe extends EntityByIdNotPipe {
  constructor(prisma: PrismaService) {
    super(prisma, "user");
  }
}
