import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ApiUriEnum } from '../../shared/model';
import {
  ApiService,
  MyHttpService,
  NavigationService,
} from '../../shared/service';
import {
  SignupPayload,
  UpdatePayload,
} from '../security/model/payload/indexPayload';
import { ApiResponseWithCv } from '../security/securityIndex';

@Injectable({
  providedIn: 'root',
})
export class UserService extends ApiService {
  constructor(
    public override http: MyHttpService, // Service HTTP, avec 'override' car il étend celui de ApiService
    public navigation: NavigationService
  ) {
    super(http); // Appel au constructeur de la classe parente
  }
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ CREATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // Méthode adaptée  pour l'inscription d'un Administrateur et un Consultant
  signupAdminConsul(payload: SignupPayload): Observable<ApiResponse> {
    return this.http.post(
      `${this.baseUrl}${ApiUriEnum.USER_REGISTER_BY_ADMIN}`,
      payload
    );
  }

  // Méthode adaptée pour l'inscription d'un Candidat, acceptant FormData
  signupCandidate(formData: FormData): Observable<ApiResponse> {
    return this.http.post(
      `${this.baseUrl}${ApiUriEnum.USER_REGISTER_CANDIDATE}`,
      formData
    );
  }

  // Méthode adaptée  pour l'inscription d'un Recruteur
  signupRecruiter(payload: SignupPayload): Observable<ApiResponse> {
    return this.http.post(
      `${this.baseUrl}${ApiUriEnum.USER_REGISTER_RECRUITER}`,
      payload
    );
  }

  // Méthode adaptée  pour la demande de reinitialisation du Mote de passe
  resetPasswordDemand(payload: SignupPayload): Observable<ApiResponse> {
    return this.http.post(
      `${this.baseUrl}${ApiUriEnum.USER_RESET_PASSWORD}`,
      payload
    );
  }

  // Méthode adaptée  pour la confirmation de reinitialisation du Mote de passe
  resetPasswordConfirmation(payload: SignupPayload): Observable<ApiResponse> {
    return this.http.post(
      `${this.baseUrl}${ApiUriEnum.USER_RESET_PASSWORD_CONFIRMATION}`,
      payload
    );
  }

  // Méthode pour récupérer les informations de l'utilisateur connecté
  me(): Observable<ApiResponse> {
    return this.http.get(`${this.baseUrl}${ApiUriEnum.USER_PROFILE_DETAILS}`);
  }

