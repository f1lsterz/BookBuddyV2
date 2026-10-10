import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { HealthCmd, type ServiceHealthResponse } from "@bookbuddy/shared";

@Controller()
export class HealthListener {
  @MessagePattern({ cmd: HealthCmd.PING })
  ping(): ServiceHealthResponse {
    return { ok: true, service: "analytics" };
  }
}
