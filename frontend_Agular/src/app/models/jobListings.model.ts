import { ContractTypes } from './contractTypes.model';
import { Experiences } from './experience.models';
import { JobApplications } from './jobApplications.model';
import { JobLocation } from './jobLocation.model';
import { JobTitle } from './jobTitle.model';
import { SaveJobs } from './saveJobs.model';
import { Users } from './user.model';

export interface JobListings {
  jobListingId: number;
  jobLocationId: number;
  jobTitleId: number;
  contractTypeId: number;
  experienceId: number;
  description?: string;
  responsibilities?: string[] | null; // Peut être un tableau de chaînes ou null
  requiredQualifications?: string[] | null; // Peut être un tableau de chaînes ou null
  benefits?: string[] | null;
  workingHours: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  startDate?: Date;
  numberOfCandidates?: number;
  salary?: number;
  noteJoblisting?: string;
  deadline: Date;
  deadlineExpires: Date;
  validate?: boolean;
  ////// Non présents dans le modèle backend.
  isSaved?: boolean;
  applicationCount: number;
  savedJobNumber: number; // Indicateur côté client pour marquer les offres d'emploi sauvegardées par l'utilisateur.
  ///////////////////////////////
  invalidatyToDelete?: boolean;
  jobClose?: boolean;
  checkJobListingByConsultant?: string;
  deadlineToDeleteNotConfirm?: Date;
  userId: number;
  dayAgo?: number;
  countApply?: number;
  displayDate?: string;
  publicationDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
  jobApplications: JobApplications[];
  savedJob: SaveJobs[];
  user: Users;
  contractType: ContractTypes;
  jobLocation: JobLocation;
  jobTitle: JobTitle;
  experience: Experiences
}
