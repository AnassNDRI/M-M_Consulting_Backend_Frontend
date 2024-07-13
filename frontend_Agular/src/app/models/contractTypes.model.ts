import { JobListings } from './jobListings.model';

export interface ContractTypes {
  contractTypeId: number;
  title: string;
  jobListings: JobListings[];
}
