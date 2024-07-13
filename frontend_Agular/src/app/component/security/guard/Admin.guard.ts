import { inject } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from "@angular/router";
import { isNil } from "lodash";
import { Observable, map } from "rxjs";
import { ApiResponse } from "../../../shared/model";
import { ConfirmDialogComponent } from "../../confirm-dialog/confirm-dialog.component";
import { AuthentificationService } from "../securityIndex";

// Fonction de garde unifiée
export function AdminGuard(
  route: ActivatedRouteSnapshot, // Contient les informations sur la route à activer
  state: RouterStateSnapshot // État actuel du routeur
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  const authService = inject(AuthentificationService);
  const router = inject(Router);
  const dialog = inject(MatDialog);

  console.log('Je suis dans AdminGuard');

  // Vérifie si l'utilisateur est déjà authentifié et possède l'un des rôles nécessaires
  if (authService.getIsAuthenticated() && (authService.isAdmin)) {
    console.log('Accès autorisé pour admin ou consultant');
    return true; // Accès autorisé pour admin ou consultant
  }

  console.log('Passage dans AdminGuard pour vérification supplémentaire');

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

// Fonction pour afficher le dialogue, identique à celle fournie précédemment
function showNotAllowedToDeleteDialog(dialog: MatDialog): void {
  dialog.open(ConfirmDialogComponent, {
    width: '300px',
    disableClose: true,
    data: {
      title: 'Accès Impossible',
      message: `Vous ne disposez pas des permissions nécessaires pour effectuer cette action. Veuillez contacter l'administrateur si vous pensez qu'il s'agit d'une erreur.`,
      buttons: [{ text: 'Fermer', value: 'close', class: 'cancel-button' }],
      messageClass: 'message-error',
    },
  });
}
