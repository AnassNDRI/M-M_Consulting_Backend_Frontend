import { Appointment } from './appointment.model';
import { Experiences } from './experience.models';
import { JobApplications } from './jobApplications.model';
import { JobListings } from './jobListings.model';
import { JobTitle } from './jobTitle.model';
import { Roles } from './role.model';
import { SaveJobs } from './saveJobs.model';

export interface Users {
  userId: number;
  name: string;
  firstname: string;
  dateBirth: Date;
  sex?: string;
  phoneNumber?: string;
  email: string;
  consultant: string;
  password: string;
  jobTitleId?: number;
  cv?: string;
  address?: string;
  nameCompany?: string;
  interviewNote?: string;

  descriptionCompany?: string;
  addressCompany?: string;
  tvaNumber?: string;
  experienceId?: number;
  actif?: boolean;
  addNote?: boolean;
  refreshToken?: string;
  tokenVersion: number;
  refjobNoteAdded?: number;
  notification?: boolean;
  checkUserConsultant?: string;
  confirmationMailToken?: string;
  confirmationMailTokenExpires?: Date;
  roleId: number;
  verifiedMail?: boolean;
  noteInscription?: string;
  createdAt: Date;
  updatedAt?: Date;
  jobApplications: JobApplications[];
  jobListings: JobListings[];
  savedJobs: SaveJobs[];
  consultantAppointments: Appointment[];
  role: Roles;
  experience: Experiences;
  jobTitle?: JobTitle;
}

export interface Company {
  userId: number;
  name: string;
  firstname: string;
  nameCompany: string;
  addressCompany: string;
}

export interface Cv {
  cvUrl?: string;
}


