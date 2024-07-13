import { JobListings } from './jobListings.model';
import { Users } from './user.model';

export interface JobTitle {
  jobTitleId: number;
  title: string;
  users: Users[];
  jobListings: JobListings[];
}
