import { Controller, Get, HttpStatus, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { Public } from "../common/decorators/public.decorator";
import { RabbitHealthService } from "../infrastructure/rabbit-health.service";
import { MicroservicesHealthService } from "../infrastructure/microservices-health.service";

@Public()
@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly rabbitHealth: RabbitHealthService,
    private readonly microservicesHealth: MicroservicesHealthService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Liveness probe" })
  liveness() {
    return {
      status: "ok",
      service: "api-gateway",
      timestamp: new Date().toISOString(),
    };
  }

  @Get("ready")
  @ApiOperation({ summary: "Readiness (RabbitMQ + microservices)" })
  async readiness(@Res() res: Response) {
    const [rabbit, services] = await Promise.all([
      this.rabbitHealth.ping(),
      this.microservicesHealth.pingAll(),
    ]);

    const servicesOk = Object.values(services).every((s) => s.ok);
    const ready = rabbit.ok && servicesOk;

    const body = {
      status: ready ? "ready" : "degraded",
      service: "api-gateway",
      checks: { rabbitmq: rabbit, services },
      timestamp: new Date().toISOString(),
    };
    res.status(ready ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).json(body);
  }
}
