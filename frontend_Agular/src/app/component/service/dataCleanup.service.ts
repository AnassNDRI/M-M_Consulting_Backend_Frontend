import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class DataCleanupService {
  constructor(private router: Router) {}

  clearQueryParams() {
    const cleanUrl = this.getCleanUrl();
    this.router.navigateByUrl(cleanUrl);
  }
/*
  clearSpecificData() {
    // On efface toutes les données spécifiques 
    localStorage.removeItem('someSpecificData');
    sessionStorage.removeItem('anotherSpecificData');
    // Ajoutez d'autres nettoyages nécessaires
  } -*/

  private getCleanUrl(): string {
    const urlTree = this.router.parseUrl(this.router.url);
    // Réinitialise les queryParams pour qu'ils soient vides
    urlTree.queryParams = {}; // Supprime tous les queryParams
    return urlTree.toString();
  }
}
