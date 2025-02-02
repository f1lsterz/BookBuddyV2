import { Module } from "@nestjs/common";
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ClubModule } from './club/club.module';
import { BookModule } from './book/book.module';
import { LibraryModule } from './library/library.module';

@Module({
  imports: [AuthModule, UserModule, ClubModule, BookModule, LibraryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
