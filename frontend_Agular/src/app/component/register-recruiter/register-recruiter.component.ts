import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarModule,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MaterialModule } from '../../../module/Material.module';
import { Users } from '../../models';
import { ApiResponse } from '../../shared/model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ProfileComponent } from '../profile/profile.component';
import { SignupResponse } from '../security/model/response/indexResponse';
import { AuthentificationService } from '../security/service/authServiceIndex';
import { UserService } from '../service';
import { HandleErrorBase } from '../shared/HandleErrorBase';
import { isValidTvaNumber } from '../shared/form.validator';

@Component({
  selector: 'app-register-recruiter',
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
  templateUrl: './register-recruiter.component.html',
  styleUrls: ['./register-recruiter.component.css'],
})
export class RegisterRecruiterComponent
  extends HandleErrorBase
  implements OnInit
{
  errorMessage: string | null = null; // Pour stocker le message d'erreur
  registrationForm!: FormGroup; //  Initialiser FormGroup avant son utilisation.
  cvFile: File | null = null;
  showPassword = false; // Pour affichage ou non du Mot de passe pendant une saisie

  user?: Users | null;
  isEdit: boolean = false; // ou true, selon le contexte initial
  title = 'Update Profile Candidate';

  constructor(
    private formBuilder: FormBuilder, // Service Angular pour construire des formulaires réactifs.
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any, // On conditionne l'injection, Null si aucune data disponible
    private snackBar: MatSnackBar, // Injecte le service MatSnackBar d'Angular Material pour afficher des snackbars.
    private authService: AuthentificationService, // Service d'authentification pour se connecter.
    private router: Router, // Service Angular pour la navigation entre les routes.
    private userService: UserService,
    public translateService: TranslateService, // Service pour l'internationalisation et la traduction des messages.
    @Optional() private dialogRef: MatDialogRef<ProfileComponent>
  ) {
    super(translateService);

    if (data && data.userData) {
      this.user = data.userData; // Affecte les données de l'utilisateur si disponibles
      this.isEdit = true; // Passe en mode édition
    } else {
      this.user = undefined; // Aucune donnée utilisateur, 'user' est mis à undefined
      this.isEdit = false; // Pas en mode édition puisqu'il n'y a pas de données utilisateur
    }
  }

  ngOnInit(): void {
    // Vérifie si le composant est en mode édition et que les données utilisateur sont disponibles
    if (this.isEdit && this.user) {
      // Si oui, on initialise le formulaire avec ces données
      this.initializeFormWithUserData();
    } else {
      // Sinon ou nous ne sommes pas en mode édition,
      // initialise un formulaire vierge
      this.initializeForm();
    }
  }

  initializeFormWithUserData() {
    const dateBirth = this.user?.dateBirth
      ? new Date(this.user.dateBirth)
      : new Date(); // La date actuelle si `dateBirth` est undefined
    const formattedDate = this.formatDate(dateBirth);
    this.registrationForm = this.formBuilder.group({
      // Initialiser chaque champ avec les données utilisateur, par exemple :
      name: [
        this.user?.name,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(70),
        ],
      ],
      firstname: [
        this.user?.firstname,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(70),
        ],
      ],
      dateBirth: formattedDate,
      sex: [this.user?.sex, [Validators.required, Validators.maxLength(1)]],
      phoneNumber: [
        this.user?.phoneNumber,
        [
          Validators.required,
          Validators.pattern(/^\+(32|352|39|33|41|49|31)\s\d{9,11}$/), // numeros: Be,CH,Fr,Lu,Nl,It,De suivi de 9 à 10 chiffres
        ],
      ],
      nameCompany: [
        this.user?.nameCompany,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(70),
        ],
      ],
      descriptionCompany: [
        this.user?.descriptionCompany,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(1500),
        ],
      ],
      tvaNumber: [
        this.user?.tvaNumber,
        [Validators.required, isValidTvaNumber()],
      ],
      addressCompany: [
        this.user?.addressCompany,
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(255),
        ],
      ],
    });
  }

  // Initialisation du formulaire avec des champs et des validations.
  initializeForm(): void {
    this.registrationForm = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(70),
        ],
      ],
      firstname: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(70),
        ],
      ],
      dateBirth: ['', [Validators.required]],
      sex: ['', [Validators.required, Validators.maxLength(1)]],
      phoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\+(32|352|39|33|41|49|31)\s\d{9,11}$/), // numeros: Be,CH,Fr,Lu,Nl,It,De suivi de 9 à 10 chiffres
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
      nameCompany: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(70),
        ],
      ],
      tvaNumber: ['', [Validators.required, isValidTvaNumber()]],
      descriptionCompany: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(1500),
        ],
      ],
      addressCompany: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(255),
        ],
      ],
    });
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   Methode privée  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  handleCandidateRegistration(): void {
    if (this.isEdit && this.registrationForm.valid) {
      // Si le formulaire est valide, procède à la modification.
      this.updateRecruiter();
    } else if (this.registrationForm.valid) {
      this.registerRecruiter();
    } else {
      // Marque tous les contrôles comme 'touched' pour afficher les messages d'erreur
      Object.values(this.registrationForm.controls).forEach((control) => {
        control.markAsTouched();
      });
    }
  }
  // Methode pour formater la date avant de le binder au formulaire
  private formatDate(date: Date): string {
    // Extrait l'année de l'objet Date
    const year = date.getFullYear();

    // Extrait le mois de l'objet Date et ajoute un 0 devant si nécessaire pour obtenir un format à deux chiffres
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Ajoute un 0 pour les mois à un chiffre

    // Extrait le jour de l'objet Date et ajoute un 0 devant si nécessaire pour obtenir un format à deux chiffres
    const day = ('0' + date.getDate()).slice(-2); // Ajoute un 0 pour les jours à un chiffre

    // Retourne la date formatée en chaîne de caractères au format 'yyyy-MM-dd'
    return `${year}-${month}-${day}`;
  }




  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Register Recruiter @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
