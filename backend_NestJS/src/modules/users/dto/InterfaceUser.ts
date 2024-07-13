import { JobApplications, JobListings, SaveJobs, Appointment, Roles, JobTitle } from "@prisma/client";

export interface Users {
  userId: number;
  name: string;
  firstname: string;
  dateBirth: Date;
  sex?: string;
  phoneNumber?: string;
  email: string;
  password: string;
  jobTitleId?: number;
  cv?: string;
  address?: string;
  nameCompany?: string;
  addressCompany?: string;
  actif?: boolean;
  refreshToken?: string;
  tokenVersion?: string;
  notification?: boolean;
  confirmationMailToken?:   string;           
  confirmationMailTokenExpires?:  Date;
  roleId: number;
  verifiedMail?: boolean;
  jobApplications?: JobApplications[];
  jobListings?: JobListings[];
  savedJobs?: SaveJobs[];
  candidatAppointments?: Appointment[];
  consultantAppointments?: Appointment[];
  role?: Roles;
  jobTitle?: JobTitle;
}
  