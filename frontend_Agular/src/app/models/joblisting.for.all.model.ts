import { ContractTypes } from "./contractTypes.model";
import { JobApplications } from "./jobApplications.model";
import { JobLocation } from "./jobLocation.model";
import { JobTitle } from "./jobTitle.model";
import { SaveJobs } from "./saveJobs.model";
import { Users } from "./user.model";

export interface JobListingForAll {
  jobListingId: number;
  description?: string;
  workingHours: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  startDate?: Date;
  salary?: number;
  deadline: Date;
  publicationDate?: Date;
  user: Users;
  contractType: ContractTypes;
  jobLocation: JobLocation;
  jobTitle: JobTitle;
}