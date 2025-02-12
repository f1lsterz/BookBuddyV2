import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import config from "src/config/config";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class LibraryService {
  constructor(
    @Inject(config.KEY) private configService: ConfigType<typeof config>,
    private readonly userService: UserService,
    private readonly prisma: PrismaService
  ) {}

  async getLibrary(userId: number): Promise<Library> {
    return this.prisma.library.findUnique({ where: { id: userId } });
  }

  async createCustomLibrary(
    userId: number,
    customName: string,
    visibility: LibraryVisibility
  ): Promise<Library> {
    return this.prisma.library.create({
      userId,
      customName,
      visibility,
      status: "Custom",
    });
  }

  async deleteCustomLibrary(userId: number, libraryId: number): Promise<void> {
    const customLibrary = await
  }

  async getBooksInLibrary(userId: number, listId: number): Promise<Book[]> {}

  async addBookToLibrary(bookId: number, libraryId: number): Promise<void> {}

  async removeBookFromLibrary(
    bookId: number,
    libraryId: number
  ): Promise<void> {}

  async checkBookInLibrary(
    bookId: number,
    libraryId: number
  ): Promise<boolean> {}

  async updateLibraryVisibility(
    userId: number,
    libraryId: number,
    visibility: LibraryVisibility
  ): Promise<Library> {
    const library = await this.prisma.library.findUnique({where: {id: libraryId, userId}})
  }
}
