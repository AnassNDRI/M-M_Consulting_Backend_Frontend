import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ApiErrorResponse, ApiResponse, PayloadInterface } from '../model';

@Injectable({
  providedIn: 'root',
})

// Gestion des interactions HTTP dans l'application.
export class MyHttpService {
  // LoadingEmitter` est un BehaviorSubject qui émet des valeurs booléennes.
  // Signale l'état de chargement des requêtes HTTP dans l'application.
  // On initialise la valeur à `false`, indiquant qu'il n'y a pas de chargement en cours au démarrage.
  loadingEmitter: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  // Déclare un objet `abortControllers` qui associe des URLs (clés) à des instances d'`AbortController` (valeurs).
// Ce sera utilisé pour stocker les contrôleurs permettant d'annuler les requêtes HTTP spécifiques.
private abortControllers: { [key: string]: AbortController } = {};


  constructor(private http: HttpClient) {}

  // **Gestionnaire d'erreurs** Cette méthode gère les erreurs provenant du backend et renvoie un Observable qui émet l'erreur.
  public errorHandler(
    errorResponse: HttpErrorResponse
  ): Observable<ApiResponse> {
    let error: ApiErrorResponse;

    // Déterminer si l'erreur provient du client ou du serveur
    if (errorResponse.error instanceof ErrorEvent) {
      // Erreur client
      error = {
        statusCode: errorResponse.status,
        message: errorResponse.error.error.message,
        error: 'Client Error',
      };
    } else {
      // Erreur serveur
      error = {
        statusCode: errorResponse.status,
        message: errorResponse.error.error.message,
        error: errorResponse.error,
      };
    }
    // Créer un ApiResponse avec le résultat à false et l'erreur remplie
    const apiResponse: ApiResponse = {
      result: false,
      data: null,
      error_code: `404`, // Ici, vous pouvez mettre le code d'erreur de votre choix
      error: {
        statusCode: errorResponse.status,
        message: errorResponse.error.error.message || errorResponse.message,
        error: errorResponse.error.error || 'An error occurred',
      },
    };

    // Renvoyer un Observable qui émet l'ApiResponse d'erreur
    return throwError(() => apiResponse);
  }

  // GET
  //Cette méthode est utilisée pour récupérer des données depuis le serveur.
  public get(url: string): Observable<any> {
    // On fait une requête GET à l'URL fournie.
    return this.http.get(url).pipe(
      // Si une erreur survient, on utilise errorHandler pour la gérer.
      catchError((error: HttpErrorResponse) => this.errorHandler(error)),
      // Peu importe le résultat, à la fin de la requête, on indique que le chargement est terminé.
      finalize(() => {
        this.loadingEmitter.next(false);
      })
    );
  }
  // Ajuste la méthode POST pour qu'elle accepte soit un objet respectant PayloadInterface, soit un FormData.
  public post(url: string, data: PayloadInterface | FormData): Observable<any> {
    // On signale le début d'une opération de chargement.
    this.loadingEmitter.next(true);
    // On initialise un objet pour gérer les en-têtes HTTP.
    let headers = new HttpHeaders();
    // Si les données ne sont pas de type FormData (donc un objet JSON typique),
    // on définit le 'Content-Type' à 'application/json'.
    // FormData s'occupera de son propre 'Content-Type' lors de l'envoi de fichiers.
    if (!(data instanceof FormData)) {
      headers = headers.set('Content-Type', 'application/json');
    }
    // On effectue la requête POST en passant les données et les en-têtes configurés.
    return this.http.post(url, data, { headers }).pipe(
      catchError((error: HttpErrorResponse) => this.errorHandler(error)), // En cas d'erreur, on appelle errorHandler.
      finalize(() => this.loadingEmitter.next(false)) // Peu importe le résultat, on signale la fin du chargement.
    );
  }

  // La méthode PUT est ajustée de manière similaire pour accepter soit PayloadInterface soit FormData.
  public put(url: string, data: PayloadInterface | FormData): Observable<any> {
    // On signale le début du chargement.
    this.loadingEmitter.next(true);

    // On prépare les en-têtes HTTP.
    let headers = new HttpHeaders();
    // Comme pour POST, si data n'est pas de type FormData, on définit 'Content-Type' à 'application/json'.
    if (!(data instanceof FormData)) {
      headers = headers.set('Content-Type', 'application/json');
    }
    // On effectue la requête PUT, similaire à POST, pour mettre à jour des données sur le serveur.
    return this.http.put(url, data, { headers }).pipe(
      catchError((error: HttpErrorResponse) => this.errorHandler(error)), // Gestion des erreurs.
      finalize(() => this.loadingEmitter.next(false)) // Signalisation de la fin du chargement.
    );
  }

  // DELETE,
  // Cette méthode est utilisée pour supprimer des données sur le serveur.
  public delete(url: string): Observable<any> {
    // On fait une requête DELETE à l'URL fournie.
    return this.http.delete(url).pipe(
      // Si une erreur survient, on utilise errorHandler pour la gérer.
      catchError((error: HttpErrorResponse) => this.errorHandler(error)),
      // Peu importe le résultat, à la fin de la requête, on indique que le chargement est terminé.
      finalize(() => {
        this.loadingEmitter.next(false);
      })
    );
  }
/*
  public abortRequests() {
    // Boucle à travers toutes les clés (URLs) dans l'objet `abortControllers`.
    for (const url in this.abortControllers) {
      // Vérifie si `abortControllers` a effectivement cette propriété comme une propriété propre
      // (et non héritée).
      if (this.abortControllers.hasOwnProperty(url)) {
        // Annule la requête associée à cette URL en appelant `abort` sur le contrôleur.
        this.abortControllers[url].abort();
        // Supprime le contrôleur d'abort de l'objet `abortControllers` après avoir annulé la requête.
        delete this.abortControllers[url];
      }
    }
  }
  */

}
