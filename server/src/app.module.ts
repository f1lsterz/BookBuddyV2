import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { ClubModule } from "./club/club.module";
import { BookModule } from "./book/book.module";
import { LibraryModule } from "./library/library.module";
import config from "./config/config";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    ClubModule,
    BookModule,
    LibraryModule,
  ],
})
export class AppModule {}
