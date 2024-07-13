import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ApiUriEnum } from '../../shared/model';
import {
  ApiService,
  MyHttpService,
  NavigationService,
} from '../../shared/service';
import { JobListingPayload } from '../security/model/payload/indexPayload';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HistoriqueService extends ApiService {
  constructor(
    public override http: MyHttpService, // Service HTTP, avec 'override' car il étend celui de ApiService
    public navigation: NavigationService
  ) {
    super(http); // Appel au constructeur de la classe parente
  }

    // // Chercher une offre archivées par un mot clé
    searchAllHistoriquesByWord(word: string): Observable<ApiResponse> {
      // On effectue la requête GET avec les paramètres requis
      return this.http.get(
        `${this.baseUrl}${ApiUriEnum.SEARCH_HISTORIQUES_BY_ADMIN}?keyword=${word}`
      );
    }
    // loard the historiques
    HistoriqueListByAdmin(): Observable<ApiResponse> {
      return this.http.get(`${this.baseUrl}${ApiUriEnum.HISTORIQUES}`);
    }

      // Chercher des historiques par plage de dates
    searchHistoriquesByDateRange(startDate: string, endDate: string): Observable<ApiResponse> {
      console.log(' SERVICE: Date de debut :', startDate);
      console.log(' SERVICE: Date de fin :', endDate);
      return this.http.get(`${this.baseUrl}${ApiUriEnum.SEARCH_HISTORIQUES_BY_DATE_RANGE}?startDate=${startDate}&endDate=${endDate}`);
    }


}
