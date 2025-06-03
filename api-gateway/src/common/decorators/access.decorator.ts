import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../guards/jwtAuth.guard";
import { RolesGuard } from "../guards/role.guard";

export function Access(...roles: string[]) {
  return applyDecorators(
    SetMetadata("roles", roles),
    UseGuards(JwtAuthGuard, RolesGuard),
  );
}
