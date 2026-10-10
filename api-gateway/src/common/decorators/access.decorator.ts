import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { Role } from "@bookbuddy/shared";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard } from "../guards/role.guard";

export function Access(...roles: Role[]) {
  return applyDecorators(
    SetMetadata("roles", roles),
    UseGuards(JwtAuthGuard, RolesGuard),
  );
}
