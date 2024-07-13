import { ContractTypes } from './contractTypes.model';
import { Experiences } from './experience.models';
import { JobLocation } from './jobLocation.model';
import { JobTitle } from './jobTitle.model';
import { Roles } from './role.model';
import { Company } from './user.model';

export interface JobTitlesData {
  count: number;
  jobTitles: JobTitle[];
}

export interface ExperiencesData {
  count: number;
  experiences: Experiences[];
}

export interface JobLocationsData {
  count: number;
  jobLocations: JobLocation[];
}

export interface ContractTypesData {
  count: number;
  contractTypes: ContractTypes[];
}

export interface RolesData {
  count: number;
  roles: Roles[];
}

export interface CompanyData {
  count: number;
  company: Company[];
}
