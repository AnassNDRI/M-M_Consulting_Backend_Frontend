import { DtoInterface } from '../../../../../shared/model';

export interface SaveJobResponse extends DtoInterface {
  data: {
    saveJobId: number;
    userId: number;
    jobListingId: number;
  };
}
