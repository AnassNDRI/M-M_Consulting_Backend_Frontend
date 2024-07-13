import { PayloadInterface } from '../../../../../shared/model';

export interface JobListingPayload extends PayloadInterface {
  jobTitleId?: number;
  jobLocationId?: number;
  contractTypeId?: number;
  description?: string;
  responsibilities?: string[] | null; // Peut être un tableau de chaînes ou null
  requiredQualifications?: string[] | null; // Peut être un tableau de chaînes ou null
  benefits?: string[] | null; // Peut être un tableau de chaînes ou null
  workingHours?: number; // Champ optionnel
  workingHoursStart?: string; // Champ optionnel
  workingHoursEnd?: string; // Champ optionnel
  startDate?: Date; // Champ optionnel
  salary?: number; // Champ optionnel
  numberOfCandidates?: number;
  deadline?: Date;
  validate?: boolean;
  jobClose?: boolean;
  noteJoblisting?: string;
  deadlineToDeleteNotConfirm?: Date;
  invalidatyToDelete?: boolean;
}
