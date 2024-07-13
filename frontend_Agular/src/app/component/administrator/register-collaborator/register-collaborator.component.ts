import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  Optional,
} from '@angular/core';
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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { MaterialModule } from '../../../../module/Material.module';
import {
  ContractTypes,
  JobListings,
  JobLocation,
  JobTitle,
  Roles,
  Users,
} from '../../../models';
import { ApiResponse } from '../../../shared/model';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { ProfileComponent } from '../../profile/profile.component';
import { SignupResponse } from '../../security/model/response/indexResponse';
import { AuthentificationService } from '../../security/securityIndex';
import { DataService, OthersTablesService, UserService } from '../../service';
import { HandleErrorBase } from '../../shared/HandleErrorBase';

@Component({
  selector: 'app-register-collaborator',
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
  templateUrl: './register-collaborator.component.html',
  styleUrl: './register-collaborator.component.css',
})
export class RegisterCollaboratorComponent
  extends HandleErrorBase
  implements OnInit
{
  private unsubscribe$ = new Subject<void>();

  errorMessage: string | null = null; // Pour stocker le message d'erreur
  registrationForm!: FormGroup; //  Initialiser FormGroup avant son utilisation.
  cvFile: File | null = null;
  showPassword: boolean = false; // Pour affichage ou non du Mot de passe pendant une saisie
  roles: Roles[] = [];
  rolesCount: number | null | undefined; // Nombre de province
  jobListing?: JobListings | null;
  jobTitles: JobTitle[] = [];
  jobLocations: JobLocation[] = [];
  contractTypes: ContractTypes[] = [];
  jobTitlesCount: number | null | undefined; // Nombre de province
  jobLocationsCount: number | null | undefined; // Nombre d'entreprise
  contractTypesCount: number | null | undefined; // Nombre de poste

  isAdmin: boolean = false; // Indique si l'utilisateur est un Admin
  isConsultant: boolean = false; // Indique si l'utilisateur est un consultant
  isAuthenticated: boolean = false; // État d'authentification initial de l'utilisateur
  currentUserId: number | null | undefined;
  theConsultantId: number | null | undefined;
  theAdminId: number | null | undefined;
  isOwner: boolean = false; // Indique s'il est proprietaire du profile
  isOwnerConsultant: boolean = false;
  isOwnerAdmin: boolean = false;

  user?: Users | null;
  isEdit: boolean = false; // ou true, selon le contexte initial
  title = 'Update Profile Candidate';

  constructor(
    private formBuilder: FormBuilder, // Service Angular pour construire des formulaires réactifs.
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any, // On conditionne l'injection, Null si aucune data disponible
    private snackBar: MatSnackBar, // Injecte le service MatSnackBar d'Angular Material pour afficher des snackbars.
    private authService: AuthentificationService, // Service d'authentification pour se connecter.
    private othersTablesService: OthersTablesService,
    private router: Router, // Service Angular pour la navigation entre les routes.
    private route: ActivatedRoute,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    @Optional() private dialogRef: MatDialogRef<ProfileComponent, RegisterCollaboratorComponent>,
    public translateService: TranslateService, // Service pour l'internationalisation et la traduction des messages.
    private dataService: DataService
  ) {
    super(translateService);

    if (data && data.userData) {
      this.user = data.userData; // Affecte les données de l'utilisateur si disponibles
      this.isEdit = true; // Passe en mode édition
      console.log('User avec le Role:', this.user);
    } else {
      this.user = undefined; // Aucune donnée utilisateur, 'user' est mis à undefined
      this.isEdit = false; // Pas en mode édition puisqu'il n'y a pas de données utilisateur
    }
  }

  ngOnInit(): void {
    // Initialisation de base
    this.initializeForm();

    // Condition si l'utilisateur est en mode édition
    if (this.isEdit) {
      // Ajustement basé sur l'état d'authentification
      this.adjustFormForAuthState();
    }

    this.subscribeToRoleData();
  }

  private adjustFormForAuthState(): void {
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;
        this.isAdmin = this.authService.isAdmin;
        this.isConsultant = this.authService.isConsultant;
        this.currentUserId = this.authService.getCurrentUserId();
        this.theConsultantId = this.authService.getConsultantId();
        this.theAdminId = this.authService.getAdminId();
        this.cdr.detectChanges();

        if (isAuthenticated && this.user) {
          this.initializeFormWithUserData();
        }
      });
  }

  // @@@@@@@@@@@@@@@@@@ Méthode privée pour s'abonner aux données depuis DataService..@@@@@@@@@@@@@@@@@@@@@
  private subscribeToRoleData() {
    // S'abonne aux Roles depuis DataService et reçoit les données sous forme d'un objet incluant la liste et le nombre total.
    this.dataService.roles$.subscribe(({ roles, count: rolesCount }) => {
      // Met à jour les propriétés du composant avec les données reçues.
      this.roles = roles; // Liste des types de contrat.
      this.rolesCount = rolesCount; // Nombre total de types de contrat.

      console.log(`les role :`, this.roles);
    });
  }

  initializeFormWithUserData() {

        
    const dateBirth = this.user?.dateBirth ? new Date(this.user.dateBirth) : new Date(); // La date actuelle si `dateBirth` est undefined
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
      address: [
        this.user?.address,
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
      roleId: ['', [Validators.required]],
      address: [
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
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   METHODES  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Register Candidate @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  handleCollaboratorRegistration(): void {
    if (this.isEdit && this.registrationForm.valid) {
      // Si le formulaire est valide, procède à la modification.
      this.updateCollaborator();
    } else if (this.registrationForm.valid) {
      this.registerCollaborator();
    } else {
      // Marque tous les contrôles comme 'touched' pour afficher les messages d'erreur
      Object.values(this.registrationForm.controls).forEach((control) => {
        control.markAsTouched();
      });
    }
  }

  // // @@@@@@@@@@@@@@@@@@ Méthode pour afficher un message d'erreur dans une snackbar.@@@@@@@@@@@@@@@@@@@@@
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


 // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Register Collaborator @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
private registerCollaborator(): void {
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

  if (this.registrationForm.valid) {
    console.log('Formulaire valide');

    // Si le formulaire est valide, procède à la connexion.
    const payload = this.registrationForm.value; // Récupère les données du formulaire.

    // Utilisation de formData pour l'appel API
    this.userService.signupAdminConsul(payload).subscribe({
      next: (response: ApiResponse) => {
        console.log(`formulaire valide processus d'enregistrement en cours.`);

        // caster la response
        response.data as SignupResponse;
        // Gestion de la réponse réussie
        this.translateService.get([
          'dialog.registerSuccessTitle',
          'dialog.registerSuccessMessage',
          'dialog.closeButton'
        ]).subscribe(translations => {
          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
              title: translations['dialog.registerSuccessTitle'],
              message: translations['dialog.registerSuccessMessage'],
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
        this.showBackendErrorDialog(
          this.errorMessage ?? 'Une erreur inconnue est survenue.'
        );
      },
    });
  }
}

 // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Update Collaborator @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
private updateCollaborator(): void {
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

  console.log('Validité du formulaire:', this.registrationForm.valid);

  if (this.isEdit && this.registrationForm.valid) {
    // Si le formulaire est valide, procède à la modification.
    const payload = this.registrationForm.value; // Récupère les données du formulaire.

    // Utilisation de formData pour l'appel API
    this.userService.updateProfileEmployee(payload).subscribe({
      next: (response: ApiResponse) => {
        response.data as SignupResponse;
        // Gestion de la réponse réussie
        this.translateService.get([
          'dialog.updateSuccessTitle',
          'dialog.updateSuccessMessage',
          'dialog.closeButton'
        ]).subscribe(translations => {
          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '300px',
            data: {
              title: translations['dialog.updateSuccessTitle'],
              message: translations['dialog.updateSuccessMessage'],
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
      error: (errorResponse: ApiResponse) => {
        // Utilisation de la classe Base "handleError" pour gérer les erreurs
        this.errorMessage = this.handleError(errorResponse);

        // Affiche le dialogue d'erreur avec le message d'erreur
        this.showBackendErrorDialog(
          this.errorMessage ?? 'Une erreur inconnue est survenue.'
        );
      },
    });
  }
}

    // Méthode pour afficher le dialogue d'erreur après une tentative d'enregistrement échouée
    private showBackendErrorDialog(errorMessage: string) {
      this.translateService.get([
        'dialog.errorTitle',
        'dialog.closeButton'
      ]).subscribe(translations => {
        const dialogRef =    this.dialog.open(ConfirmDialogComponent, {
          width: '400px',
          data: {
            title: translations['dialog.errorTitle'],
            message: errorMessage,
            buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
            messageClass: 'message-error',
          },
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result === 'close') {
          }
        });
      });
    }




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

  get roleId() {
    return this.registrationForm.get('roleId');
  }

  get address() {
    return this.registrationForm.get('address');
  }

  // rendre visible le mot de passe à l'utilisateur
  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  askBack() {
    // On récupère returnUrl depuis les queryParams
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];

    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else { 
      this.router.navigate(['/home']);
    }
  }
}
