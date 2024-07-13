import { JobListings } from './jobListings.model';

export interface JobLocation {
  jobLocationId: number;
  location: string;
  jobListings: JobListings[];
}
