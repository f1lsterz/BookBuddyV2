export type ListFailedOutboxRpcDto = {
  limit?: number;
};

export type ReplayFailedOutboxRpcDto = {
  ids?: string[];
};

export type ReplayFailedOutboxResult = {
  requeued: number;
};

export type FailedOutboxEntryDto = {
  id: string;
  eventId: string;
  pattern: string;
  attempts: number;
  lastError?: string;
  createdAt: string;
};
