import { Module } from "@nestjs/common";
import config from "./config/config";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TimeoutInterceptor } from "../../api-gateway/src/common/interceptors/timeout.interceptor";
import { AuthModule } from "./auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    AuthModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
  ],
})
export class AppModule {}
