import { Module } from "@nestjs/common";
import { DomainEventsListener } from "./transport/domain-events.listener";
import { DomainDlqListener } from "./transport/domain-dlq.listener";

@Module({
  controllers: [DomainEventsListener, DomainDlqListener],
})
export class AnalyticsModule {}
