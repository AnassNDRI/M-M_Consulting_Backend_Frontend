import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ApiUriEnum } from '../../shared/model';
import {
  ApiService,
  MyHttpService,
  NavigationService,
} from '../../shared/service';
import { AppointmentPayload } from '../security/model/payload/indexPayload';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService extends ApiService {
  constructor(
    public override http: MyHttpService,
    public navigation: NavigationService
  ) {
    super(http);
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ CREATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // Création d'un nouveau rendez-vous
  createAppointment(payload: AppointmentPayload): Observable<ApiResponse> {
    // Remplacez `any` par votre modèle de données
    return this.http.post(
      `${this.baseUrl}${ApiUriEnum.CREATE_APPOINTMENT}`,
      payload
    );
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ READ  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // Détail de mon rendez-vous, accès par le candidat
  getCandidateAppointmentDetail(): Observable<ApiResponse> {
    // Assurez-vous que la route ou la méthode d'API correspond à ce que vous attendez
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.GET_CANDIDATE_APPOINTMENT_DETAIL}`
    );
  }

  // Les RDV rendez-vous d'un Candidat
  getMyallAppointmentCandidate(): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.GET_MY_ALL_APPOINTMENT_CANDIDATE}`
    );
  }

    // Les RDV rendez-vous d'un Candidat
    getMyallAppointmentConsultant(): Observable<ApiResponse> {
      return this.http.get(
        `${this.baseUrl}${ApiUriEnum.GET_MY_ALL_APPOINTMENT_CONSULTANT}`
      );
    }

  // All Appointment grouped by day, Week, Month
  getMyAllFutureAppointmentsGrouped(filter: string): Observable<ApiResponse> {
    return this.http.get(
      `${
        this.baseUrl
      }${ApiUriEnum.GET_MY_ALL_APPOINTMENT_CANDIDATE_GROUPED_BY_TIME.replace(
        ':filter',
        filter
      )}`
    );
  }

  // All  Appointment grouped by day, Week, Month for all Consultant
  getAllFutureAppointmentsGrouped(): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.GET_ALL_APPOINTMENT_GROUPED_BY_TIME}`
    );
  }

  // // Chercher un RDV par mot clé
  searchInfoInAppointmentByAdmin(word: string): Observable<ApiResponse> {
    // On effectue la requête GET avec les paramètres requis
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_INFO_IN_APPOINTMENT}?keyword=${word}`
    );
  }

   // // Chercher dans mes RDV par  mot clé
   searchInfoInMyAppointmentByAdmin(word: string): Observable<ApiResponse> {
    // On effectue la requête GET avec les paramètres requis
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.SEARCH_INFO_IN_MY_APPOINTMENT}?keyword=${word}`
    );
  }

  // Récupération de tous les rendez-vous passés
  getAllPastAppointments(): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.GET_ALL_PAST_APPOINTMENTS}`
    );
  }

  // Récupération de tous les rendez-vous futurs
  getAllFutureAppointments(): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.GET_ALL_FUTURE_APPOINTMENTS}`
    );
  }

  // Détail du rendez-vous par ID
  getAppointmentDetail(appointmentId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.GET_MY_APPOINTMENT_DETAIL.replace(
        ':appointmentId',
        appointmentId.toString()
      )}`
    );
  }

  


  // Permet au consultant de récuperer tous ses rendez-vous par
  getMyAllAppointmentsByConsultantId(): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.GET_APPOINTMENTS_BY_CONSULTANT_ID}`
    );
  }

  // Détail de mon rendez-vous
  getMyAppointmentDetail(appointmentId: number): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.GET_MY_APPOINTMENT_DETAIL.replace(
        ':appointmentId',
        appointmentId.toString()
      )}`
    );
  }

  // Mon dernier rendez-vous pour connaître ma prochaine disponibilité
  getMyLastAppointment(): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.GET_MY_LAST_APPOINTMENT}`
    );
  }

  // Mes plages horaires disponibles depuis maintenant jusqu'à mon dernier rendez-vous
  getMyAvailableTimeslotsNowUntilLastAppointment(): Observable<ApiResponse> {
    return this.http.get(
      `${this.baseUrl}${ApiUriEnum.GET_MY_AVAILABLE_TIMESLOTS_NOW_UNTIL_LAST_APPOINTMENT}`
    );
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ UPDATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // Mise à jour d'un rendez-vous
  updateAppointment(
    appointmentId: number,
    payload: AppointmentPayload
  ): Observable<ApiResponse> {
    return this.http.put(
      `${this.baseUrl}${ApiUriEnum.UPDATE_APPOINTMENT.replace(
        ':appointmentId',
        appointmentId.toString()
      )}`,
      payload
    );
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ DELET  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // Annulation d'un rendez-vous, accès par consultants et candidats
  cancelAppointment(appointmentId: number): Observable<ApiResponse> {
    return this.http.delete(
      `${this.baseUrl}${ApiUriEnum.CANCEL_APPOINTMENT.replace(
        ':appointmentId',
        appointmentId.toString()
      )}`
    );
  }
}
