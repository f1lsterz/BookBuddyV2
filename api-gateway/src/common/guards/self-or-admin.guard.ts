import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AppError, Role } from "@bookbuddy/shared";
import { RequestUser } from "../types/request-user";

@Injectable()
export class SelfOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user?: RequestUser;
      params: Record<string, string>;
    }>();
    const user = request.user;
    if (!user) {
      return false;
    }
    if (user.role === Role.ADMIN) {
      return true;
    }
    const targetId = request.params.id ?? request.params.userId;
    if (targetId && targetId !== user.userId) {
      throw AppError.forbidden("You can only access your own resource");
    }
    return true;
  }
}
