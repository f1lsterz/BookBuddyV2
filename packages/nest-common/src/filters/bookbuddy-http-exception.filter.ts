import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import {
  AppError,
  ErrorCode,
  parseRpcClientError,
  toApiErrorBody,
} from "@bookbuddy/shared";

@Catch()
export class BookbuddyHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(BookbuddyHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const payload = this.resolvePayload(exception);
    const body = toApiErrorBody(payload, request.url);

    if (payload.statusCode >= 500) {
      this.logger.error(
        `${payload.code} ${payload.statusCode} ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `${payload.code} ${payload.statusCode} ${request.method} ${request.url} — ${payload.message}`,
      );
    }

    response.status(payload.statusCode).json(body);
  }

  private resolvePayload(exception: unknown) {
    if (exception instanceof AppError) {
      return exception.toRpcPayload();
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const response = exception.getResponse();
      const isValidation =
        statusCode === 400 &&
        typeof response === "object" &&
        response !== null &&
        "message" in response &&
        Array.isArray((response as { message: unknown }).message);
      return {
        statusCode,
        code: isValidation ? ErrorCode.VALIDATION_ERROR : this.statusToCode(statusCode),
        message: this.httpMessage(response),
      };
    }

    return parseRpcClientError(exception);
  }

  private statusToCode(status: number): ErrorCode {
    if (status === 401) return ErrorCode.UNAUTHORIZED;
    if (status === 403) return ErrorCode.FORBIDDEN;
    if (status === 404) return ErrorCode.NOT_FOUND;
    if (status === 408) return ErrorCode.REQUEST_TIMEOUT;
    if (status === 409) return ErrorCode.CONFLICT;
    if (status === 503) return ErrorCode.SERVICE_UNAVAILABLE;
    if (status >= 500) return ErrorCode.INTERNAL_ERROR;
    return ErrorCode.BAD_REQUEST;
  }

  private httpMessage(response: string | object): string {
    if (typeof response === "string") return response;
    if (typeof response === "object" && response !== null && "message" in response) {
      const message = (response as { message: unknown }).message;
      if (typeof message === "string") return message;
      if (Array.isArray(message)) return message.join("; ");
    }
    return "Request failed";
  }
}