  // Méthode pour récupérer les informations de l'utilisateur connecté
  profile(userId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.USER_PROFILE.replace(
        ':userId',
        userId.toString()
      )}`
    );
  }

  // Obtention du CV d'un candidat par admin, consultant, recruteur
  getCvByUserId(userId: number): Observable<ApiResponseWithCv> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.GET_CV.replace(
        ':userId',
        userId.toString()
      )}`
    );
  }

  // Obtention de son propre CV par un candidat
  getMyCv(): Observable<ApiResponseWithCv> {
    return this.http.get(`${this.baseUrl}${ApiUriEnum.GET_MY_CV}`);
  }

  // Liste des utilisateurs actifs
  getAllActiveUsersByRoleId(roleId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.USERS_ACTIVE_LIST_ROLE_ID.replace(
        ':roleId',
        roleId.toString()
      )}`
    );
  }

  // Liste des utilisateurs inactivés
  getAllInactiveUsersByRoleId(roleId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.USERS_INACTIVATED_LIST_ROLE_ID.replace(
        ':roleId',
        roleId.toString()
      )}`
    );
  }

  // Liste des utilisateurs avec email verifié et compte activé
  activeUsersListByAdmin(): Observable<ApiResponse> {
    return this.http.get(`${this.baseUrl}${ApiUriEnum.ALL_ACTIVE_USERS}`);
  }

  // Liste des utilisateurs avec email verifié mais non activé
  inactiveUsersListByAdmin(): Observable<ApiResponse> {
    return this.http.get(`${this.baseUrl}${ApiUriEnum.ALL_INACTIVE_USERS}`);
  }

  // Liste des utilisateurs avec email verifié
  usersListByAdmin(): Observable<ApiResponse> {
    return this.http.get(`${this.baseUrl}${ApiUriEnum.ALL_USERS}`);
  }

  // Chercher Utilisateur par un mot clé dans la description
  searchUsersByNameByAdmin(word: string): Observable<ApiResponse> {
    // On effectue la requête GET avec les paramètres requis
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_USERS_BY_ADMIN}?keyword=${word}`
    );
  }

  // Chercher un comptes invalidé par un mot clé
  searchUsersInactiveByNameByAdmin(word: string): Observable<ApiResponse> {
    // On effectue la requête GET avec les paramètres requis
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_USERS_INVALIDATE_BY_ADMIN}?keyword=${word}`
    );
  }  

  // // Chercher un comptes validé par un mot clé
  searchUsersActiveByNameByAdmin(word: string): Observable<ApiResponse> {
    // On effectue la requête GET avec les paramètres requis
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_USERS_VALIDATE_BY_ADMIN}?keyword=${word}`
    );
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ A VERIFIER  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  /*// Confirmation de l'adresse email
confirmEmail(token: string): Observable<ApiResponse> {
  // Vous devrez ajuster la façon dont le token est envoyé selon votre API
  return this.http.post(ApiUriEnum.CONFIRM_EMAIL, { token });
} */

  // Détails de l'utilisateur par un administrateur
  userDetailsByAdmin(userId: number): Observable<ApiResponse> {
    return this.http.get(
      `${ApiUriEnum.USER_DETAILS_BY_ADMIN.replace(
        ':userId',
        userId.toString()
      )}`
    );
  }

  // Détails de l'utilisateur par un consultant
  userDetailsByConsultant(userId: number): Observable<ApiResponse> {
    return this.http.get(
      `${ApiUriEnum.USER_DETAILS_BY_CONSULTANT.replace(
        ':userId',
        userId.toString()
      )}`
    );
  }

  // Liste des employés actifs
  employeesActiveList(): Observable<ApiResponse> {
    return this.http.get(ApiUriEnum.EMPLOYEES_ACTIVE_LIST);
  }

  // Liste des employés inactivés
  employeesInactivatedList(): Observable<ApiResponse> {
    return this.http.get(ApiUriEnum.EMPLOYEES_INACTIVATED_LIST);
  }

  // Liste des comptes employés avec email non vérifié
  employeeMailUnverified(): Observable<ApiResponse> {
    return this.http.get(ApiUriEnum.EMPLOYEE_MAIL_UNVERIFIED);
  }

  // Comptes avec token de confirmation d'email expiré
  accountConfirmMailTokenExpired(): Observable<ApiResponse> {
    return this.http.get(ApiUriEnum.ACCOUNT_CONFIRM_MAIL_TOKEN_EXPIRED);
  }

  // Liste des utilisateurs recruteurs et candidats avec email non vérifié
  usersMailUnverified(): Observable<ApiResponse> {
    return this.http.get(ApiUriEnum.USERS_MAIL_UNVERIFIED);
  }

  // Recherche d'utilisateurs par mot-clé
  searchUsers(keyword: string): Observable<ApiResponse> {
    // Assurez-vous d'ajuster la manière dont le mot-clé est passé à votre API
    return this.http.get(`${ApiUriEnum.SEARCH_USERS}?keyword=${keyword}`);
  }

  // Liste de tous les administrateurs
  allAdministrators(): Observable<ApiResponse> {
    return this.http.get(ApiUriEnum.ALL_ADMINISTRATORS);
  }

  // Liste de tous les consultants
  allConsultants(): Observable<ApiResponse> {
    return this.http.get(ApiUriEnum.ALL_CONSULTANTS);
  }

  // Liste de tous les recruteurs
  allRecruiters(): Observable<ApiResponse> {
    return this.http.get(ApiUriEnum.ALL_RECRUITERS);
  }

  // Liste de toutes les entreprises
  allCompany(): Observable<ApiResponse> {
    return this.http.get(ApiUriEnum.ALL_COMPANY);
  }

  // Liste de tous les candidats
  allCandidates(): Observable<ApiResponse> {
    return this.http.get(ApiUriEnum.ALL_CANDIDATES);
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ UPDATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // UPDATE Operations

  // Mise à jour des notifications par email
  updateNotification(payload: UpdatePayload): Observable<ApiResponse> {
    // Remplacer `any` par le modèle de données approprié
    return this.http.put(
      `${this.baseUrl}${ApiUriEnum.UPDATE_NOTIFICATION}`,
      payload
    );
  }

  // Mise à jour du profil candidat
  updateProfileCandidate(payload: UpdatePayload): Observable<ApiResponse> {
    return this.http.put(
      `${this.baseUrl}${ApiUriEnum.UPDATE_PROFILE_CANDIDATE}`,
      payload
    );
  }

   // Mise à jour de l'utilisateur par le consultant
   updateCandidateNoteInterview(
    userId: number,
    payload: UpdatePayload
  ): Observable<ApiResponse> {
    return this.http.put(
      `${this.baseUrl}${ApiUriEnum.UPDATE_CANDIDATE_INTERVIEW_NOTE.replace(
        ':userId',
        userId.toString()
      )}`,
      payload
    );
  }



  // Mise à jour du profil recruteur
  updateProfileRecruiter(payload: UpdatePayload): Observable<ApiResponse> {
    return this.http.put(
      `${this.baseUrl}${ApiUriEnum.UPDATE_PROFILE_RECRUITER}`,
      payload
    );
  }

  // Mise à jour du profil consultant
  updateProfileConsultant(
    userId: number,
    payload: UpdatePayload
  ): Observable<ApiResponse> {
    return this.http.put(
      `${this.baseUrl}${ApiUriEnum.UPDATE_PROFILE_CONSULTANT.replace(
        ':userId',
        userId.toString()
      )}`,
      payload
    );
  }

  // Mise à jour du profil administrateur
  updateProfileEmployee(payload: UpdatePayload): Observable<ApiResponse> {
    return this.http.put(
      `${this.baseUrl}${ApiUriEnum.UPDATE_PROFILE_EMPLOYEE}`,
      payload
    );
  }

 

  // Mise à jour de l'employé par l'administrateur
  updateEmployeeByAdmin(
    userId: number,
    payload: UpdatePayload
  ): Observable<ApiResponse> {
    return this.http.put(
      `${this.baseUrl}${ApiUriEnum.UPDATE_EMPLOYEE_BY_ADMIN.replace(
        ':userId',
        userId.toString()
      )}`,
      payload
    );
  }

  // Mise à jour du CV de l'utilisateur
  updateUserCv(formData: FormData): Observable<ApiResponse> {
    return this.http.put(
      `${this.baseUrl}${ApiUriEnum.UPDATE_USER_CV}`,
      formData
    );
  }

  // Validation des utilisateurs après inscription
  validateUser(
    userId: number,
    payload: UpdatePayload
  ): Observable<ApiResponse> {
    return this.http.put(
      `${this.baseUrl}${ApiUriEnum.VALIDATE_USER.replace(
        ':userId',
        userId.toString()
      )}`,
      payload
    );
  }

  

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ DELET  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // Suppression de l'utilisateur par l'administrateur
  deleteUserByAdmin(userId: number): Observable<ApiResponse> {
    return this.http.delete(
      `${this.baseUrl}${ApiUriEnum.DELETE_USER_BY_ADMIN.replace(
        ':userId',
        userId.toString()
      )}`
    );
  }

  // Suppression du profil utilisateur
  deleteProfile(): Observable<ApiResponse> {
    return this.http.delete(`${this.baseUrl}${ApiUriEnum.DELETE_PROFILE}`);
  }

  // Suppression de tous les comptes inactivés avec token de confirmation expiré
  deleteAccountConfirmMailTokenExpired(): Observable<ApiResponse> {
    return this.http.delete(
      `${this.baseUrl}${ApiUriEnum.DELETE_ACCOUNT_CONFIRM_MAIL_TOKEN_EXPIRED}`
    );
  }
}
