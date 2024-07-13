import { JobListings } from "./jobListings.model";

export interface DialogData {
  code: number;
  title: string;
  jobListingData?: JobListings; // Utiliser '?' pour indiquer que la propriété peut être absente
  type: string;
}