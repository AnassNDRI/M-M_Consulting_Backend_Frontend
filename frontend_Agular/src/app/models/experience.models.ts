import { JobListings } from "./jobListings.model";
import { Users } from "./user.model";


export interface Experiences {
  experienceId: number;
  title: string;
  users: Users[];
  jobListings: JobListings[];
}
