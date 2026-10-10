import { ArgumentsHost, Catch, HttpException } from "@nestjs/common";
import { BaseRpcExceptionFilter, RpcException } from "@nestjs/microservices";
import { ErrorCode, toRpcErrorPayload, type RpcErrorPayload } from "@bookbuddy/shared";

@Catch()
export class BookbuddyRpcExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const payload = this.toPayload(exception);
    return super.catch(new RpcException(payload), host);
  }

  private toPayload(exception: unknown): RpcErrorPayload {
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
        code: isValidation ? ErrorCode.VALIDATION_ERROR : ErrorCode.BAD_REQUEST,
        message: this.httpMessage(response),
      };
    }
    return toRpcErrorPayload(exception);
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
