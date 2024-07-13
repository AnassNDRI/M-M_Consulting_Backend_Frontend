import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ApiUriEnum } from '../../shared/model';
import {
  ApiService,
  MyHttpService,
  NavigationService,
} from '../../shared/service';
import { UpdatePayload, saveJobPayload } from '../security/model/payload/indexPayload';

@Injectable({
  providedIn: 'root',
})
export class SavejobService extends ApiService {
  constructor(
    public override http: MyHttpService, // Service HTTP, avec 'override' car il étend celui de ApiService
    public navigation: NavigationService
  ) {
    super(http); // Appel au constructeur de la classe parente
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ CREATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // Création d'une annonce
  createSavejob(payload: saveJobPayload): Observable<ApiResponse> {
    return this.http.post(
      `${this.baseUrl}${ApiUriEnum.SAVE_JOB_CREATE}`,
      payload
    );
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ READ  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  //  All Jobs saved  By Candidate Or Consultant
  myAllJobsSavedConsultant(): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.MY_SAVE_JOB_LIST_CONSULTANT}`
    );
  }

  //  All Jobs saved  By Candidate Or Consultant
  myAllJobsSavedCandidate(): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.MY_SAVE_JOB_LIST_CANDIDATE}`
    );
  }

  // Lister toutes les offres enregistrées par les candidats
  saveJobListCandidat(): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SAVE_JOB_LIST_CANDIDATES}`
    );
  }

  // Lister toutes les offres enregistrées par les consultants
  saveJobListConsultant(): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SAVE_JOB_LIST_CONSULTANTS}`
    );
  }

  // Lister toutes les offres enregistrées par les candidats
  mySaveJobList(): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SAVE_JOB_LIST_CANDIDATES}`
    );
  }

  // Détails des offres enregistrées d'un candidat
  saveJobDetailCandidat(): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SAVE_JOB_DETAILS_CANDIDATE}`
    );
  }

  /*
  // Détails des offres enregistrées d'un consultant
  saveJobDetailConsultant(): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SAVE_JOB_DETAILS_CONSULTANT}`
    );
  }
*/
  // Détail d'une offre enregistrée par son ID, accessible par consultant
  saveJobDetailByIdConsultant(saveJobId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SAVE_JOB_DETAIL_CONSULTANT.replace(
        ':saveJobId',
        saveJobId.toString()
      )}`
    );
  }

  // Détail d'une offre enregistrée par son ID, accessible par candidat
  saveJobDetailByIdCandidat(userId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SAVE_JOB_DETAIL_CANDIDATE.replace(
        ':userId',
        userId.toString()
      )}`
    );
  }

  // Lister toutes les offres enregistrées liées à une annonce spécifique
  saveJobListByJobListing(jobListingId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SAVE_JOB_LIST_BY_JOB_LISTING.replace(
        ':jobListingId',
        jobListingId.toString()
      )}`
    );
  }

  // Rechercher toutes les offres enregistrées par ID de consultant
  saveJobSearchByConsultantId(userId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SAVE_JOB_SEARCH_BY_CONSULTANT.replace(
        ':userId',
        userId.toString()
      )}`
    );
  }


  
  // Mise à jour de l'employé par l'administrateur
  assignJobListingToConsultant(jobListingId: number, payload: saveJobPayload): Observable<ApiResponse> {
    return this.http.put(`${this.baseUrl}${ApiUriEnum.ASSIGN_SAVE_JOB_TO_CONSULTANT.replace( ':jobListingId',jobListingId.toString())}`,
      payload
    );
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ DELET  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  saveJobDelete(saveJobId: number): Observable<ApiResponse> {
    return this.http.delete(
      `${this.baseUrl}${ApiUriEnum.SAVE_JOB_DELETE.replace(
        ':saveJobId',
        saveJobId.toString()
      )}`
    );
  }
}
