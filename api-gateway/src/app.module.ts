import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import config from "./config/config";
import { UserController } from "./controllers/user.controller";
import { AuthController } from "./controllers/auth.controller";
import { BookController } from "./controllers/book.controller";
import { LibraryController } from "./controllers/library.controller";
import { ClubController } from "./controllers/club.controller";
import { ChatController } from "./controllers/chat.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
  ],
  controllers: [
    UserController,
    AuthController,
    BookController,
    LibraryController,
    ClubController,
    ChatController,
  ],
  providers: [],
})
export class AppModule {}
