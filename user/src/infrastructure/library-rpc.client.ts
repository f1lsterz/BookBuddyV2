import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { LibraryCmd } from "@bookbuddy/shared";
import { lastValueFrom } from "rxjs";

@Injectable()
export class LibraryRpcClient {
  constructor(@Inject("LIBRARY_SERVICE") private readonly libraryClient: ClientProxy) {}

  provisionDefaultLibraries(userId: string) {
    return lastValueFrom(
      this.libraryClient.send({ cmd: LibraryCmd.PROVISION_DEFAULT }, userId),
    );
  }
}
