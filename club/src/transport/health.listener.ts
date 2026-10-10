import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { MongoHealthService } from "@bookbuddy/nest-common";
import { HealthCmd } from "@bookbuddy/shared";

@Controller()
export class HealthListener {
  constructor(private readonly mongoHealth: MongoHealthService) {}

  @MessagePattern({ cmd: HealthCmd.PING })
  ping() {
    return this.mongoHealth.ping("club");
  }
}
