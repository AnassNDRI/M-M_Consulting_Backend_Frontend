import { Injectable } from '@angular/core';
import { MyHttpService } from './http.service';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  baseUrl = environment.apiUrl; 

  constructor(public http: MyHttpService) {}
}


//http://localhost:3000