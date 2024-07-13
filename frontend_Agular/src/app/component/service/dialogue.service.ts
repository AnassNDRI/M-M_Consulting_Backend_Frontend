import { Injectable } from '@angular/core';
import {
  ApiService,
  MyHttpService,
  NavigationService,
} from '../../shared/service';


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

   

}
