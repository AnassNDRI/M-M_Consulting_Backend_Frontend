import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { REFRESHTOKEN_KEY, TOKEN_KEY } from '../../../shared/model';
import { TokenDto } from '../model/dto';


// Injectable service for managing JWT tokens in local storage
@Injectable({
  providedIn: 'root',
})
export class TokenService {
  // Référence au localStorage du navigateur pour stocker les tokens
  private localStorage = window.localStorage;

  constructor() {}

  // Enregistre le token JWT dans le localStorage après avoir supprimé l'ancien token
  public saveToken(token: string): void {
    this.localStorage.removeItem(TOKEN_KEY); // Supprime l'ancien token s'il existe
    this.localStorage.setItem(TOKEN_KEY, token); // Stocke le nouveau token
  }

  // Récupère le token JWT du localStorage
  public getToken(): string | null {
    return this.localStorage.getItem(TOKEN_KEY);
  }

  // Enregistre le token de rafraîchissement dans le localStorage après avoir supprimé l'ancien
  public saveRefreshToken(token: string): void {
    this.localStorage.removeItem(REFRESHTOKEN_KEY); // Supprime l'ancien token de rafraîchissement s'il existe
    this.localStorage.setItem(REFRESHTOKEN_KEY, token); // Stocke le nouveau token de rafraîchissement
  }

  // Récupère le token de rafraîchissement du localStorage
  public getRefreshToken(): string | null {
    return this.localStorage.getItem(REFRESHTOKEN_KEY);
  }

  // Cette fonction va tenter de récupérer les détails du token JWT stocké
  public getTokenDetails(): TokenDto | null {
    const token = this.getToken(); // Récupère le token d'accès
    if (token) {
      // Si un token est trouvé...
      try {
        // On tente de décoder le token pour en extraire les informations
        const decoded: any = jwtDecode(token);

        // On prépare un objet avec les informations décodées du token
        const tokenDetails: TokenDto = {
          accessToken: token, // Le token d'accès lui-même
          refreshToken: this.getRefreshToken() ?? '', // Le token de rafraîchissement, ou une chaîne vide si non trouvé
          tokenType: 'Bearer', // Le type de token, généralement "Bearer"
          expireTime: decoded.expireTime, // Le temps d'expiration du token
        };

        return tokenDetails; // On retourne l'objet contenant les détails du token
      } catch (error) {
        // En cas d'erreur lors du décodage (par exemple, token malformé)
        console.error('Erreur lors du décodage du token:', error);
        return null; // On retourne null pour indiquer l'échec
      }
    }
    // Si aucun token n'est trouvé dès le départ, on retourne également null
    return null;
  }

  // Méthode pour vérifier si le token est sur le point d'expirer
  public isTokenExpiring(): boolean {
    // On obtient les détails du token, y compris le temps d'expiration
    const tokenDetails = this.getTokenDetails();
    if (tokenDetails) {
      // On obtient le temps actuel en secondes
      const now = Date.now() / 1000;
      // On vérifie si le token expire dans les prochaines 60 secondes
      return tokenDetails.expireTime - now < 60;
    }
    // On retourne false si aucun token n'est trouvé ou si le temps d'expiration n'est pas défini
    return false;
  }

  // Réinitialise le token de rafraîchissement en le supprimant du localStorage
  reset() {
    this.localStorage.removeItem(REFRESHTOKEN_KEY);
  }

  // Méthode pour déconnecter l'utilisateur en effaçant.
  signOut(): void {
    this.localStorage.removeItem(TOKEN_KEY); // Supprime spécifiquement le token d'accès
    this.localStorage.removeItem(REFRESHTOKEN_KEY); // Supprime spécifiquement le token de rafraîchissement
  }
}
