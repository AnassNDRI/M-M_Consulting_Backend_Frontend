import { JobListings } from './jobListings.model';
import { Users } from './user.model';

export interface SaveJobs {
  saveJobId: number;
  userId: number;
  jobListingId: number;
  applicationCount?: number; 
  user: Users;
  jobListing: JobListings;
}
