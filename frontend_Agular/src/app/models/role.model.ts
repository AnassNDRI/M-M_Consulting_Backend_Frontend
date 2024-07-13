import { Users } from './user.model';

export interface Roles {
  roleId: number;
  title: string;
  users: Users[];
}
