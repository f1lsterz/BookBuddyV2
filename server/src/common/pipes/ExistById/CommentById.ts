import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { EntityDoesNotExistPipe } from "../ExistById/EntityById";

@Injectable()
export class CommentByIdPipe extends EntityDoesNotExistPipe {
  constructor(prisma: PrismaService) {
    super(prisma, "comment");
  }
}
