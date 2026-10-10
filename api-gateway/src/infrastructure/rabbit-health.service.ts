import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { connect } from "amqplib";
import config from "src/config/config";

@Injectable()
export class RabbitHealthService {
  constructor(
    @Inject(config.KEY) private readonly configService: ConfigType<typeof config>,
  ) {}

  async ping(): Promise<{ ok: true } | { ok: false; reason: string }> {
    const url = this.configService.rabbitmq.url;
    if (!url) {
      return { ok: false, reason: "RABBITMQ_URL is not set" };
    }
    try {
      const connection = await connect(url);
      await connection.close();
      return { ok: true };
    } catch {
      return { ok: false, reason: "Cannot connect to RabbitMQ" };
    }
  }
}
