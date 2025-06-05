import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { UpdateUserDto } from "../../../user/src/dto/updateUserDto";
import { firstValueFrom } from "rxjs";
import { Access } from "src/common/decorators/access.decorator";

@Controller("user")
export class UserController {
  constructor(
    @Inject("USER_SERVICE") private readonly userClient: ClientProxy
  ) {}

  @Get(":id")
  @Access()
  async getUserById(@Param("id") id: string) {
    return firstValueFrom(this.userClient.send({ cmd: "get-user-by-id" }, id));
  }

  @Get("/email/:email")
  @Access()
  async getUserByEmail(@Param("email") email: string) {
    return firstValueFrom(
      this.userClient.send({ cmd: "get-user-by-email" }, email)
    );
  }

  @Patch(":id")
  @Access()
  async updateUser(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return firstValueFrom(
      this.userClient.send({ cmd: "update-user" }, { id, dto })
    );
  }

  @Delete(":id")
  @Access()
  async deleteUser(@Param("id") id: string) {
    return firstValueFrom(this.userClient.send({ cmd: "delete-user" }, id));
  }

  @Get(":id/friends")
  @Access()
  async getFriends(@Param("id") id: string) {
    return firstValueFrom(this.userClient.send({ cmd: "get-friends" }, id));
  }
}
