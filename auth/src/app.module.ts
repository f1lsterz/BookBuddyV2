import { Module } from "@nestjs/common";
import { AuthModule } from "./auth.module";
import config from "./config/config";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    AuthModule,
  ],
})
export class AppModule {}
