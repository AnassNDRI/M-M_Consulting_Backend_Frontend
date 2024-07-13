import { PayloadInterface } from '../../../../../shared/model';

export interface saveJobPayload extends PayloadInterface {
  jobListingId?: number;
  userId?: number;
}
