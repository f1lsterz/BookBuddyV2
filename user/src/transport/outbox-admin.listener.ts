import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import {
  UserCmd,
  type ListFailedOutboxRpcDto,
  type ReplayFailedOutboxRpcDto,
} from "@bookbuddy/shared";
import { DomainEventOutboxService } from "../infrastructure/domain-event-outbox.service";

@Controller()
export class OutboxAdminListener {
  constructor(private readonly outbox: DomainEventOutboxService) {}

  @MessagePattern({ cmd: UserCmd.LIST_FAILED_OUTBOX })
  listFailed(@Payload() dto: ListFailedOutboxRpcDto) {
    return this.outbox.listFailed(dto);
  }

  @MessagePattern({ cmd: UserCmd.REPLAY_FAILED_OUTBOX })
  replayFailed(@Payload() dto: ReplayFailedOutboxRpcDto) {
    return this.outbox.replayFailed(dto);
  }
}
