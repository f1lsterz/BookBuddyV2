import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

type RmqCmdPattern = { cmd: string };

/** Typed wrapper around Nest RMQ ClientProxy (eslint boundary). */
export function sendRpc<T>(
  client: ClientProxy,
  pattern: RmqCmdPattern,
  payload?: unknown,
): Promise<T> {
  /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return -- ClientProxy.send */
  return firstValueFrom(client.send<T>(pattern, payload));
  /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
}
