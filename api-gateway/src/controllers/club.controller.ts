import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  HttpStatus,
  HttpCode,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerStorage } from "src/config/multer.config";

@ApiTags("Clubs (Proxy)")
@Controller("club")
export class ClubController {
  constructor(
    @Inject("CLUB_SERVICE") private readonly clubClient: ClientProxy
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor("imageFile", { storage: multerStorage }))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        userId: { type: "string" },
        imageFile: {
          type: "string",
          format: "binary",
          nullable: true,
        },
      },
    },
  })
  async createBookClub(
    @Body() body: { name: string; description: string; userId: string },
    @UploadedFile() imageFile?: Express.Multer.File
  ) {
    return firstValueFrom(
      this.clubClient.send({ cmd: "create-book-club" }, { ...body, imageFile })
    );
  }

  @Get()
  @ApiOperation({ summary: "Get all clubs" })
  @ApiResponse({ status: HttpStatus.OK, description: "List of clubs" })
  async getAllClubs() {
    return firstValueFrom(this.clubClient.send({ cmd: "get-all-clubs" }, {}));
  }

  @Get("search")
  @ApiOperation({ summary: "Search clubs" })
  async searchClubs(@Body() payload: { query?: string; filterFull?: boolean }) {
    return firstValueFrom(
      this.clubClient.send({ cmd: "search-clubs" }, payload)
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get club by ID" })
  @ApiParam({ name: "id", required: true, description: "Club ID" })
  @ApiResponse({ status: HttpStatus.OK, description: "Club found" })
  async getClub(@Param("id") id: string) {
    return firstValueFrom(this.clubClient.send({ cmd: "get-club" }, id));
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update book club" })
  @ApiParam({ name: "id", required: true, description: "Club ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        name: { type: "string", nullable: true },
        description: { type: "string", nullable: true },
        imageFile: { type: "string", nullable: true },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: "Book club updated" })
  async updateBookClub(
    @Param("id") clubId: string,
    @Body()
    payload: {
      name?: string;
      description?: string;
      imageFile?: any;
    }
  ) {
    return firstValueFrom(
      this.clubClient.send({ cmd: "update-book-club" }, { clubId, ...payload })
    );
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete book club" })
  @ApiParam({ name: "id", required: true, description: "Club ID" })
  async deleteBookClub(@Param("id") clubId: string) {
    return firstValueFrom(
      this.clubClient.send({ cmd: "delete-book-club" }, clubId)
    );
  }

  @Post(":id/members")
  @ApiOperation({ summary: "Add member to club" })
  @ApiParam({ name: "id", description: "Club ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        userId: { type: "string" },
      },
      required: ["userId"],
    },
  })
  async addMember(
    @Param("id") clubId: string,
    @Body() body: { userId: string }
  ) {
    return firstValueFrom(
      this.clubClient.send(
        { cmd: "add-member" },
        { clubId, userId: body.userId }
      )
    );
  }

  @Delete(":id/members/:userId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove member from club" })
  @ApiParam({ name: "id", description: "Club ID" })
  @ApiParam({ name: "userId", description: "User ID" })
  async removeMember(
    @Param("id") clubId: string,
    @Param("userId") userId: string
  ) {
    return firstValueFrom(
      this.clubClient.send(
        { cmd: "remove-member-from-club" },
        { clubId, userId }
      )
    );
  }

  @Post(":id/leave")
  @ApiOperation({ summary: "Leave from club" })
  @ApiParam({ name: "id", description: "Club ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        userId: { type: "string" },
      },
      required: ["userId"],
    },
  })
  async leaveFromClub(
    @Param("id") clubId: string,
    @Body() body: { userId: string }
  ) {
    return firstValueFrom(
      this.clubClient.send(
        { cmd: "leave-from-club" },
        { clubId, userId: body.userId }
      )
    );
  }

  @Get(":id/is-member/:userId")
  @ApiOperation({ summary: "Check if user is in club" })
  @ApiParam({ name: "id", description: "Club ID" })
  @ApiParam({ name: "userId", description: "User ID" })
  async isUserInClub(
    @Param("id") clubId: string,
    @Param("userId") userId: string
  ) {
    return firstValueFrom(
      this.clubClient.send({ cmd: "is-user-in-club" }, { userId, clubId })
    );
  }

  @Get("user/:userId/in-any")
  @ApiOperation({ summary: "Check if user is in any club" })
  @ApiParam({ name: "userId", description: "User ID" })
  async isUserInAnyClub(@Param("userId") userId: string) {
    return firstValueFrom(
      this.clubClient.send({ cmd: "is-user-in-any-club" }, userId)
    );
  }
}
