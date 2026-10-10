import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { RedisCacheHealthService } from "@bookbuddy/nest-common";
import { HealthCmd } from "@bookbuddy/shared";

@Controller()
export class HealthListener {
  constructor(private readonly cacheHealth: RedisCacheHealthService) {}

  @MessagePattern({ cmd: HealthCmd.PING })
  ping() {
    return this.cacheHealth.ping("auth");
  }
}
