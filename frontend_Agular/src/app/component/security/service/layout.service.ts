import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  // Service contient un BehaviorSubject afin que tous les composants soient notifiés en cas de changement
  // Ce BehaviorSubject permet d'afficher ou non le header en fonction de la navigation.
  headerVisible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  isHeaderVisible$ = this.headerVisible.asObservable();

  // Ce BehaviorSubject permet d'afficher ou non le footer en fonction de la navigation.
  footerVisible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  isfooterVisible$ = this.footerVisible.asObservable();

  constructor() {}
}
