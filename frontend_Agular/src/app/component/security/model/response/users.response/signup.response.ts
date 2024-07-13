import { DtoInterface } from '../../../../../shared/model';

export interface SignupResponse extends DtoInterface {
  data: {
    userId: number;
    name: string;
    firstname: string;
    email: string;
  };
}
