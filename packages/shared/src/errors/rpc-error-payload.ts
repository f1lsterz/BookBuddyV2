import type { ErrorCode } from "./error-codes";

/** Serializable error body sent over RabbitMQ (RpcException). */
export interface RpcErrorPayload {
  statusCode: number;
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

/** Public HTTP error JSON (no stack, no internal DB details). */
export interface ApiErrorBody {
  statusCode: number;
  code: ErrorCode;
  message: string;
  path: string;
  timestamp: string;
  details?: Record<string, unknown>;
}
