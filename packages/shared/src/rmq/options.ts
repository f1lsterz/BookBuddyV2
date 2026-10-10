import type { RmqQueueName } from "./queues";

export function createRmqTransportOptions(rabbitUrl: string, queue: RmqQueueName) {
  return {
    urls: [rabbitUrl],
    queue,
    queueOptions: { durable: true },
  };
}
