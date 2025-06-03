import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { UserByIdPipe } from "src/common/pipes/NotExistById/UserByIdNot";
import { JwtAuthGuard } from "src/common/guards/jwtAuth.guard";
import { UpdateUserDto } from "./dto/updateUserDto";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAllUsers(): Promise<User[]> {
    return this.userService.findAllUsers();
  }

  @Get(":id")
  async findUserById(@Param("id", UserByIdPipe) id: number) {
    return this.userService.findUserById(id);
  }

  @Get(":email")
  async findUserByEmail(@Param("email") email: string) {
    return this.userService.findUserByEmail(email);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param("id", UserByIdPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Param("id", UserByIdPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
