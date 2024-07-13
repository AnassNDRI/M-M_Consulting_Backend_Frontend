import { PayloadInterface } from "../../../../../shared/model";



export interface UpdatePayload extends PayloadInterface {
   name?: string;
   firstname?: string;
   dateBirth?: Date;
   sex?: string; // Champ optionnel
   phoneNumber?: string; // Champ optionnel
   email?: string;
   password?: string;
   jobTitleId?: number; // Champ optionnel
   cv?: string; // Champ optionnel, supposé être l'URL du fichier PDF
   address?: string; // Champ optionnel
   interviewNote?: string; // Champ optionnel
   nameCompany?: string; // Champ optionnel
   addressCompany?: string; // Champ optionnel
   notification?: boolean;
   actif?: boolean; // Champ optionnel
   noteInscription?: string;
   roleId?: number;
}
