import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { BookCmd } from "@bookbuddy/shared";
import { firstValueFrom } from "rxjs";

@Injectable()
export class BookCatalogClient {
  constructor(@Inject("BOOK_SERVICE") private readonly bookClient: ClientProxy) {}

  async getBookById(bookId: string): Promise<unknown> {
    return firstValueFrom(this.bookClient.send({ cmd: BookCmd.GET_BY_ID }, bookId));
  }
}
