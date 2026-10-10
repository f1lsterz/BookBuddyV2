export const RmqQueue = {
  AUTH: "auth_queue",
  USER: "user_queue",
  USER_EVENTS: "user_events_queue",
  ANALYTICS_EVENTS: "analytics_events_queue",
  BOOK: "book_queue",
  LIBRARY: "library_queue",
  CLUB: "club_queue",
  CHAT: "chat_queue",
} as const;

export type RmqQueueName = (typeof RmqQueue)[keyof typeof RmqQueue];

const serviceQueueMap: Record<string, RmqQueueName> = {
  AUTH_SERVICE: RmqQueue.AUTH,
  USER_SERVICE: RmqQueue.USER,
  BOOK_SERVICE: RmqQueue.BOOK,
  LIBRARY_SERVICE: RmqQueue.LIBRARY,
  CLUB_SERVICE: RmqQueue.CLUB,
  CHAT_SERVICE: RmqQueue.CHAT,
};

export function queueForClientName(clientName: string): RmqQueueName {
  const queue = serviceQueueMap[clientName];
  if (!queue) {
    throw new Error(`Unknown RMQ client name: ${clientName}`);
  }
  return queue;
}

export function resolveRmqQueue(
  configured: string | undefined,
  fallback: RmqQueueName,
): RmqQueueName {
  if (!configured) {
    return fallback;
  }
  const known = Object.values(RmqQueue) as string[];
  if (known.includes(configured)) {
    return configured as RmqQueueName;
  }
  return fallback;
}
