import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ApiUriEnum } from '../../shared/model';
import {
  ApiService,
  MyHttpService,
  NavigationService,
} from '../../shared/service';
import { JobApplicationPayload } from '../security/model/payload/indexPayload';

@Injectable({
  providedIn: 'root',
})
export class JobapplicationService extends ApiService {
  constructor(
    public override http: MyHttpService,
    public navigation: NavigationService
  ) {
    super(http);
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ CREATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // Création d'une nouvelle candidature par un candidat
  createJobApplication(
    payload: JobApplicationPayload
  ): Observable<ApiResponse> {
    return this.http.post(
      `${this.baseUrl}${ApiUriEnum.CREATE_JOB_APPLICATION}`,
      payload
    );
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ READ  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // Récupération de toutes les candidatures (Accès par le consultant)
  getAllJobApplications(): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.GET_ALL_JOB_APPLICATIONS}`
    );
  }

  // Récupération de toutes les candidatures où l'entretien est validé (Accès par le consultant)
  getAllJobApplicationsInterviewOk(): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.GET_ALL_JOB_APPLICATIONS_INTERVIEW_OK}`
    );
  }

  // Récupération des candidatures par ID utilisateur (Accès par le consultant)
  getJobApplicationsByCandidate(userId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.GET_JOB_APPLICATIONS_BY_CANDIDATE.replace(
        ':userId',
        userId.toString()
      )}`
    );
  }

  // Récupération de toutes les candidatures par ID du recruteur (Accès par le recruteur)
  findAllJobApplicationsForRecruiter(): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.GET_ALL_JOB_APPLICATIONS_BY_RECRUITER_ID}`
    );
  }

    // Récupération de toutes les candidatures des offres suivies par le consultant
    findAllJobApplicationsFollowUpByConsultant(): Observable<ApiResponse> {
      return this.http.get(
        `${this.baseUrl}${ApiUriEnum.GET_ALL_JOB_APPLICATIONS_FOLLOW_UP_CONSULTANT_ID}`
      );
    }
  

  // Récupération des candidatures par ID d'annonce (Accès par le consultant ou recruteur)
  getJobApplicationsByJobListing(
    jobListingId: number
  ): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.GET_JOB_APPLICATIONS_BY_JOB_LISTING.replace(
        ':jobListingId',
        jobListingId.toString()
      )}`
    );
  }

  // Récupération de toutes les candidatures d'un candidat (Accès par le candidat)
  getMyAllJobApplications(): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.GET_ALL_MY_JOB_APPLICATIONS}`
    );
  }

  // Détail d'une candidature (Accès par admin, consultant, recruteur, candidat)
  getJobApplicationDetail(jobApplicationId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.JOB_APPLICATION_DETAIL.replace(
        ':jobApplicationId',
        jobApplicationId.toString()
      )}`
    );
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ UPDATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // Mise à jour du statut d'une candidature (Accès par le consultant)
  updateJobApplicationStatus(
    jobApplicationId: number,
    statusPayload: JobApplicationPayload
  ): Observable<ApiResponse> {
    return this.http.put(
      `${this.baseUrl}${ApiUriEnum.UPDATE_JOB_APPLICATION_STATUS.replace(
        ':jobApplicationId',
        jobApplicationId.toString()
      )}`,
      statusPayload
    );
  }

    // Modifiaction de du controlleur d'ajout de note

      updateAddNoteInterview(jobApplicationId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.USER_NOTE_ADD.replace(
        ':jobApplicationId',
        jobApplicationId.toString()
      )}`
    );
  }

  

  // Résultat après l'entretien d'une candidature
  resultJobApplicationInterview(
    jobApplicationId: number,
    interviewPayload: JobApplicationPayload
  ): Observable<ApiResponse> {
    return this.http.put(
      `${this.baseUrl}${ApiUriEnum.RESULT_JOB_APPLICATION_INTERVIEW.replace(
        ':jobApplicationId',
        jobApplicationId.toString()
      )}`,
      interviewPayload
    );
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ DELET  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // Suppression d'une candidature (Accès par le consultant)
  deleteJobApplication(jobApplicationId: number): Observable<ApiResponse> {
    return this.http.delete(
      `${this.baseUrl}${ApiUriEnum.DELETE_JOB_APPLICATION.replace(
        ':jobApplicationId',
        jobApplicationId.toString()
      )}`
    );
  }

  // Suppression de ma candidature (Accès par le candidat)
  deleteMyJobApplication(jobApplicationId: number): Observable<ApiResponse> {
    return this.http.delete(
      `${this.baseUrl}${ApiUriEnum.DELETE_MY_JOB_APPLICATION.replace(
        ':jobApplicationId',
        jobApplicationId.toString()
      )}`
    );
  }

  // Suppression de toutes les candidatures dont la date limite est aujourd'hui
  deleteAllJobApplicationDeadlineNow(): Observable<ApiResponse> {
    return this.http.delete(
      `${this.baseUrl}${ApiUriEnum.DELETE_ALL_JOB_APPLICATION_DEADLINE_NOW}`
    );
  }
}
