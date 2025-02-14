import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { CreateUserDto } from "./dto/createUserDto";
import { UpdateUserDto } from "./dto/updateUserDto";
import { User } from "@prisma/client";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async findUserById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    if (!email) {
      throw new BadRequestException("Email is required");
    }

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async findAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!users) {
      throw new InternalServerErrorException("Error fetching all users");
    }

    return users;
  }

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto;

    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new BadRequestException("User with this email already exists");
    }

    const user = await this.prisma.user.create({
      data: { email, password, name },
    });

    if (!user) {
      throw new InternalServerErrorException("Error creating user");
    }

    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findUserById(id);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const { name, photoUrl } = updateUserDto;

    return await this.prisma.user.update({
      where: { id },
      data: { name, photoUrl },
    });
  }

  async deleteUser(id: number) {
    await this.findUserById(id);

    return await this.prisma.user.delete({ where: { id } });
  }
}
