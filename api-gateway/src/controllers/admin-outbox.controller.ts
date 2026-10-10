import { Body, Controller, Get, Inject, Post, Query } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import {
  ClubCmd,
  Role,
  UserCmd,
  type ListFailedOutboxRpcDto,
  type ReplayFailedOutboxRpcDto,
} from "@bookbuddy/shared";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Access } from "src/common/decorators/access.decorator";
import { sendRpc } from "src/common/rpc/send-rpc";

@ApiBearerAuth()
@ApiTags("Admin (outbox)")
@Controller("admin/outbox")
@Access(Role.ADMIN)
export class AdminOutboxController {
  constructor(
    @Inject("CLUB_SERVICE") private readonly clubClient: ClientProxy,
    @Inject("USER_SERVICE") private readonly userClient: ClientProxy,
  ) {}

  @Get("club/failed")
  @ApiOperation({ summary: "List failed club outbox rows (admin)" })
  listClubFailed(@Query("limit") limit?: number) {
    const dto: ListFailedOutboxRpcDto = {
      limit: limit !== undefined ? Number(limit) : undefined,
    };
    return sendRpc(this.clubClient, { cmd: ClubCmd.LIST_FAILED_OUTBOX }, dto);
  }

  @Post("club/replay")
  @ApiOperation({ summary: "Requeue failed club outbox rows for relay (admin)" })
  replayClubFailed(@Body() body: ReplayFailedOutboxRpcDto) {
    return sendRpc(this.clubClient, { cmd: ClubCmd.REPLAY_FAILED_OUTBOX }, body);
  }

  @Get("user/failed")
  @ApiOperation({ summary: "List failed user outbox rows (admin)" })
  listUserFailed(@Query("limit") limit?: number) {
    const dto: ListFailedOutboxRpcDto = {
      limit: limit !== undefined ? Number(limit) : undefined,
    };
    return sendRpc(this.userClient, { cmd: UserCmd.LIST_FAILED_OUTBOX }, dto);
  }

  @Post("user/replay")
  @ApiOperation({ summary: "Requeue failed user outbox rows for relay (admin)" })
  replayUserFailed(@Body() body: ReplayFailedOutboxRpcDto) {
    return sendRpc(this.userClient, { cmd: UserCmd.REPLAY_FAILED_OUTBOX }, body);
  }
}
