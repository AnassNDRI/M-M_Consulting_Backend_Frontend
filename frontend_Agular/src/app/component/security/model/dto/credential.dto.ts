import { DtoInterface } from '../../../../shared/model';

export interface CredentialDto extends DtoInterface {
  userId: number; // Correspond à userId dans le modèle Users
  name: string; // Correspond à name dans le modèle Users
  firstname: string; // Correspond à firstname dans le modèle Users
  email: string; // Correspond à email dans le modèle Users
  role: string; // Vous pourriez vouloir ajouter le rôle de l'utilisateur
  tokenVersion: number; // Correspond à version du token dans le modèle Users
}
