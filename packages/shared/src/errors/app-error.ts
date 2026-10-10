import { ErrorCode } from "./error-codes";
import type { RpcErrorPayload } from "./rpc-error-payload";

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(options: {
    statusCode: number;
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  }) {
    super(options.message);
    this.name = "AppError";
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
  }

  toRpcPayload(): RpcErrorPayload {
    return {
      statusCode: this.statusCode,
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }

  static badRequest(message: string, details?: Record<string, unknown>): AppError {
    return new AppError({
      statusCode: 400,
      code: ErrorCode.BAD_REQUEST,
      message,
      details,
    });
  }

  static unauthorized(message = "Unauthorized"): AppError {
    return new AppError({
      statusCode: 401,
      code: ErrorCode.UNAUTHORIZED,
      message,
    });
  }

  static forbidden(message = "Forbidden"): AppError {
    return new AppError({
      statusCode: 403,
      code: ErrorCode.FORBIDDEN,
      message,
    });
  }

  static notFound(message = "Not found"): AppError {
    return new AppError({
      statusCode: 404,
      code: ErrorCode.NOT_FOUND,
      message,
    });
  }

  static conflict(message: string): AppError {
    return new AppError({
      statusCode: 409,
      code: ErrorCode.CONFLICT,
      message,
    });
  }

  static requestTimeout(message = "Request timeout"): AppError {
    return new AppError({
      statusCode: 408,
      code: ErrorCode.REQUEST_TIMEOUT,
      message,
    });
  }

  static internal(message = "Internal server error"): AppError {
    return new AppError({
      statusCode: 500,
      code: ErrorCode.INTERNAL_ERROR,
      message,
    });
  }
}
