import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { isNil } from 'lodash';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../../../shared/model';
import { AuthentificationService } from '../service/authServiceIndex';

// Fonction de garde SecurityGuard
export function SecurityGuard(
  route: ActivatedRouteSnapshot, // Contient les informations sur la route à activer
  state: RouterStateSnapshot // État actuel du routeur
): Observable<boolean> | Promise<boolean> | boolean {
  const authService = inject(AuthentificationService);
  const router = inject(Router);

  console.log('Je suis dans SecurityGuard');

  // Vérifie si l'utilisateur est déjà authentifié
  if (authService.isAuthenticated$.value) {
    return true; // Accès autorisé
  }

  console.log('Passage dans SecurityGuard pour vérification supplémentaire');

  // Vérifie l'existence d'un token de rafraîchissement
  if (isNil(authService.tokenService.getRefreshToken())) {
    console.log(
      'Le token de rafraîchissement est nul, redirection vers la page de connexion'
    );
    redirectToSignIn(router, state.url); // Redirection si aucun token de rafraîchissement
    return false;
  } else {
    // Prépare le payload pour la requête de rafraîchissement du token
    const refreshPayload = {
      refreshToken: authService.tokenService.getRefreshToken()!,
    };

    console.log(
      'Le token de rafraîchissement est disponible, tentative de rafraîchissement du token'
    );

    // Exécute la requête de rafraîchissement du token
    return authService.refreshToken(refreshPayload).pipe(
      map((response: ApiResponse) => {
        // Vérifie la réponse du serveur
        if (!response.result) {
          // Si le rafraîchissement échoue, réinitialise le service de token et redirige
          authService.tokenService.reset();
          redirectToSignIn(router, state.url);
          return false;
        }
        return true; // Accès autorisé si le rafraîchissement réussit
      })
    );
  }
}

// Redirige l'utilisateur vers la page de connexion, en conservant l'URL de retour
function redirectToSignIn(router: Router, returnUrl: string) {
  router.navigate(['/signin'], { queryParams: { returnUrl } });
}
