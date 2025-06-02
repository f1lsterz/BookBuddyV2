import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { EntityByIdNotPipe } from "./EntityByIdNot";

@Injectable()
export class LibraryByIdNotPipe extends EntityByIdNotPipe {
  constructor(prisma: PrismaService) {
    super(prisma, "library");
  }
}
