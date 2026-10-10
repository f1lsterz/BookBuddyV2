import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { HealthCmd, type ServiceHealthResponse } from "@bookbuddy/shared";
import { firstValueFrom } from "rxjs";
import { catchError, timeout } from "rxjs/operators";
import { of } from "rxjs";

type ServiceClient = {
  name: string;
  client: ClientProxy;
};

@Injectable()
export class MicroservicesHealthService {
  private readonly services: ServiceClient[];

  constructor(
    @Inject("AUTH_SERVICE") authClient: ClientProxy,
    @Inject("USER_SERVICE") userClient: ClientProxy,
    @Inject("BOOK_SERVICE") bookClient: ClientProxy,
    @Inject("LIBRARY_SERVICE") libraryClient: ClientProxy,
    @Inject("CLUB_SERVICE") clubClient: ClientProxy,
    @Inject("CHAT_SERVICE") chatClient: ClientProxy,
  ) {
    this.services = [
      { name: "auth", client: authClient },
      { name: "user", client: userClient },
      { name: "book", client: bookClient },
      { name: "library", client: libraryClient },
      { name: "club", client: clubClient },
      { name: "chat", client: chatClient },
    ];
  }

  async pingAll(): Promise<Record<string, ServiceHealthResponse>> {
    const entries = await Promise.all(
      this.services.map(async ({ name, client }) => {
        const result = await firstValueFrom(
          client.send<ServiceHealthResponse>({ cmd: HealthCmd.PING }, {}).pipe(
            timeout(4000),
            catchError(() =>
              of<ServiceHealthResponse>({
                ok: false,
                service: name,
                reason: "timeout or unreachable",
              }),
            ),
          ),
        );
        return [name, result] as const;
      }),
    );

    return Object.fromEntries(entries);
  }
}
