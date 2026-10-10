import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, throwError, TimeoutError } from "rxjs";
import { catchError, timeout } from "rxjs/operators";
import { NO_TIMEOUT_KEY } from "../decorators/no-timeout.decorator";

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const noTimeout = this.reflector.getAllAndOverride<boolean>(NO_TIMEOUT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (noTimeout) {
      return next.handle();
    }

    return next.handle().pipe(
      timeout(10000),
      catchError((err: unknown) =>
        throwError(() =>
          err instanceof TimeoutError
            ? new RequestTimeoutException("Operation timed out after 10s")
            : err,
        ),
      ),
    );
  }
}
