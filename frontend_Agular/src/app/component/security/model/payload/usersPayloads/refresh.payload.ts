import { PayloadInterface } from "../../../../../shared/model";


export interface RefreshPayload extends PayloadInterface {
  refreshToken: string;
}
