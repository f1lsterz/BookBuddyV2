import { Module } from "@nestjs/common";
import config from "./config/config";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { createKeyv } from "@keyv/redis";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TimeoutInterceptor } from "@bookbuddy/nest-common";
import { ClubModule } from "./club.module";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("config.database.url"),
      }),
      inject: [ConfigService],
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
    ClubModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
  ],
})
export class AppModule {}
