import { AppError } from "./app-error";
import { ErrorCode } from "./error-codes";
import type { ApiErrorBody, RpcErrorPayload } from "./rpc-error-payload";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRpcErrorPayload(value: unknown): value is RpcErrorPayload {
  if (!isRecord(value)) return false;
  return (
    typeof value.statusCode === "number" &&
    typeof value.code === "string" &&
    typeof value.message === "string"
  );
}

function httpStatusToDefaultCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ErrorCode.BAD_REQUEST;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 408:
      return ErrorCode.REQUEST_TIMEOUT;
    case 409:
      return ErrorCode.CONFLICT;
    case 503:
      return ErrorCode.SERVICE_UNAVAILABLE;
    default:
      return status >= 500 ? ErrorCode.INTERNAL_ERROR : ErrorCode.BAD_REQUEST;
  }
}

function extractValidationMessage(response: unknown): string {
  if (typeof response === "string") return response;
  if (!isRecord(response)) return "Validation failed";
  const message = response.message;
  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.join("; ");
  return "Validation failed";
}

function mongoErrorToPayload(exception: Error): RpcErrorPayload | null {
  if (exception.name !== "MongoServerError" && exception.name !== "MongoError") {
    return null;
  }
  const code = (exception as Error & { code?: number }).code;
  if (code === 11000) {
    return {
      statusCode: 409,
      code: ErrorCode.CONFLICT,
      message: "Resource already exists",
    };
  }
  return {
    statusCode: 400,
    code: ErrorCode.BAD_REQUEST,
    message: "Invalid data",
  };
}

/** Map any thrown value to a safe RPC payload (microservice → gateway). */
export function toRpcErrorPayload(exception: unknown): RpcErrorPayload {
  if (exception instanceof AppError) {
    return exception.toRpcPayload();
  }

  const mongo = exception instanceof Error ? mongoErrorToPayload(exception) : null;
  if (mongo) return mongo;

  if (isRecord(exception) && typeof exception.statusCode === "number") {
    const statusCode = exception.statusCode;
    const message =
      typeof exception.message === "string"
        ? exception.message
        : extractValidationMessage(exception);
    const code =
      typeof exception.code === "string"
        ? (exception.code as ErrorCode)
        : httpStatusToDefaultCode(statusCode);
    return {
      statusCode,
      code,
      message,
      details: isRecord(exception.details) ? exception.details : undefined,
    };
  }

  if (exception instanceof Error) {
    return {
      statusCode: 500,
      code: ErrorCode.INTERNAL_ERROR,
      message: "Internal server error",
    };
  }

  return {
    statusCode: 500,
    code: ErrorCode.INTERNAL_ERROR,
    message: "Internal server error",
  };
}

/** Parse error returned by ClientProxy / firstValueFrom on the gateway. */
export function parseRpcClientError(exception: unknown): RpcErrorPayload {
  if (exception instanceof AppError) {
    return exception.toRpcPayload();
  }

  if (isRecord(exception)) {
    const nested = exception.message;
    if (isRpcErrorPayload(nested)) return nested;
    if (typeof nested === "string") {
      try {
        const parsed: unknown = JSON.parse(nested);
        if (isRpcErrorPayload(parsed)) return parsed;
      } catch {
        return {
          statusCode: 500,
          code: ErrorCode.INTERNAL_ERROR,
          message: nested,
        };
      }
    }
    if (isRpcErrorPayload(exception)) return exception;
  }

  return toRpcErrorPayload(exception);
}

export function toApiErrorBody(payload: RpcErrorPayload, path: string): ApiErrorBody {
  return {
    statusCode: payload.statusCode,
    code: payload.code,
    message: payload.message,
    path,
    timestamp: new Date().toISOString(),
    details: payload.details,
  };
}
