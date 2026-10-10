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
  Query,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { sendRpc } from "src/common/rpc/send-rpc";
import {
  AddClubMemberDto,
  ClubCmd,
  CreateClubBodyDto,
  CreateClubRpcDto,
  SearchClubsDto,
  UpdateClubDto,
  UpdateClubRpcDto,
} from "@bookbuddy/shared";
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerStorage } from "src/config/multer.config";
import { Public } from "../common/decorators/public.decorator";
import { CurrentUser } from "../common/decorators/current.user.decorator";
import { RequestUser } from "../common/types/request-user";
import {
  AddClubMemberApiDto,
  CreateClubMultipartApiDto,
  UpdateClubApiDto,
} from "../dto/swagger/club.swagger";

@ApiBearerAuth()
@ApiTags("Clubs (Proxy)")
@Controller("club")
export class ClubController {
  constructor(@Inject("CLUB_SERVICE") private readonly clubClient: ClientProxy) {}

  @Post()
  @UseInterceptors(FileInterceptor("imageFile", { storage: multerStorage }))
  @ApiConsumes("multipart/form-data")
  @ApiBody({ type: CreateClubMultipartApiDto })
  async createBookClub(
    @Body() body: CreateClubBodyDto,
    @CurrentUser() user: RequestUser,
    @UploadedFile() imageFile?: Express.Multer.File,
  ) {
    const payload: CreateClubRpcDto = {
      name: body.name,
      description: body.description,
      userId: user.userId,
      imageFile: imageFile ? { filename: imageFile.filename } : undefined,
    };
    return sendRpc<unknown>(this.clubClient, { cmd: ClubCmd.CREATE }, payload);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: "Get all clubs" })
  async getAllClubs() {
    return sendRpc<unknown>(this.clubClient, { cmd: ClubCmd.GET_ALL }, {});
  }

  @Public()
  @Get("search")
  @ApiOperation({ summary: "Search clubs" })
  async searchClubs(@Query() payload: SearchClubsDto) {
    return sendRpc<unknown>(this.clubClient, { cmd: ClubCmd.SEARCH }, payload);
  }

  @Get("me/in-any")
  @ApiOperation({ summary: "Check if I am in any club" })
  async isUserInAnyClub(@CurrentUser() user: RequestUser) {
    return sendRpc<unknown>(
      this.clubClient,
      { cmd: ClubCmd.IS_USER_IN_ANY_CLUB },
      user.userId,
    );
  }

  @Public()
  @Get(":id")
  @ApiOperation({ summary: "Get club by ID" })
  @ApiParam({ name: "id", required: true, description: "Club ID" })
  async getClub(@Param("id") id: string) {
    return sendRpc<unknown>(this.clubClient, { cmd: ClubCmd.GET }, id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update book club" })
  @ApiBody({ type: UpdateClubApiDto })
  async updateBookClub(
    @Param("id") clubId: string,
    @Body() payload: UpdateClubDto,
    @CurrentUser() user: RequestUser,
  ) {
    const rpc: UpdateClubRpcDto = { clubId, actorId: user.userId, ...payload };
    return sendRpc<unknown>(this.clubClient, { cmd: ClubCmd.UPDATE }, rpc);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete book club" })
  async deleteBookClub(@Param("id") clubId: string, @CurrentUser() user: RequestUser) {
    return sendRpc<unknown>(
      this.clubClient,
      { cmd: ClubCmd.DELETE },
      { clubId, actorId: user.userId },
    );
  }

  @Post(":id/members")
  @ApiOperation({ summary: "Add member to club" })
  @ApiBody({ type: AddClubMemberApiDto })
  async addMember(
    @Param("id") clubId: string,
    @Body() body: AddClubMemberDto,
    @CurrentUser() user: RequestUser,
  ) {
    return sendRpc<unknown>(
      this.clubClient,
      { cmd: ClubCmd.ADD_MEMBER },
      { clubId, userId: body.userId, actorId: user.userId },
    );
  }

  @Delete(":id/members/:userId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove member from club" })
  async removeMember(
    @Param("id") clubId: string,
    @Param("userId") userId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return sendRpc<unknown>(
      this.clubClient,
      { cmd: ClubCmd.REMOVE_MEMBER },
      { clubId, userId, actorId: user.userId },
    );
  }

  @Post(":id/leave")
  @ApiOperation({ summary: "Leave from club" })
  async leaveFromClub(@Param("id") clubId: string, @CurrentUser() user: RequestUser) {
    return sendRpc<unknown>(
      this.clubClient,
      { cmd: ClubCmd.LEAVE },
      { clubId, userId: user.userId },
    );
  }

  @Get(":id/is-member/me")
  @ApiOperation({ summary: "Check if I am in club" })
  async isUserInClub(@Param("id") clubId: string, @CurrentUser() user: RequestUser) {
    return sendRpc<unknown>(
      this.clubClient,
      { cmd: ClubCmd.IS_USER_IN_CLUB },
      { userId: user.userId, clubId },
    );
  }
}
