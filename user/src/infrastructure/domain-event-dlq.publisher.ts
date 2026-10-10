import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import {
  OUTBOX_DEAD_LETTER_ROUTING_KEY,
  type OutboxDeadLetterPayload,
} from "@bookbuddy/shared";

@Injectable()
export class DomainEventDlqPublisher {
  constructor(@Inject("DOMAIN_DLQ_BUS") private readonly dlqBus: ClientProxy) {}

  publishOutboxDeadLetter(payload: OutboxDeadLetterPayload): void {
    this.dlqBus.emit(OUTBOX_DEAD_LETTER_ROUTING_KEY, payload);
  }
}
