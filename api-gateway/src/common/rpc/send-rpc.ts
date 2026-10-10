import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

type RmqCmdPattern = { cmd: string };

export function sendRpc<T>(
  client: ClientProxy,
  pattern: RmqCmdPattern,
  payload?: unknown,
): Promise<T> {
  return firstValueFrom(client.send<T>(pattern, payload));
}