private registerRecruiter(): void {
  console.log('Tentative de soumission du formulaire de candidature.');
  console.log('Valeurs du formulaire:', this.registrationForm.value);
  console.log('Validité du formulaire:', this.registrationForm.valid);

  // Affiche des détails sur les erreurs de validation si le formulaire n'est pas valide
  // Imprimez l'état de validation de chaque champ
  Object.keys(this.registrationForm.controls).forEach((key) => {
    const control = this.registrationForm.get(key);
    console.log(`${key} est valide:`, control?.valid, 'Valeur:', control?.value);
    if (control?.errors) {
      console.log(`${key} erreurs:`, control.errors);
    }
  });

  console.log('État de this.cvFile:', this.cvFile);
  console.log('Validité du formulaire:', this.registrationForm.valid);
  console.log('État de this.cvFile:', this.cvFile);

  if (this.cvFile == null) {
    this.showErrorMessage('Un problème est survenu avec le fichier du CV, veuillez réessayer.');
    return;
  }

  if (this.registrationForm.valid) {
    console.log('Formulaire valide');

    // Si le formulaire est valide, procède à la connexion.
    const payload = this.registrationForm.value; // Récupère les données du formulaire.

    // Utilisation de formData pour l'appel API
    this.userService.signupRecruiter(payload).subscribe({
      next: (response: ApiResponse) => {
        console.log(`formulaire valide processus d'enregistrement en cours.`);

        // caster la response
        response.data as SignupResponse;
        // Gestion de la réponse réussie
        this.translateService.get([
          'dialog.successTitle',
          'dialog.registerRecruiterSuccessMessage',
          'dialog.closeButton'
        ]).subscribe(translations => {
          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
              title: translations['dialog.successTitle'],
              message: translations['dialog.registerRecruiterSuccessMessage'],
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
        this.showJobListingBackendErrorDialog(
          this.errorMessage ??  'Une erreur inconnue est survenue.'
        );
      },
    });
  }
}


  // Méthode pour afficher le dialogue d'erreur après une tentative d'enregistrement échouée
  private showJobListingBackendErrorDialog(errorMessage: string) {
    this.translateService
      .get(['dialog.errorTitle', 'dialog.closeButton'])
      .subscribe((translations) => {
        this.dialog.open(ConfirmDialogComponent, {
          width: '400px',
          data: {
            title: translations['dialog.errorTitle'],
            message: errorMessage,
            buttons: [
              {
                text: translations['dialog.closeButton'],
                value: 'close',
                class: 'cancel-button',
              },
            ],
            messageClass: 'message-error',
          },
        });
      });
  }
 // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Update Recruiter @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
private updateRecruiter(): void {
  console.log('Tentative de soumission du formulaire de candidature.');
  console.log('Valeurs du formulaire:', this.registrationForm.value);
  console.log('Validité du formulaire:', this.registrationForm.valid);

  // Affiche des détails sur les erreurs de validation si le formulaire n'est pas valide
  // Imprimez l'état de validation de chaque champ
  Object.keys(this.registrationForm.controls).forEach((key) => {
    const control = this.registrationForm.get(key);
    console.log(`${key} est valide:`, control?.valid, 'Valeur:', control?.value);
    if (control?.errors) {
      console.log(`${key} erreurs:`, control.errors);
    }
  });

  console.log('État de this.cvFile:', this.cvFile);
  console.log('Validité du formulaire:', this.registrationForm.valid);
  console.log('État de this.cvFile:', this.cvFile);

  if (this.isEdit && this.registrationForm.valid) {
    // Si le formulaire est valide, procède à la modification.
    const payload = this.registrationForm.value; // Récupère les données du formulaire.

    // Utilisation de formData pour l'appel API
    this.userService.updateProfileRecruiter(payload).subscribe({
      next: (response: ApiResponse) => {
        response.data as SignupResponse;
        // Gestion de la réponse réussie
        this.translateService.get([
          'dialog.updateRecruiterSuccessTitle',
          'dialog.updateRecruiterSuccessMessage',
          'dialog.closeButton'
        ]).subscribe(translations => {
          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '300px',
            data: {
              title: translations['dialog.updateRecruiterSuccessTitle'],
              message: translations['dialog.updateRecruiterSuccessMessage'],
              buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
              messageClass: 'message-success',
            },
          });
          // Après la fermeture du dialogue
          dialogRef.afterClosed().subscribe((result) => {
            if (result === 'close') {
              this.initializeForm(); // Réinitialiser le formulaire
              this.dialogRef.close();
              location.reload();
            }
          });
        });
      },
       // Gestion de l'erreur
       error: (errorResponse: ApiResponse) => {
        // Utilisation de la classe Base "handleError" pour gérer les erreurs
        this.errorMessage = this.handleError(errorResponse);

        // Affiche le dialogue d'erreur avec le message d'erreur
        this.showJobListingBackendErrorDialog(
          this.errorMessage ??  'Une erreur inconnue est survenue.'
        );
      },
    });
  }
}


  // @@@@@@@@@@@@@@@@@@ Méthode pour afficher un message d'erreur dans une snackbar.@@@@@@@@@@@@@@@@@@@@@
  showErrorMessage(
    message: string,
    verticalPosition: // `message`: Le texte du message à afficher.
    MatSnackBarVerticalPosition = 'bottom', // `verticalPosition`: Position verticale ('top' ou 'bottom'). Par défaut, 'bottom'.
    horizontalPosition: MatSnackBarHorizontalPosition = 'center'
  ): void {
    // `horizontalPosition`: Position horizontale ('start', 'center', 'end', 'left', 'right'). Par défaut, 'center'.
    this.snackBar.open(message, 'Fermer', {
      duration: 4000, // Durée 4 secondes
      verticalPosition: verticalPosition, // Applique la position verticale spécifiée.
      horizontalPosition: horizontalPosition, // Applique la position horizontale spécifiée.
    });
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   Methode privée  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@ Méthodes pour obtenir facilement l'accès aux champs du formulaire dans le template HTML. @@@@@@@@@@@@@@@@@@@@@

  get name() {
    return this.registrationForm.get('name');
  }
  get firstname() {
    return this.registrationForm.get('firstname');
  }
  get dateBirth() {
    return this.registrationForm.get('dateBirth');
  }
  get sex() {
    return this.registrationForm.get('sex');
  }
  get phoneNumber() {
    return this.registrationForm.get('phoneNumber');
  }
  get email() {
    return this.registrationForm.get('email');
  }
  get password() {
    return this.registrationForm.get('password');
  }

  get nameCompany() {
    return this.registrationForm.get('nameCompany');
  }
  get tvaNumber() {
    return this.registrationForm.get('tvaNumber');
  }
  get addressCompany() {
    return this.registrationForm.get('addressCompany');
  }

  get descriptionCompany() {
    return this.registrationForm.get('descriptionCompany');
  }

  // rendre visible le mot de passe à l'utilisateur
  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  redirectToHome() {
    this.router.navigate(['/home']); // Redirige vers la page d'accueil
  }
}
