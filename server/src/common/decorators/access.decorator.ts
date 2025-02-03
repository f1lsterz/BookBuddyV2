import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";

export function Access(...roles: string[]) {
  return applyDecorators(
    SetMetadata("roles", roles),
    UseGuards(JwtAuthGuard, RolesGuard)
  );
}
