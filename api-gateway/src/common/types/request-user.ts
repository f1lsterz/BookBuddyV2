import { Role } from "@bookbuddy/shared";

export type RequestUser = {
  userId: string;
  email: string;
  role: Role;
};
