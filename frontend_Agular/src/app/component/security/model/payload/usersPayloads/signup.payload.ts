import { PayloadInterface } from "../../../../../shared/model";


export interface SignupPayload extends PayloadInterface {
  name?: string;
  firstname?: string;
  dateBirth?: Date;
  sex?: string; // Champ optionnel
  phoneNumber?: string; // Champ optionnel
  email?: string;
  password?: string;
  tvaNumber?: string; 
  experienceId?: number;  
  jobTitleId?: number; // Champ optionnel
  cv?: string; // Champ optionnel, supposé être l'URL du fichier PDF
  address?: string; // Champ optionnel
  nameCompany?: string; // Champ optionnel
  addressCompany?: string; // Champ optionnel
  actif?: boolean; // Champ optionnel
  roleId?: number;
}
