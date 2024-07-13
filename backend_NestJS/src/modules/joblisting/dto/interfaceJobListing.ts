import { JobApplications, SaveJobs, Users, ContractTypes, JobLocation, JobTitle } from "@prisma/client";

export interface JobListings {
    jobListingId: number;
    jobLocationId: number;
    jobTitleId: number;
    description?: string;
    workingHours: number;
    workingHoursStart: string;
    workingHoursEnd: string;
    startDate: Date;
    salary: number;
    validate?: boolean;
    deadline: Date;
    userId: number;
    contractTypeId: number;
    jobApplications: JobApplications[];
    savedJob: SaveJobs[];
    user: Users;
    contractType: ContractTypes;
    jobLocation: JobLocation;
    jobTitle: JobTitle;
  }
  