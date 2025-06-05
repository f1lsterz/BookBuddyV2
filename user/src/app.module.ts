import { Module } from "@nestjs/common";
import config from "./config/config";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { createKeyv } from "@keyv/redis";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TimeoutInterceptor } from "../../api-gateway/src/common/interceptors/timeout.interceptor";
import { UserModule } from "./user.module";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("config.database.url"),
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        const redis = configService.get("config.redis");
        return {
          stores: [createKeyv(`redis://${redis.host}:${redis.port}`)],
          compression: true,
        };
      },
    }),
    UserModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
  ],
})
export class AppModule {}
