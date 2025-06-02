import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { EntityDoesNotExistPipe } from "./EntityById";

@Injectable()
export class BookByIdPipe extends EntityDoesNotExistPipe {
  constructor(prisma: PrismaService) {
    super(prisma, "book");
  }
}
