import { TranslateService } from '@ngx-translate/core';
import { ApiResponse } from '../../shared/model';

export class HandleErrorBase {
  constructor(protected translate: TranslateService) {}

  public handleError(errorResponse: ApiResponse): string | null {
    // Vérifie si l'objet d'erreur et le message d'erreur existent
    if (errorResponse.error?.message) {
      // Si le message est un tableau, cela signifie que plusieurs erreurs doivent être affichées
      if (Array.isArray(errorResponse.error.message)) {
        // Concatène les messages d'erreur et utilise la clé 'combinedErrors' pour obtenir la traduction appropriée
        return this.translate.instant('errors.combinedErrors', {
          messages: errorResponse.error.message.join(', '),
        });
      } else {
        // Utilise le message d'erreur directement pour obtenir la traduction
        const errorKey = `errors.${errorResponse.error.message}`;
        return this.translate.instant(errorKey);
      }
    } else {
      // Si aucun message d'erreur n'est fourni, utilise un message générique
      return this.translate.instant('errors.genericError');
    }
  }
}




/*// handle-error.base.ts
import { TranslateService } from '@ngx-translate/core';
import { ApiResponse } from '../../shared/model';

export class HandleErrorBase {
  constructor(protected translate: TranslateService) {}

  public handleError(errorResponse: ApiResponse): string | null {
    // Vérifie si l'objet d'erreur et le message d'erreur existent
    if (errorResponse.error?.message) {
      // Si le message est un tableau, cela signifie que plusieurs erreurs doivent être affichées
      if (Array.isArray(errorResponse.error.message)) {
        // Concatène les messages d'erreur et utilise la clé 'combinedErrors' pour obtenir la traduction appropriée
        return this.translate.instant('errors.combinedErrors', {
          messages: errorResponse.error.message.join(', '),
        });
      } /*else {
        // Associe les messages d'erreur connus à leurs clés de traduction respectives
        let errorKey;
        switch (errorResponse.error.message) {
          case 'Veuillez entrer un texte de moins de 250 caractères.':
            errorKey = 'errors.extLengthValidation';
            break;
          case 'Vous avez déjà postulé à cette offre.':
            errorKey = 'errors.applyJobError';
            break;

          case "Vous n'êtes pas connecté. Veuillez vous connecter pour effectuer cette action.":
            errorKey = 'errors.Unauthorized';
            break;
          case 'Token invalide ou expiré.':
            errorKey = 'errors.invalidOrExpiredLink';
            break;
          case "Seul le recruteur et avec son compte peut créer des annonces d'emploi.":
            errorKey = 'errors.ckeck-recruiter';
            break;
          case 'Aucun utilisateur trouvé.':
            errorKey = 'errors.user-not-found';
            break;
          case "Vous n'êtes pas connecté. Veuillez vous connecter et verifier votre rôle pour effectuer cette action.":
            errorKey = 'errors.Unauthorized';
            break;
          case 'La date limite de candidature ne peut pas être une date passée.':
            errorKey = 'errors.deadline';
            break;
          case 'La date de début ne peut pas être une date passée.':
            errorKey = 'errors.start-date';
            break;
          case 'Un JobListing avec ces spécifications existe déjà.':
            errorKey = 'errors.joblist-existing';
            break;
          case 'Token expiré.':
            errorKey = 'errors.expiredLink';
            break;

          case 'User with this email not found.':
            errorKey = 'errors.userNotFound';
            break;
          case 'User Account not activated.':
            errorKey = 'errors.accountNotActivated';
            break;
          case 'Password does not match.':
            errorKey = 'errors.passwordMismatch';
            break;
          case 'This user already exists.':
            errorKey = 'errors.this-user-already-exists';
            break;
          case 'The specified function could not be found.':
            errorKey = 'errors.specified-function-not-found';
            break;
          case "Gender must be 'M' or 'F'.":
            errorKey = 'errors.gender-must-be-m-or-f';
            break;
          case 'User must be at least 18 years old.':
            errorKey = 'errors.user-must-be-at-least-18-years-old';
            break;
          case 'The file must be in PDF format.':
            errorKey = 'errors.file-must-be-in-pdf-format';
            break;
          case 'The file must be less than 5MB.':
            errorKey = 'errors.file-must-be-less-than-5mb';
            break;
          case 'Your email is not valid':
            errorKey = 'errors.emailInvalid';
            break;
          case 'Your email is excessively long, no more than 100 characters':
            errorKey = 'errors.emailTooLong';
            break;
          case 'Must contain at least: 1 uppercase letter, 1 special character, 1 number':
            errorKey = 'errors.passwordRequirements';
            break;
          case 'Your password is excessively long, no more than 70 characters':
            errorKey = 'errors.passwordTooLong';
            break;
          case 'Your validation code has expired or is invalid.':
            errorKey = 'errors.invalid-expired-token';
            break;
          default:
            // Utilise le message d'erreur directement si non reconnu
            errorKey = `errors.${errorResponse.error.message}`;
        } }*/
        // Utilise la clé pour obtenir le message d'erreur traduit
   /*     return this.translate.instant(errorKey);
      
    } else {
      // Si aucun message d'erreur n'est fourni, utilise un message générique
      return this.translate.instant('errors.genericError');
    }
  }
}*/
