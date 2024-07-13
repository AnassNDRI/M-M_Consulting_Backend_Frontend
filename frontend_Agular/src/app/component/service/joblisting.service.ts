import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ApiUriEnum } from '../../shared/model';
import {
  ApiService,
  MyHttpService,
  NavigationService,
} from '../../shared/service';
import { JobListingPayload } from '../security/model/payload/indexPayload';

@Injectable({
  providedIn: 'root',
})
export class JoblistingService extends ApiService {
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
  createJobListing(payload: JobListingPayload): Observable<ApiResponse> {
    return this.http.post(
      `${this.baseUrl}${ApiUriEnum.JOBLIST_CREATE}`,
      payload
    );
  }
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ READ  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // Job Listings verified List, Access by All
  jobListingList(userId?: number): Observable<ApiResponse> {
    // Vérifie si un userId est fourni, indiquant que l'utilisateur est connecté
    if (userId !== undefined) {
      // Si un userId est fourni, on l'inclut dans l'URL pour la requête HTTP
      // On utilisation de .replace pour insérer l'userId dans l'URL
      return this.http.get(
        `${this.baseUrl}${ApiUriEnum.JOBLIST_VERIFIED.replace(
          ':userId',
          userId.toString()
        )}`
      );
    }
    // Si aucun userId n'est fourni, on effectuera la requête sans inclure l'userId dans l'URL
    return this.http.get(`${this.baseUrl}${ApiUriEnum.JOBLIST_VERIFIED}`);
  }

  // Liste de mes annonces publiées par le recruteur
  myJobListing(): Observable<ApiResponse> {
    return this.http.get(`${this.baseUrl}${ApiUriEnum.MY_JOBLIST_LIST}`);
  }

