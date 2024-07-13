import { PayloadInterface } from "../../../../../shared/model";



export interface SigninPayload extends PayloadInterface {
  email: string;
  password: string;
}
