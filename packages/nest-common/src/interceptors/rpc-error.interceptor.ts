import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { parseRpcClientError } from "@bookbuddy/shared";

@Injectable()
export class RpcErrorInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((err: unknown) =>
        throwError(() => {
          if (err instanceof HttpException) {
            return err;
          }
          const payload = parseRpcClientError(err);
          return new HttpException(
            {
              statusCode: payload.statusCode,
              code: payload.code,
              message: payload.message,
              details: payload.details,
            },
            payload.statusCode,
          );
        }),
      ),
    );
  }
}
