import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  ClubCmd,
  type ListFailedOutboxRpcDto,
  type ReplayFailedOutboxRpcDto,
} from "@bookbuddy/shared";
import { DomainEventOutboxService } from "../infrastructure/domain-event-outbox.service";

@Controller()
export class OutboxAdminListener {
  constructor(private readonly outbox: DomainEventOutboxService) {}

  @MessagePattern({ cmd: ClubCmd.LIST_FAILED_OUTBOX })
  listFailed(@Payload() dto: ListFailedOutboxRpcDto) {
    return this.outbox.listFailed(dto);
  }

  @MessagePattern({ cmd: ClubCmd.REPLAY_FAILED_OUTBOX })
  replayFailed(@Payload() dto: ReplayFailedOutboxRpcDto) {
    return this.outbox.replayFailed(dto);
  }
}
