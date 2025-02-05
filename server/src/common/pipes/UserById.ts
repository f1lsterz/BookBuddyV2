import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { EntityByIdPipe } from "./EntityById";

@Injectable()
export class UserByIdPipe extends EntityByIdPipe {
  constructor(prisma: PrismaService) {
    super(prisma, "user");
  }
}
