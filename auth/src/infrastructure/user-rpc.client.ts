import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CreateUserDto, UpdateUserRpcDto, UserCmd } from "@bookbuddy/shared";
import type { AuthUserRecord } from "../types/auth-user.record";
import { sendRpc } from "./send-rpc";

@Injectable()
export class UserRpcClient {
  constructor(@Inject("USER_SERVICE") private readonly userClient: ClientProxy) {}

  getByEmail(email: string): Promise<AuthUserRecord | null> {
    return sendRpc<AuthUserRecord | null>(
      this.userClient,
      { cmd: UserCmd.GET_BY_EMAIL },
      email,
    );
  }

  getById(id: string): Promise<AuthUserRecord | null> {
    return sendRpc<AuthUserRecord | null>(
      this.userClient,
      { cmd: UserCmd.GET_BY_ID },
      id,
    );
  }

  createUser(dto: CreateUserDto): Promise<AuthUserRecord> {
    return sendRpc<AuthUserRecord>(this.userClient, { cmd: UserCmd.CREATE }, dto);
  }

  updateUser(payload: UpdateUserRpcDto): Promise<AuthUserRecord> {
    return sendRpc<AuthUserRecord>(this.userClient, { cmd: UserCmd.UPDATE }, payload);
  }
}
