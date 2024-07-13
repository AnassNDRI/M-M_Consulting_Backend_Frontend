import { JobListings } from '../../../../../models';
import { DtoInterface } from '../../../../../shared/model';

export interface JoblistingResponse extends DtoInterface {
  data: {
    count: number;
    jobListings: JobListings[]; // La liste des emplois correspondants
  };
}