  ///???????????????????????????????????????????????????????????????????????
  // Détail d'une annonce
  jobListingDetail(jobListingId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.JOBLIST_DETAIL.replace(
        ':jobListingId',
        jobListingId.toString()
      )}`
    );
  }

  ///???????????????????????????????????????????????????????????????????????

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ START GETTERS BY ADMIN   $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // Get All jobs of recruiter by recruiterId Access (Recruiter)
  allJobsByRecruiterByAdmin(recruiterId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.RECRUITER_JOBS_PUBLISHED.replace(
        ':userId',
        recruiterId.toString()
      )}`
    );
  }
  // // Chercher un emploi par un mot clé dans la description
  searchJobTitleByWordByAdmin(word: string): Observable<ApiResponse> {
    // On effectue la requête GET avec les paramètres requis
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_IN_DESCRIPTION_BY_ADMIN}?keyword=${word}`
    );
  }
  // Job Listings verified List, Access by All
  jobListingListByAdmin(): Observable<ApiResponse> {
    return this.http.get(`${this.baseUrl}${ApiUriEnum.JOBLIST}`);
  }
  // Liste des utilisateurs avec email verifié mais non activé
  invalidedJobListingByAdmin(): Observable<ApiResponse> {
    return this.http.get(`${this.baseUrl}${ApiUriEnum.ALL_INACTIVE_JOBLIST}`);
  }
  // Liste des offres d'emploi verifiées et validées
  validedJobListingByAdmin(): Observable<ApiResponse> {
    return this.http.get(`${this.baseUrl}${ApiUriEnum.ALL_ACTIVE_JOBLIST}`);
  }

  // Chercher un emploi par un Type de Contrat
  searchJobByContractTypeByAdmin(
    contractTypeId: number
  ): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_BY_CONTRAT.replace(
        ':contractTypeId',
        contractTypeId.toString()
      )}`
    );
  }
  // Chercher un emploi par un Type de Contrat
  searchJobByContractTypeAccessCandidate(
    contractTypeId: number
  ): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_BY_CONTRAT_CANDIDATE.replace(
        ':contractTypeId',
        contractTypeId.toString()
      )}`
    );
  }
  // Chercher un emploi par un Type de Contrat
  searchJobByContractTypeInvalidate(
    contractTypeId: number
  ): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_BY_CONTRAT_INVALIDATE.replace(
        ':contractTypeId',
        contractTypeId.toString()
      )}`
    );
  }
  // Chercher un emploi par un Type de Contrat
  searchJobByContractTypeValidate(
    contractTypeId: number
  ): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_BY_CONTRAT_VALIDATE.replace(
        ':contractTypeId',
        contractTypeId.toString()
      )}`
    );
  }

  // Chercher un emploi par le nom d'une fonction
  searchJobByFunctionByAdmin(jobTitleId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_BY_FUNCTION.replace(
        ':jobTitleId',
        jobTitleId.toString()
      )}`
    );
  }
  // Chercher un emploi par le nom d'une fonction
  searchJobByFunctionByForCandidate(
    jobTitleId: number
  ): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_BY_FUNCTION_FOR_CANDIDATE.replace(
        ':jobTitleId',
        jobTitleId.toString()
      )}`
    );
  }
  // Chercher un emploi par le nom d'une fonction
  searchJobByFunctionByVALIDATE(jobTitleId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_BY_FUNCTION_VALIDATE.replace(
        ':jobTitleId',
        jobTitleId.toString()
      )}`
    );
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ END GETTERS BY ALL USERS  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ GETTERS BY ALL USERS  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // Get All jobs of recruiter by recruiterId Access (Recruiter)
  allJobsByRecruiter(recruiterId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.RECRUITER_JOBS_PUBLISHED.replace(
        ':userId',
        recruiterId.toString()
      )}`
    );
  }
  // // Chercher un emploi par un mot clé dans la description
  searchAllJobListingByWord(word: string): Observable<ApiResponse> {
    // On effectue la requête GET avec les paramètres requis
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOBLISTING_BY_ADMIN}?keyword=${word}`
    );
  }
  // // Chercher un emploi par un mot clé dans la description
  searchJobListingValidateForCandidateByWord(
    word: string
  ): Observable<ApiResponse> {
    // On effectue la requête GET avec les paramètres requis
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_VALIDATE_FOR_CANDIDATE}?keyword=${word}`
    );
  }
  // // Chercher un emploi par un mot clé dans la description
  searchJobListingValidateByWordAccessAdmin(
    word: string
  ): Observable<ApiResponse> {
    // On effectue la requête GET avec les paramètres requis
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_VALIDATE_ACCESS_ADMIN}?keyword=${word}`
    );
  }
  // // Chercher un emploi par un mot clé dans la description
  searchJobListingInvalidateByWord(word: string): Observable<ApiResponse> {
    // On effectue la requête GET avec les paramètres requis
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOBLISTING_INVALIDATE}?keyword=${word}`
    );
  }

  // Chercher un emploi par le nom d'une localité
  searchJobByLocation(jobLocationId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_BY_LOCATION.replace(
        ':jobLocationId',
        jobLocationId.toString()
      )}`
    );
  }
  // Chercher un emploi par le nom d'une localité
  searchJobByLocationAccessCandidate(
    jobLocationId: number
  ): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_BY_LOCATION_CANDIDATE.replace(
        ':jobLocationId',
        jobLocationId.toString()
      )}`
    );
  }
  // Chercher un emploi par le nom d'une localité
  searchInvalideByJobLocation(jobLocationId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_BY_LOCATION_INVALIDATE.replace(
        ':jobLocationId',
        jobLocationId.toString()
      )}`
    );
  }
  // Chercher un emploi par le nom d'une localité
  searchValideByJobLocation(jobLocationId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_BY_LOCATION_VALIDATE.replace(
        ':jobLocationId',
        jobLocationId.toString()
      )}`
    );
  }

  // Chercher un emploi par un nom de compagnie
  searchJobByCompanyNameByAdmin(userdId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_BY_COMPANY.replace(
        ':userId',
        userdId.toString()
      )}`
    );
  }
  // Chercher un emploi par un nom de compagnie
  searchJobByCompanyNameAccessCandidate(
    userdId: number
  ): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_BY_COMPANY_CANDIDATE.replace(
        ':userId',
        userdId.toString()
      )}`
    );
  }
    // Chercher un emploi par un nom de compagnie
    searchJobByCompanyNameInvalidate(userdId: number): Observable<ApiResponse> {
      return this.http.get(
        `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_BY_COMPANY_INVALIDATE.replace(
          ':userId',
          userdId.toString()
        )}`
      );
    }
      // Chercher un emploi par un nom de compagnie
  searchJobByCompanyNameValidate(userdId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_BY_COMPANY_VALIDATE.replace(
        ':userId',
        userdId.toString()
      )}`
    );
  }

  // Chercher un emploi par le nom d'une fonction
  searchJobByFunction(jobTitleId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_BY_FUNCTION.replace(
        ':jobTitleId',
        jobTitleId.toString()
      )}`
    );
  }
  // Chercher un emploi par le nom d'une fonction
  searchJobByFunctionForCandidate(jobTitleId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_BY_FUNCTION_FOR_CANDIDATE.replace(
        ':jobTitleId',
        jobTitleId.toString()
      )}`
    );
  }
  // Chercher un emploi par le nom d'une fonction
  searchJobValidateByFunction(jobTitleId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_BY_FUNCTION_VALIDATE.replace(
        ':jobTitleId',
        jobTitleId.toString()
      )}`
    );
  }
  // Chercher un emploi par le nom d'une fonction
  searchJobInvalidateByFunction(jobTitleId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_JOB_BY_FUNCTION_INVALIDATE.replace(
        ':jobTitleId',
        jobTitleId.toString()
      )}`
    );
  }

  // All Job Listings grouped by day, Week, Month
  getAllJobsGroupedByTime(filter: string): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.ALL_JOBS_GROUPED_BY_TIME.replace(
        ':filter',
        filter
      )}`
    );
  }
  // All Job Listings grouped by day, Week, Month
  getJobsGroupedByTimeForCandidate(filter: string): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.JOBS_GROUPED_BY_TIME_FOR_CANDIDATE.replace(
        ':filter',
        filter
      )}`
    );
  }
  // All Job Listings grouped by day, Week, Month
  getJobsGroupedByTimeValidate(filter: string): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.JOBS_GROUPED_BY_TIME_VALIDATE.replace(
        ':filter',
        filter
      )}`
    );
  }
  // All Job Listings grouped by day, Week, Month
  getJobsGroupedByTimeInvalidate(filter: string): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.JOBS_GROUPED_BY_TIME_INVALIDATE.replace(
        ':filter',
        filter
      )}`
    );
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ END GETTERS BY ALL USERS  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ DEBUT NON UTILISEE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // Détail de son annonce publiée, accessible par le recruteur
  jobListingDetailByRecruiterPublished(
    jobListingId: number
  ): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.MY_JOBLIST_DETAIL.replace(
        ':jobListingId',
        jobListingId.toString()
      )}`
    );
  }

  // Access By Consultant
  joblistDisable(): Observable<ApiResponse> {
    return this.http.get(`${this.baseUrl}${ApiUriEnum.JOBLIST_DISABLE}`);
  }

  // Where validate is null
  joblistDisableToValidate(): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.JOBLIST_DISABLE_TO_VALIDATE}`
    );
  }

  // Where deadline is Now
  jobDeadlineNow(): Observable<ApiResponse> {
    return this.http.get(`${this.baseUrl}${ApiUriEnum.JOBS_DEADLINE_NOW}`);
  }

  // Where deadline expired after two week
  jobsDeadlineExpiredTwoWeeks(): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.JOBS_DEADLINE_EXPIRED_TWO_WEEKS}`
    );
  }

  // To Update with deadline expired after two Days
  jobsDeadlineExpiredTwoDays(): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.JOBS_DEADLINE_EXPIRED_TWO_DAYS}`
    );
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ FIN NON UTILISEE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ UPDATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // Mise à jour d'une annonce par le recruteur avant publication
  updateJobBeforePublished(
    jobListingId: number,
    payload: JobListingPayload
  ): Observable<ApiResponse> {
    return this.http.put(
      `${this.baseUrl}${ApiUriEnum.UPDATE_JOB_BEFORE_PUBLISHED.replace(
        ':jobListingId',
        jobListingId.toString()
      )}`,
      payload
    );
  }
  // Mise à jour de la date limite d'une annonce après expiration
  updateJobDeadline(
    jobListingId: number,
    payload: JobListingPayload
  ): Observable<ApiResponse> {
    return this.http.put(
      `${this.baseUrl}${ApiUriEnum.UPDATE_JOB_DEADLINE.replace(
        ':jobListingId',
        jobListingId.toString()
      )}`,
      payload
    );
  }

  // Validation d'une annonce publiée par le recruiteur, validation effectué par le Consultant
  validateJobPublished(
    jobListingId: number,
    payload: JobListingPayload
  ): Observable<ApiResponse> {
    return this.http.put(
      `${this.baseUrl}${ApiUriEnum.VALIDATE_JOB_PUBLISHED.replace(
        ':jobListingId',
        jobListingId.toString()
      )}`,
      payload
    );
  }

  // Invalidité et suppression d'une annonce publiée par le recruiter, invalidation effectué par le Consultant
  invalidateDeleteJobPublished(
    jobListingId: number,
    payload: JobListingPayload
  ): Observable<ApiResponse> {
    return this.http.put(
      `${this.baseUrl}${ApiUriEnum.INVALIDATE_DELETE_JOB_PUBLISHED.replace(
        ':jobListingId',
        jobListingId.toString()
      )}`,
      payload
    );
  }

    // Fermeture ou reouverture d'une annonce publiée par le recruiteur.
    closeJoblisting(
      jobListingId: number,
      payload: JobListingPayload
    ): Observable<ApiResponse> {
      return this.http.put(
        `${this.baseUrl}${ApiUriEnum.CLOSE_JOB_PUBLISHED.replace(
          ':jobListingId',
          jobListingId.toString()
        )}`,
        payload
      );
    }

      // Reactivation d'offre d'emploi par le recruiteur.
      reactivationJoblisting(
        jobListingId: number,
        payload: JobListingPayload
      ): Observable<ApiResponse> {
        return this.http.put(
          `${this.baseUrl}${ApiUriEnum.CLOSE_JOB_PUBLISHED.replace(
            ':jobListingId',
            jobListingId.toString()
          )}`,
          payload
        );
      }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ DELETE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // Suppression d'une annonce par le consultant
  deleteJobListingByConsultant(jobListingId: number): Observable<ApiResponse> {
    return this.http.delete(
      `${this.baseUrl}${ApiUriEnum.DELETE_JOB_LISTING_BY_CONSULTANT.replace(
        ':jobListingId',
        jobListingId.toString()
      )}`
    );
  }

  // Suppression de mon annonce publiée (Recruteur)
  deleteMyJobPublished(jobListingId: number): Observable<ApiResponse> {
    return this.http.delete(
      `${this.baseUrl}${ApiUriEnum.DELETE_MY_JOB_PUBLISHED.replace(
        ':jobListingId',
        jobListingId.toString()
      )}`
    );
  }
}
