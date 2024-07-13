import { JobTitle } from '../../../../../models';
import { DtoInterface } from '../../../../../shared/model';

export interface JobTisdtleResponse extends DtoInterface {
  data: {
    count: number; // Le nombre total fonctions
    jobTitles: JobTitle[]; // La liste des fonctions correspondants
  };
}
