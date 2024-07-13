import { Users } from "@prisma/client";

export interface Roles {
  roleId: number;
  title: string;
  users: Users[];
}