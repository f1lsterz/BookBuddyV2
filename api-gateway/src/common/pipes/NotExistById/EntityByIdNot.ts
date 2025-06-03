import { Injectable, PipeTransform } from "@nestjs/common";
import { ApiError } from "src/common/errors/apiError";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class EntityByIdNotPipe
  implements PipeTransform<number, Promise<number>>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly entity: string
  ) {}

  async transform(id: number) {
    const entity = await this.prisma[this.entity].findUnique({
      where: { id },
    });

    if (!entity) {
      throw ApiError.NotFound(`${this.entity} with ID ${id} not found`);
    }

    return id;
  }
}
