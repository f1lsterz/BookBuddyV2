import type { RmqQueueName } from "./queues";
import { DOMAIN_EVENT_DLX, DOMAIN_EVENTS_DLQ } from "./domain-dlq";
import { DOMAIN_EVENT_EXCHANGE } from "./domain-events";

/** Nest RMQ client: publish events to the domain topic exchange. */
export function createRmqDomainEventPublisherOptions(rabbitUrl: string) {
  return {
    urls: [rabbitUrl],
    queue: "domain_event_publisher",
    queueOptions: {
      autoDelete: true,
      durable: false,
    },
    exchange: DOMAIN_EVENT_EXCHANGE,
    exchangeType: "topic",
  };
}

/** Nest RMQ microservice: durable queue bound to domain events (routing key `#` = all topics). */
export function createRmqDomainEventSubscriberOptions(
  rabbitUrl: string,
  eventsQueue: RmqQueueName,
) {
  return {
    urls: [rabbitUrl],
    queue: eventsQueue,
    queueOptions: {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": DOMAIN_EVENT_DLX,
        "x-dead-letter-routing-key": "consumer.failed",
      },
    },
    exchange: DOMAIN_EVENT_EXCHANGE,
    exchangeType: "topic",
    wildcards: true,
    routingKey: "#",
  };
}

/** Nest RMQ client: publish dead-letter envelopes to the DLX. */
export function createRmqDomainDlqPublisherOptions(rabbitUrl: string) {
  return {
    urls: [rabbitUrl],
    queue: "domain_dlq_publisher",
    queueOptions: {
      autoDelete: true,
      durable: false,
    },
    exchange: DOMAIN_EVENT_DLX,
    exchangeType: "topic",
  };
}

/** Subscribe to all messages on the domain DLX (ops / analytics). */
export function createRmqDomainDlqSubscriberOptions(
  rabbitUrl: string,
  queueName: string,
) {
  return {
    urls: [rabbitUrl],
    queue: queueName,
    queueOptions: { durable: true },
    exchange: DOMAIN_EVENT_DLX,
    exchangeType: "topic",
    wildcards: true,
    routingKey: "#",
  };
}

export { DOMAIN_EVENTS_DLQ };
