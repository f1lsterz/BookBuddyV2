import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ApiError } from "../errors/apiError";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let errorType: string;

    if (exception instanceof ApiError) {
      status = exception.status;
      message = exception.message;
      errorType = "ApiError";
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseMessage = exception.getResponse();
      message =
        typeof responseMessage === "string"
          ? responseMessage
          : (responseMessage as any).message || "Unexpected error";
      errorType = "HttpException";
    } else if (
      exception instanceof Error &&
      exception.name === "MongoServerError"
    ) {
      // Наприклад, дублікат унікального поля
      status = HttpStatus.BAD_REQUEST;
      message = `MongoDB error: ${exception.message}`;
      errorType = "MongoServerError";
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = "Internal server error";
      errorType = "UnknownError";
    }

    this.logger.error(
      `[${errorType}] ${status} - ${message} - ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : ""
    );

    response.status(status).json({
      statusCode: status,
      errorType,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
