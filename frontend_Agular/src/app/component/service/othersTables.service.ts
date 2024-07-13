import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, ApiUriEnum } from '../../shared/model';
import {
  ApiService,
  MyHttpService,
  NavigationService,
} from '../../shared/service';

@Injectable({
  providedIn: 'root',
})
export class OthersTablesService extends ApiService {
  constructor(
    public override http: MyHttpService, // Service HTTP, avec 'override' car il étend celui de ApiService
    public navigation: NavigationService
  ) {
    super(http); // Appel au constructeur de la classe parente
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ CREATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ READ  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ UPDATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ DELET  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //  Get JobTitles List
  jobTitlesList(): Observable<ApiResponse> {
    return this.http.get(`${this.baseUrl}${ApiUriEnum.JOBTITLE_LIST}`);
  }

    //  Get Collaborators List
    collaboratorsList(): Observable<ApiResponse> {
      return this.http.get(`${this.baseUrl}${ApiUriEnum.COLLABORATORS_LIST}`);
    }
  

  experiencesList(): Observable<ApiResponse> {
    return this.http.get(`${this.baseUrl}${ApiUriEnum.EXPERIENCES_LIST}`);
  }

  // Get JobLocation List
  jobLocationList(): Observable<ApiResponse> {
    return this.http.get(`${this.baseUrl}${ApiUriEnum.JOBLOCATION_LIST}`);
  }

  // Get ContractType List
  contractTypeList(): Observable<ApiResponse> {
    return this.http.get(`${this.baseUrl}${ApiUriEnum.CONTRATTYPE_LIST}`);
  }

  // Get Role List
  roleList(): Observable<ApiResponse> {
    return this.http.get(`${this.baseUrl}${ApiUriEnum.ROLE_LIST}`);
  }

  // Get Company List
  companyList(): Observable<ApiResponse> {
    return this.http.get(`${this.baseUrl}${ApiUriEnum.ALL_COMPANY}`);
  }

    // Get Company List
    timeSlotList(): Observable<ApiResponse> {
      return this.http.get(`${this.baseUrl}${ApiUriEnum.ALL_TIME_SLOTS}`);
    }
}
