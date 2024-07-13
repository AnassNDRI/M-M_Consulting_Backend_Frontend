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
import { UserService } from '../service';
import { HandleErrorBase } from '../shared/HandleErrorBase';

@Component({
  selector: 'app-password-resset',
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
  templateUrl: './password-resset.component.html',
  styleUrl: './password-resset.component.css',
})
export class PasswordRessetComponent extends HandleErrorBase implements OnInit {
  errorMessage: string | null = null; // Pour stocker le message d'erreur
  PasswordRessetForm!: FormGroup; //  Initialiser FormGroup avant son utilisation.
  showPassword = false; // Pour affichage ou non du Mot de passe pendant une saisie

  constructor(
    private formBuilder: FormBuilder, // Service Angular pour construire des formulaires réactifs.
    private dialog: MatDialog,
    private router: Router, // Service Angular pour la navigation entre les routes.
    private authService: AuthentificationService, // Service d'authentification pour se connecter.
    private userService: UserService,
    public translateService: TranslateService // Service pour l'internationalisation et la traduction des messages.
  ) {
    super(translateService);
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  // Initialisation du formulaire avec des champs et des validations.
  initializeForm(): void {
    this.PasswordRessetForm = this.formBuilder.group({
      code: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d{5}$/), //  Une chaîne de 5 chiffres, sans espaces avant ou après
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(70),
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(250),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/
          ),
        ],
      ],
    });
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   Methode privée  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Register Candidate @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// Méthode pour la connexion de l'utilisateur.
resetPasswordConfirmation(): void {
  console.log('Tentative de soumission du formulaire de candidature.');
  console.log('Valeurs du formulaire:', this.PasswordRessetForm.value);
  console.log('Validité du formulaire:', this.PasswordRessetForm.valid);

  // Affiche des détails sur les erreurs de validation si le formulaire n'est pas valide
  // Imprimez l'état de validation de chaque champ
  Object.keys(this.PasswordRessetForm.controls).forEach((key) => {
    const control = this.PasswordRessetForm.get(key);
    console.log(`${key} est valide:`, control?.valid, 'Valeur:', control?.value);
    if (control?.errors) {
      console.log(`${key} erreurs:`, control.errors);
    }
  });

  console.log('Validité du formulaire:', this.PasswordRessetForm.valid);

  if (this.PasswordRessetForm.valid) {
    console.log('Formulaire valide');

    // Si le formulaire est valide, procède à la connexion.
    const payload = this.PasswordRessetForm.value; // Récupère les données du formulaire.

    // Utilisation de formData pour l'appel API
    this.userService.resetPasswordConfirmation(payload).subscribe({
      next: (response: ApiResponse) => {
        console.log(`formulaire valide processus d'enregistrement en cours.`);

        // caster la response
        response.data as SignupResponse;
        // Gestion de la réponse réussie
        this.translateService.get([
          'dialog.resetPasswordSuccessTitle',
          'dialog.resetPasswordSuccessMessage',
          'dialog.closeButton'
        ]).subscribe(translations => {
          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
              title: translations['dialog.resetPasswordSuccessTitle'],
              message: translations['dialog.resetPasswordSuccessMessage'],
              buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
              messageClass: 'message-success',
            },
          });

          this.initializeForm(); // Réinitialiser le formulaire

          // Après la fermeture du dialogue
          dialogRef.afterClosed().subscribe((result) => {
            if (result === 'close') {
              // Redirection vers la page d'accueil
              this.redirectToLogin();
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
    Object.values(this.PasswordRessetForm.controls).forEach((control) => {
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
  

  get email() {
    return this.PasswordRessetForm.get('email');
  }
  get password() {
    return this.PasswordRessetForm.get('password');
  }
  get code() {
    return this.PasswordRessetForm.get('code');
  }

  // rendre visible le mot de passe à l'utilisateur
  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  redirectToHome() {
    this.router.navigate(['/home']); // Redirige vers la page d'accueil
  }

  redirectToLogin() {
    this.router.navigate(['/signin']); // Redirige vers la page de connexion
  }
}
