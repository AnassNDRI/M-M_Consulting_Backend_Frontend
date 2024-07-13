import { JobListings } from "@prisma/client";

export interface ContractTypes {
    contractTypeId: number;
    title: string;
    jobListings: JobListings[];
  }