import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MaterialModule } from '../../../module/Material.module';
import { ApiResponse } from '../../shared/model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { SignupResponse } from '../security/model/response/indexResponse';
import { AuthentificationService } from '../security/service/authServiceIndex';
import { HandleErrorBase } from '../shared/HandleErrorBase';
import { UserService } from '../service';

@Component({
  selector: 'app-password-forgot',
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
  templateUrl: './password-forgot.component.html',
  styleUrl: './password-forgot.component.css',
})
export class PasswordForgotComponent extends HandleErrorBase implements OnInit {
  errorMessage: string | null = null; // Pour stocker le message d'erreur
  resetPassForm!: FormGroup; //  Initialiser FormGroup avant son utilisation.

  //errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder, // Service Angular pour construire des formulaires réactifs.
    private dialog: MatDialog,
    private authService: AuthentificationService, // Service d'authentification pour se connecter.
    private userService: UserService,
    private router: Router, // Service Angular pour la navigation entre les routes.
    public translateService: TranslateService // Service pour l'internationalisation et la traduction des messages.
  ) {
    super(translateService);
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  // Initialisation du formulaire avec des champs et des validations.
  initializeForm(): void {
    this.resetPassForm = this.formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(70),
        ],
      ],
    });
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   Methode privée  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

 // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Register Candidate @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// Méthode pour la connexion de l'utilisateur.
resetPasswordDemand(): void {
  console.log('Tentative de soumission du formulaire de candidature.');
  console.log('Valeurs du formulaire:', this.resetPassForm.value);
  console.log('Validité du formulaire:', this.resetPassForm.valid);

  // Affiche des détails sur les erreurs de validation si le formulaire n'est pas valide
  // Imprimez l'état de validation de chaque champ
  Object.keys(this.resetPassForm.controls).forEach((key) => {
    const control = this.resetPassForm.get(key);
    console.log(`${key} est valide:`, control?.valid, 'Valeur:', control?.value);
    if (control?.errors) {
      console.log(`${key} erreurs:`, control.errors);
    }
  });

  console.log('Validité du formulaire:', this.resetPassForm.valid);

  if (this.resetPassForm.valid) {
    console.log('Formulaire valide');

    // Si le formulaire est valide, procède à la connexion.
    const payload = this.resetPassForm.value; // Récupère les données du formulaire.

    // Utilisation de formData pour l'appel API
    this.userService.resetPasswordDemand(payload).subscribe({
      next: (response: ApiResponse) => {
        console.log(`formulaire valide processus d'enregistrement en cours.`);

        // caster la response
        response.data as SignupResponse;
        // Gestion de la réponse réussie
        this.translateService.get([
          'dialog.resetPasswordDemandSuccessTitle',
          'dialog.resetPasswordDemandSuccessMessage',
          'dialog.closeButton'
        ]).subscribe(translations => {
          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
              title: translations['dialog.resetPasswordDemandSuccessTitle'],
              message: translations['dialog.resetPasswordDemandSuccessMessage'],
              buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
              messageClass: 'message-success',
            },
          });

          this.initializeForm(); // Réinitialiser le formulaire

          // Après la fermeture du dialogue
          dialogRef.afterClosed().subscribe((result) => {
            if (result === 'close') {
              // Redirection vers la page d'accueil
              this.redirectToHome();
            }
          });
        });
      },
      // Gestion de l'erreur
      error: (errorResponse: ApiResponse) => {
        // Utilisation de la classe Base "handleError" pour gérer les erreurs
        this.errorMessage = this.handleError(errorResponse);

        // Affiche le dialogue d'erreur avec le message d'erreur
        this.showBackendErrorDialog(
          this.errorMessage ?? 'Une erreur inconnue est survenue.'
        );
      },
    });
  } else {
    // Marque tous les contrôles comme 'touched' pour afficher les messages d'erreur
    Object.values(this.resetPassForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }
}

  
    // Méthode pour afficher le dialogue d'erreur après une tentative d'enregistrement échouée
    private showBackendErrorDialog(errorMessage: string) {
      this.translateService.get([
        'dialog.errorTitle',
        'dialog.closeButton'
      ]).subscribe(translations => {
         this.dialog.open(ConfirmDialogComponent, {
          width: '400px',
          data: {
            title: translations['dialog.errorTitle'],
            message: errorMessage,
            buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
            messageClass: 'message-error',
          },
        });
      });
    }
  

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   Methode privée  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@ Méthodes pour obtenir facilement l'accès aux champs du formulaire dans le template HTML. @@@@@@@@@@@@@@@@@@@@@

  get email() {
    return this.resetPassForm.get('email');
  }

  redirectToHome() {
    this.router.navigate(['/reset-pwd']); // Redirige vers la page de recuperation du mail
  }
}
