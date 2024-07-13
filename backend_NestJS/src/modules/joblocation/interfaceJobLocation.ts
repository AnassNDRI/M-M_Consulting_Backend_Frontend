import { JobListings } from "@prisma/client";

export interface JobLocation {
    jobLocationId: number;
    location: string;
    jobListings: JobListings[];
  }