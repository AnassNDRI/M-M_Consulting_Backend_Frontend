import { Users, JobListings } from "@prisma/client";

export interface SaveJobs {
    saveJobId: number;
    userId: number;
    jobListingId: number;
    user: Users;
    jobListing: JobListings;
  }