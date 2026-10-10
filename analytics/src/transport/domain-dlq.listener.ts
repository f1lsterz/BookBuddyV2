import { Controller, Logger } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import {
  OUTBOX_DEAD_LETTER_ROUTING_KEY,
  type OutboxDeadLetterPayload,
} from "@bookbuddy/shared";

@Controller()
export class DomainDlqListener {
  private readonly logger = new Logger(DomainDlqListener.name);

  @EventPattern(OUTBOX_DEAD_LETTER_ROUTING_KEY)
  onOutboxDeadLetter(@Payload() payload: OutboxDeadLetterPayload): void {
    this.logger.warn(
      JSON.stringify({
        dlq: true,
        kind: "outbox-dead-letter",
        ...payload,
      }),
    );
  }

  @EventPattern("consumer.failed")
  onConsumerFailed(@Payload() payload: unknown): void {
    this.logger.warn(
      JSON.stringify({
        dlq: true,
        kind: "consumer-failed",
        payload,
      }),
    );
  }
}
