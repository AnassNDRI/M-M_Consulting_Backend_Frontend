import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable, catchError, map } from 'rxjs';
import { ApiResponse, ApiUriEnum } from '../../../shared/model';
import {
  ApiService,
  MyHttpService,
  NavigationService,
} from '../../../shared/service';
import { DataCleanupService } from '../../service/dataCleanup.service';
import { VisibilityStateManagerService } from '../../service/visibilityStateManager.service';
import { TokenDto } from '../model/dto';
import {
  DecodedToken,
  RefreshPayload,
  SigninPayload,
} from '../model/payload/indexPayload';
import { SigninResponse } from '../model/response/indexResponse';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthentificationService extends ApiService {
  // Indicateur d'authentification de l'utilisateur
  isAuthenticated$ = new BehaviorSubject<boolean>(false);

  // BehaviorSubject gardant en mémoire le dernier nom d'utilisateur.
  private userNameSubject$ = new BehaviorSubject<string | null>(null);

  // BehaviorSubject pour le dernier prénom d'utilisateur.
  private userFirstNameSubject$ = new BehaviorSubject<string | null>(null);

  // BehaviorSubject pour le dernier etat du header.
  private loginStateSource = new BehaviorSubject<boolean>(false);
  loginState$ = this.loginStateSource.asObservable();

  constructor(
    public tokenService: TokenService,
    public override http: MyHttpService, // Service HTTP, avec 'override' car il étend celui de ApiService
    public navigation: NavigationService,
    private router: Router,
    private dataCleanupService: DataCleanupService,
    private visibilityStateManagerService: VisibilityStateManagerService
  ) {
    super(http); // Appel au constructeur de la classe parente
  }

  // Méthode pour se connecter en utilisant les informations d'identification de l'utilisateur
  signin(payload: SigninPayload): Observable<ApiResponse> {
    // Envoie une requête POST à l'endpoint de connexion
    return this.http
      .post(`${this.baseUrl}${ApiUriEnum.USER_SIGNIN}`, payload)
      .pipe(
        map((response: ApiResponse) => {
          // On vérifie que la réponse est positive et que les données sont du type attendu
          if (response.result) {
            // On caste `response.data` au type `SigninResponse`
            const signinResponse: SigninResponse =
              response.data as SigninResponse;
            // Enregistrement du token d'accès dans le stockage local via le `TokenService`.
            this.tokenService.saveToken(signinResponse.token.accessToken);
            // Enregistrement du token de rafraîchissement dans le stockage local via le `TokenService`.
            this.tokenService.saveRefreshToken(
              signinResponse.token.refreshToken
            );
            // Mise à jour du statut d'authentification à `true` pour indiquer que l'utilisateur est maintenant connecté.
            this.isAuthenticated$.next(true);
            //  Mise à jour du nom d'utilisateur
            this.setUserName(signinResponse.user.name);
            // Mise à jour du prenom d'utilisateur
            this.setUserFirstName(signinResponse.user.firstname);
            // On passe  le rôle à la méthode de navigation
            this.navigation.navigateToSecure(signinResponse.user.role);
          }
          return response;
        }),
        // Utilisation du gestionnaire d'erreurs
        catchError((error) => this.http.errorHandler(error))
      );
  }

  // Méthode pour rafraîchir le token de l'utilisateur
  refreshToken(refreshToken: RefreshPayload): Observable<ApiResponse> {
    return this.http
      .post(`${this.baseUrl}${ApiUriEnum.REFRESH_TOKEN}`, refreshToken)
      .pipe(
        map((response: ApiResponse) => {
          // Si le rafraîchissement réussit, met à jour les tokens et le statut d'authentification
          if (response.result) {
            // Convertit les données de réponse en `TokenDto` pour accéder aux propriétés du token.
            const tokenResponse: TokenDto = response.data as TokenDto;
            // Enregistre le token d'accès obtenu dans le stockage local en utilisant `TokenService`.
            this.tokenService.saveToken(tokenResponse.tokenType);
            // Enregistre le token de rafraîchissement obtenu dans le stockage local en utilisant `TokenService`.
            this.tokenService.saveRefreshToken(tokenResponse.refreshToken);

            this.isAuthenticated$.next(true);
          }
          return response;
        })
      );
  }

  // Méthode pour vérifier si le token est valide (non expiré)
  isValidToken(): boolean {
    const token = this.tokenService.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);
        const isValid = decoded.exp > currentTime;
        return isValid;
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  public getCurrentUserId(): number | null {
    const decodedToken = this.getDecodedToken();
    return decodedToken ? decodedToken.userId : null;
  }

  // Pour obtenir l'état actuel d'authentification comme un Observable
  getIsAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$.asObservable();
  }

  // Methode pour recharger
  reloadPage() {
    // skipLocationChange: true permet de ne pas ajouter la nouvelle route dans l'historique du navigateur
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      // Navigue vers la page d'accueil
      this.router.navigate(['home']);
    });
  }

  /*
  // Pour obtenir l'état actuel d'authentification comme un Observable
  isAuthenticatedWithRole(requiredRoles: string[]): Observable<boolean> {
    // On utilise `pipe` pour composer plusieurs opérateurs. Ici, `switchMap` est utilisé pour transformer le flux entrant.
    return this.isAuthenticated.pipe(
      switchMap(isAuthenticated => {
        // Si l'utilisateur n'est pas authentifié, on retourne immédiatement un Observable de 'false'.
        if (!isAuthenticated) {
          // Si l'utilisateur n'est pas authentifié, retourne false.
          return of(false);
        } else {
          // Si l'utilisateur est authentifié, on récupère son rôle depuis le token décodé.
          const decodedToken = this.getDecodedToken();
          if (!decodedToken) {
            // Si le token n'est pas valide ou absent, retourne false.
            return of(false);
          }
          // Vérifie si le rôle de l'utilisateur correspond à l'un des rôles requis.
          const userHasRequiredRole = requiredRoles.includes(decodedToken.role);
          return of(userHasRequiredRole);
        }
      })
    ); */

  // Méthode pour obtenir le rôle de l'utilisateur connecté
  public getUserRole(): string | null {
    const token = this.tokenService.getToken(); // Obtient le token JWT du localStorage
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode<DecodedToken>(token); // Décode le token
        return decoded.role; // Retourne le rôle de l'utilisateur si disponible
      } catch (error) {
        console.error('Erreur lors du décodage du token:', error); // Gère les erreurs de décodage
      }
    }
    return null; // Retourne null si aucun token n'est trouvé ou en cas d'erreur
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$ Recuperation du Token, des information de l'user et des roles  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // Utilitaire pour décoder le token et obtenir les données de l'utilisateur
  public getDecodedToken(): DecodedToken | null {
    const token = this.tokenService.getToken();
    if (token) {
      const decodedToken: DecodedToken = jwtDecode<DecodedToken>(token);
      return decodedToken;
    }
    return null;
  }

  public getRecruiterId(): number | null {
    // On utilise la méthode existante pour obtenir le token décodé
    const decodedToken = this.getDecodedToken();
    // On vérifie si le token contient un rôle et si ce rôle est 'Recruiter'
    if (decodedToken && decodedToken.role === 'Recruiter') {
      // On retourne l'ID de l'utilisateur si c'est un recruteur
      return decodedToken.userId;
    }
    return null; // Retourne null si l'utilisateur n'est pas un recruteur ou si le token n'est pas valide
  }

  public getConsultantId(): number | null {
    // On utilise la méthode existante pour obtenir le token décodé
    const decodedToken = this.getDecodedToken();
    // On vérifie si le token contient un rôle et si ce rôle est 'Consultant'
    if (decodedToken && decodedToken.role === 'Consultant') {
      // On retourne l'ID de l'utilisateur si c'est un recruteur
      return decodedToken.userId;
    }
    return null; // Retourne null si l'utilisateur n'est pas un recruteur ou si le token n'est pas valide
  }

  public getAdminId(): number | null {
    // On utilise la méthode existante pour obtenir le token décodé
    const decodedToken = this.getDecodedToken();
    // On vérifie si le token contient un rôle et si ce rôle est 'Administrator'
    if (decodedToken && decodedToken.role === 'Administrator') {
      // On retourne l'ID de l'utilisateur si c'est un recruteur
      return decodedToken.userId;
    }
    return null; // Retourne null si l'utilisateur n'est pas un recruteur ou si le token n'est pas valide
  }

  // Getter pour vérifier si l'utilisateur est un administrateur
  get isAdmin(): boolean {
    const decodedToken = this.getDecodedToken();
    return decodedToken?.role === 'Administrator';
  }

  // Getter pour vérifier si l'utilisateur est un consultant
  get isConsultant(): boolean {
    const decodedToken = this.getDecodedToken();
    return decodedToken?.role === 'Consultant';
  }

   // Getter pour vérifier si l'utilisateur est un membre Externe
   get isExternal(): boolean {
    const decodedToken = this.getDecodedToken();
    return decodedToken?.role === 'External';
  }

  // Getter pour vérifier si l'utilisateur est un recruteur
  get isRecruiter(): boolean {
    const decodedToken = this.getDecodedToken();
    return decodedToken?.role === 'Recruiter';
  }

  // Getter pour vérifier si l'utilisateur est un candidat
  get isCandidate(): boolean {
    const decodedToken = this.getDecodedToken();
    return decodedToken?.role === 'Candidate';
  }

  get userName$(): Observable<string | null> {
    return this.userNameSubject$.asObservable();
  }

  get userFirstName$(): Observable<string | null> {
    return this.userFirstNameSubject$.asObservable();
  }

  // Mettre à jour cette méthode pour définir le nom d'utilisateur lors de la connexion
  setUserName(name: string | null): void {
    this.userNameSubject$.next(name);
  }

  // Mettre à jour cette méthode pour définir le nom d'utilisateur lors de la connexion
  setUserFirstName(firstname: string | null): void {
    this.userFirstNameSubject$.next(firstname);
  }

  setLoginState(state: boolean) {
    this.loginStateSource.next(state);
  }

  // Réinitialisation de l'etat d'authentification de l'utilisateur
  resetUserState(): void {
    // On réinitialise l'état d'authentification
    this.isAuthenticated$.next(false);
    // On efface le nom et prenom d'utilisateur et tout autre état lié à l'utilisateur
    this.userNameSubject$.next('');
    this.userFirstNameSubject$.next('');
  }

  // Déconnexion de l'utilisateur
  logout(): void {
    // Réinitialiser les états
    this.visibilityStateManagerService.clearAllStates();

    // Nettoyer les queryParams et les données spécifiques
    this.dataCleanupService.clearQueryParams();
    // Annuler les requêtes HTTP en cours
    //this.http.abortRequests();

    /*this.dataCleanupService.clearSpecificData();

  // Effacer les timers
  this.timerService.clearTimers();

  // Retirer les gestionnaires d'événements
  this.eventService.removeEventListeners();

  // Unsubscribe des Observables
  this.someService.cleanup(); */

    this.tokenService.signOut(); // On efface les tokens de l'utilisateur
    this.resetUserState(); // On met à jour le statut d'authentification
    this.navigation.navigateToUnsecure(); // On navigue vers une route non sécurisée
  }
}
