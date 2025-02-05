import { Injectable, NotFoundException, PipeTransform } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class EntityByIdPipe implements PipeTransform<number, Promise<number>> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entity: string
  ) {}

  async transform(id: number) {
    const entity = await this.prisma[this.entity].findUnique({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException(`${this.entity} with ID ${id} not found`);
    }

    return id;
  }
}
