import { Module } from "@nestjs/common";
import config from "./config/config";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TimeoutInterceptor } from "@bookbuddy/nest-common";
import { AuthModule } from "./auth.module";
import { CacheModule } from "@nestjs/cache-manager";
import { createKeyv } from "@keyv/redis";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        const redis = configService.get<{ host: string; port: string }>("config.redis");
        const host = redis?.host ?? "localhost";
        const port = redis?.port ?? "6379";
        return {
          stores: [createKeyv(`redis://${host}:${port}`)],
          compression: true,
        };
      },
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
