import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import config from "./config/config";
import { AnalyticsModule } from "./analytics.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    AnalyticsModule,
  ],
})
export class AppModule {}
