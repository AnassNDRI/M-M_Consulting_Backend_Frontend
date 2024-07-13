import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MaterialModule } from '../../../module/Material.module';
import { HandleErrorBase } from '../shared/HandleErrorBase';

@Component({
  selector: 'app-account-confirm',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MaterialModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './account-confirm.component.html',
  styleUrl: './account-confirm.component.css',
})
export class AccountConfirmComponent extends HandleErrorBase implements OnInit {
  errorMessage: string | null = null; // Pour stocker le message d'erreur

  messageStatus: 'success' | 'failure' | null = null; // Pour afficher le message dans une couleur en fonction statut

  constructor(
    private activatedRoute: ActivatedRoute, // ActivatedRoute pour accéder aux paramètres de l'URL.
    private router: Router, // Service Angular pour la navigation entre les routes.
    translate: TranslateService // Service pour l'internationalisation et la traduction des messages.
  ) {
    super(translate);
  }

  ngOnInit(): void {
    // Souscription aux paramètres de requête de l'URL active
    this.activatedRoute.queryParams.subscribe((params) => {
      // Récupération du paramètre 'status' de l'URL
      const status = params['status'];
      // Récupération du paramètre 'message' de l'URL, décodé si présent, sinon chaîne vide
      const messageKey = params['message']? decodeURIComponent(params['message']): '';

      // Vérification si le statut est 'success' ou 'failure'
      if (status === 'success' || status === 'failure') {
        // On affecte le statut à la variable messageStatus
        this.messageStatus = status;
        
        // Utilisation du service de traduction pour obtenir le message traduit basé sur 'messageKey'
        this.translate.get(messageKey).subscribe((translatedMessage) => {
          // Affectation du message traduit à la variable 'errorMessage'
          this.errorMessage = translatedMessage;
        });
      }
    });
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   Methode privée  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@ Méthodes pour obtenir facilement l'accès aux champs du formulaire dans le template HTML. @@@@@@@@@@@@@@@@@@@@@
  redirectToHome() {
    this.router.navigate(['/reset-pwd']); // Redirige vers la page de recuperation du mail
  }
}
