import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, throwError, TimeoutError } from "rxjs";
import { timeout, catchError } from "rxjs/operators";
import { ApiError } from "../errors/apiError";
import { NO_TIMEOUT_KEY } from "../decorators/no.timeout.decorator";
import { Reflector } from "@nestjs/core";

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const noTimeout = this.reflector.getAllAndOverride<boolean>(
      NO_TIMEOUT_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (noTimeout) {
      return next.handle();
    }

    return next.handle().pipe(
      timeout(10000),
      catchError((err) =>
        throwError(() =>
          err instanceof TimeoutError
            ? ApiError.RequestTimeout("Operation timed out after 10s")
            : err
        )
      )
    );
  }
}
