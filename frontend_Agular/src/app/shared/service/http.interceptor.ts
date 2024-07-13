import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isNil } from 'lodash';
import { Observable, catchError, switchMap, throwError } from 'rxjs';

import { AuthentificationService } from '../../component/security/service/authentification.service';
import { ApiResponse, ApiUriEnum } from '../model';
import { RefreshPayload } from '../../component/security/model/payload/indexPayload';

@Injectable({
  providedIn: 'root',
})
export class HttpInterceptorService implements HttpInterceptor {
  attempts = 0; // Compteur d'essais pour la gestion des erreurs

  constructor(public auth: AuthentificationService) {}

  // Interception de toutes les requêtes HTTP sortantes
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const cloneReq = this.addToken(req); // Ajout du token JWT aux requêtes
    return next.handle(cloneReq).pipe(
      catchError((err: HttpErrorResponse) => {
        // Gestion des erreurs de la requête
        return this.handleError(err, cloneReq, next);
      })
    );
  }
  // On ajoute le token JWT dans les headers de la requête HTTP, sauf pour les routes d'authentification et de rafraîchissement de token.
  private addToken(req: HttpRequest<any>): HttpRequest<any> {
    // Vérifie si l'URL de la requête n'est pas une URL d'authentification ou de rafraîchissement de token.
    if (
      !req.url.includes(ApiUriEnum.USER_SIGNIN) &&
      !req.url.includes(ApiUriEnum.USER_REGISTER_RECRUITER) &&
      !req.url.includes(ApiUriEnum.USER_REGISTER_CANDIDATE) &&
      !req.url.includes(ApiUriEnum.REFRESH_TOKEN)
    ) {
      // Clone la requête pour y ajouter le header d'autorisation avec le token JWT.
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${this.auth.tokenService.getToken()}`,
        },
      });
    }
    return req; // Retourne la requête modifiée ou la requête originale si aucune modification n'est nécessaire.
  }

  // On gère les erreurs HTTP, en particulier les erreurs d'autorisation (401), et tente de rafraîchir le token JWT si nécessaire.
  private handleError(
    err: HttpErrorResponse,
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<any> {
    // =n limite les tentatives de retraitement de la requête pour éviter une boucle infinie en cas d'erreur continue.
    if (this.attempts > 1) {
      this.attempts = 0; // On réinitialise le compteur d'essais après deux tentatives.
      this.auth.navigation.navigateToLogin(); // On redirige l'utilisateur vers la connexion.
      return throwError(() => err); // Propage l'erreur.
    }
    this.attempts++; // Incrémente le compteur d'essais à chaque erreur gérée.

    // On vérifie si l'erreur est due à une autorisation manquante ou invalide.
    if (err.error.error === 'unauthorized' || err.status === 401) {
      //On vérifie  si un token de rafraîchissement est disponible.
      if (isNil(this.auth.tokenService.getRefreshToken())) {
        this.auth.navigation.navigateToLogin(); // On redirige si aucun token de rafraîchissement n'est disponible.
        return throwError(() => err); // Propage l'erreur.
      } else {
        //On prépare le payload pour la demande de rafraîchissement du token.
        const refreshPayload: RefreshPayload = {
          refreshToken: this.auth.tokenService.getRefreshToken()!, // (!) => null ou undefined,
        };
        // Tente de rafraîchir le token et relance la requête en cas de succès.
        return this.auth.refreshToken(refreshPayload).pipe(
          switchMap((response: ApiResponse) => {
            if (!response.result) {
              return throwError(() => err); // Propage l'erreur si le rafraîchissement échoue.
            }
            const cloneReq = this.addToken(req); // Ajoute le nouveau token à la requête.
            return next.handle(cloneReq).pipe(
              // Relance la requête avec le nouveau token.
              catchError((err: HttpErrorResponse) => {
                return this.handleError(err, req, next); // Gère les erreurs potentielles de la nouvelle requête.
              })
            );
          })
        );
      }
    }
    return throwError(() => err); // Propage l'erreur si elle n'est pas liée à l'autorisation.
  }
}
