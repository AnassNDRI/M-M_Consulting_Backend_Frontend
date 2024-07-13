import { JobListings, Users } from "@prisma/client";

export interface JobTitle {
  jobTitleId: number;
  title: string;
  users?: Users[];
  jobListings?: JobListings[];

}

