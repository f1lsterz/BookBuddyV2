import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { EntityByIdPipe } from "../NotExistById/EntityById";

@Injectable()
export class ClubByIdPipe extends EntityByIdPipe {
  constructor(prisma: PrismaService) {
    super(prisma, "club");
  }
}
