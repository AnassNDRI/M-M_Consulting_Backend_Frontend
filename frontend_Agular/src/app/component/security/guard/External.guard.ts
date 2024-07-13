import { inject } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from "@angular/router";
import { isNil } from "lodash";
import { Observable, map } from "rxjs";
import { ApiResponse } from "../../../shared/model";
import { AuthentificationService } from "../securityIndex";


// Fonction de garde unifiée
export function ExternalGuard(
  route: ActivatedRouteSnapshot, // Contient les informations sur la route à activer
  state: RouterStateSnapshot // État actuel du routeur
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  const authService = inject(AuthentificationService);
  const router = inject(Router);
  const dialog = inject(MatDialog);

  console.log('Je suis dans ConsultantGuard');

  // Vérifie si l'utilisateur est déjà authentifié et possède l'un des rôles nécessaires
  if (authService.getIsAuthenticated() && (authService.isAdmin || authService.isConsultant || authService.isExternal)) {
    console.log('Accès autorisé pour admin ou consultant, membre Externe');
    return true; // Accès autorisé pour admin ou consultant
  }



  // Vérifie l'existence d'un token de rafraîchissement
  if (isNil(authService.tokenService.getRefreshToken())) {
    console.log('Le token de rafraîchissement est nul, redirection vers la page de connexion');
    redirectToSignIn(router, state.url, dialog); // Redirection si aucun token de rafraîchissement
    return false;
  } else {
    // Prépare le payload pour la requête de rafraîchissement du token
    const refreshPayload = {
      refreshToken: authService.tokenService.getRefreshToken()!,
    };

    console.log('Le token de rafraîchissement est disponible, tentative de rafraîchissement du token');

    // Exécute la requête de rafraîchissement du token
    return authService.refreshToken(refreshPayload).pipe(
      map((response: ApiResponse) => {
        // Vérifie la réponse du serveur
        if (!response.result) {
          // Si le rafraîchissement échoue, réinitialise le service de token et redirige
          console.log('Échec du rafraîchissement du token, redirection');
          authService.tokenService.reset();
          redirectToSignIn(router, state.url, dialog);
          return false;
        }
        console.log('Rafraîchissement du token réussi, accès autorisé');
        return true; // Accès autorisé si le rafraîchissement réussit
      })
    );
  }
}

// Fonction modifiée pour rediriger l'utilisateur et afficher une boîte de dialogue en cas d'accès refusé
function redirectToSignIn(router: Router, returnUrl: string, dialog: MatDialog) {
 // showNotAllowedToDeleteDialog(dialog); // Affiche la boîte de dialogue pour l'accès refusé
  router.navigate(['/signin'], { queryParams: { returnUrl } });
}


