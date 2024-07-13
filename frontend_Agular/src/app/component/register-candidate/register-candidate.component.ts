import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, Optional } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
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
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MaterialModule } from '../../../module/Material.module';
import { JobTitle, Users } from '../../models';
import { ApiResponse } from '../../shared/model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { SignupResponse } from '../security/model/response/indexResponse';
import { AuthentificationService } from '../security/service/authServiceIndex';

import { DateWithSuffixPipe } from '../../shared/pipe/date-with-suffix.pipe';
import { MenuheaderComponent } from '../menuheader/menuheader.component';
import { ProfileComponent } from '../profile/profile.component';
import { UserService } from '../service';
import { OthersTablesService } from '../service/othersTables.service';
import { HandleErrorBase } from '../shared/HandleErrorBase';
import { Experiences } from '../../models/experience.models';
import { DashboardComponent } from '../administrator/dashboard/dashboard.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-register-candidate',
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
    RouterOutlet,
    MenuheaderComponent,
    AsyncPipe,
    DateWithSuffixPipe,
  ],
  templateUrl: './register-candidate.component.html',
  styleUrl: './register-candidate.component.css',
})
export class RegisterCandidateComponent
  extends HandleErrorBase
  implements OnInit
{
  private unsubscribe$ = new Subject<void>();
  
  errorMessage: string | null = null; // Pour stocker le message d'erreur
  registrationForm!: FormGroup; //  Initialiser FormGroup avant son utilisation.
  cvFile: File | null = null;
  jobTitles: JobTitle[] = [];
  experiences: Experiences[] = [];
  showPassword = false; // Pour affichage ou non du Mot de passe pendant une saisie

  user?: Users | null;
  userToAddNote?: Users | null;

  userProfileId: number | null | undefined;
  isEdit: boolean = false; // ou true, selon le contexte initial
  isAddNote: boolean = false; // ou true, selon le contexte initial
  isConsultant: boolean = false;
  isAdmin: boolean = false;
  isAuthenticated: boolean = false; // État d'authentification initial de l'utilisateur
  title = 'Update Profile Candidate';
  noteText: string = ''; // Ajout de la propriété noteText

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder, // Service Angular pour construire des formulaires réactifs.
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any, // On conditionne l'injection, Null si aucune data disponible
    private snackBar: MatSnackBar, // Injecte le service MatSnackBar d'Angular Material pour afficher des snackbars.
    private othersTablesService: OthersTablesService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private authService: AuthentificationService, // Service d'authentification pour se connecter.
    private router: Router, // Service Angular pour la navigation entre les routes.
    public translateService: TranslateService, // Service pour l'internationalisation et la traduction des messages.
    @Optional() private dialogRef: MatDialogRef<ProfileComponent, DashboardComponent>
  ) {
    super(translateService);

    if (data && data.userData) {
      this.user = data.userData;
      this.isEdit = true;

    } else if (data && data.userToAddNoteData) {
      this.isAddNote = true;
      this.userProfileId = data.userId;

    } else {
      this.user = undefined;
      this.isEdit = false;
    }


      // Initialisation du formulaire par défaut
    this.initializeForm();
  }
  ngOnInit(): void {
    this.subscribeToAuthState();

    if (this.isEdit && this.user) {
      this.initializeFormWithUserData();
    } else {
      this.initializeForm();
    }

    this.fetchJobTitles();
    this.fetchExperiences();  
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
      jobTitleId: [this.user?.jobTitleId, [Validators.required]],
      experienceId: [this.user?.experienceId, [Validators.required]],
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
      jobTitleId: ['', [Validators.required]],
      experienceId: ['', [Validators.required]],
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
      address: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(255),
        ],
      ],
      interviewNote: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(1500),
        ],
      ],
      cv: ['', this.isFileRequired()], // On applique le validateur personnalisé
    });
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

  

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   METHODES  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
   // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Souscription aux paramètres de la route pour récupérer l'ID du User.

  
  

  private subscribeToAuthState(): void {
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;
        this.isAdmin = this.authService.isAdmin;
        this.isConsultant = this.authService.isConsultant;
        this.cdr.detectChanges();
      });
  }


   // Méthode pour afficher le dialogue d'erreur après une tentative d'enregistrement échouée
   private showRegisterAppointmentErrorDialog(errorMessage: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: 'Une erreur est survenue',
        message: errorMessage,
        buttons: [{ text: 'Fermer', value: 'close', class: 'cancel-button' }],
        messageClass: 'message-error',
      },
    });
    // Après la fermeture du dialogue
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'close') {
        // Vous pouvez ajouter d'autres actions ici si nécessaire
      }
    });
  }




  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Register Candidate @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  handleCandidateRegistration(): void {
    if (this.isEdit && this.registrationForm.valid) {

      // Si le formulaire est valide, procède à la modification.
      this.updateCandidate();
    } else if (this.isAddNote && this.registrationForm.valid) {
      this.updateCandidateNoteInterview()
    } else if (this.cvFile == null) {
      this.showErrorMessage(
        'Un problème est survenu avec le fichier du CV, veuillez réessayer.'
      );
    }
    if (this.registrationForm.valid && this.cvFile) {
      this.registerCandidate();
    } else {
      // Marque tous les contrôles comme 'touched' pour afficher les messages d'erreur
      Object.values(this.registrationForm.controls).forEach((control) => {
        control.markAsTouched();
      });
    }
  }
 

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  les job titles @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  fetchJobTitles() {
    this.othersTablesService.jobTitlesList().subscribe({
      // Si la réponse est reçue sans erreur.
      next: (response) => {
        // On vérifie que la réponse et son contenu 'data' existent.
        if (response && response.data) {
          // On caste 'response.data' au type attendu ({ jobTitles: JobTitle[] }).
          const data = response.data as { jobTitles: JobTitle[] };
          // on assigne les jobTitles obtenus à la propriété 'jobTitles'
          this.jobTitles = data.jobTitles;
        }
      },
        // Gestion de l'erreur
        error: (errorResponse: ApiResponse) => {
          // Utilisation de la classe Base "handleError" pour gérer les erreurs
          this.errorMessage = this.handleError(errorResponse);

          // Affiche le dialogue d'erreur avec le message d'erreur
          this.showRegisterAppointmentErrorDialog(
            this.errorMessage ?? 'Une erreur inconnue est survenue.'
          );
        },
      });
  }

   // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  les job titles @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
   fetchExperiences() {
    console.log(`je rentre dans le fecth:`);
    this.othersTablesService.experiencesList().subscribe({
      
      // Si la réponse est reçue sans erreur.
      next: (response) => {
        console.log(`je rentre dans le nex:`);
        // On vérifie que la réponse et son contenu 'data' existent.
        if (response && response.data) {
          console.log(`je rentre dans le nex:`);
          // On caste 'response.data' au type attendu ({ experiences: Experiences[] }).
          const data = response.data as { experiences: Experiences[] };
          // on assigne les experiences obteneus à la propriété 'experiences'
          this.experiences = data.experiences;

          console.log(`les experience:`, this.experiences )
        }
      },
        // Gestion de l'erreur
        error: (errorResponse: ApiResponse) => {
          // Utilisation de la classe Base "handleError" pour gérer les erreurs
          this.errorMessage = this.handleError(errorResponse);

          // Affiche le dialogue d'erreur avec le message d'erreur
          this.showRegisterAppointmentErrorDialog(
            this.errorMessage ?? 'Une erreur inconnue est survenue.'
          );
        },
      });
  }
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   Methode privée  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Register Candidate @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
registerCandidate(): void {
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
  if (this.registrationForm.valid && this.cvFile) {
    console.log('Formulaire valide et fichier CV présent');
    // Création d'un objet FormData
    const formData = new FormData();
    // On ajout le fichier CV
    formData.append('cv', this.cvFile, this.cvFile.name);

    // Parcourt chaque champ du formulaire et les ajoute à formData.
    Object.keys(this.registrationForm.value).forEach((key) => {
      formData.append(key, this.registrationForm.value[key]);
    });

    // Utilisation de formData pour l'appel API
    this.userService.signupCandidate(formData).subscribe({
      next: (response: ApiResponse) => {
        response.data as SignupResponse;
        // Gestion de la réponse réussie
        this.translateService.get([
          'dialog.successTitle',
          'dialog.registerCandidateSuccessMessage',
          'dialog.closeButton'
        ]).subscribe(translations => {
          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '300px',
            data: {
              title: translations['dialog.successTitle'],
              message: translations['dialog.registerCandidateSuccessMessage'],
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
        this.showRegisterAppointmentErrorDialog(
          this.errorMessage ?? 'Une erreur inconnue est survenue.'
        );
      },
    });
  }
}

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Update Candidate @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
updateCandidate(): void {
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
    this.userService.updateProfileCandidate(payload).subscribe({
      next: (response: ApiResponse) => {
        response.data as SignupResponse;
        // Gestion de la réponse réussie
        this.translateService.get([
          'dialog.updateCandidateSuccessTitle',
          'dialog.updateCandidateSuccessMessage',
          'dialog.closeButton'
        ]).subscribe(translations => {
          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '300px',
            data: {
              title: translations['dialog.updateCandidateSuccessTitle'],
              message: translations['dialog.updateCandidateSuccessMessage'],
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
        this.showRegisterAppointmentErrorDialog(
          this.errorMessage ?? 'Une erreur inconnue est survenue.'
        );
      },
    });
  }
}


  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Update Candidate  Interview Note@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  updateCandidateNoteInterview(): void {
    console.log('Tentative de soumission du formulaire de candidature.');
    console.log('Valeurs du formulaire:', this.registrationForm.value);
    console.log('Validité du formulaire:', this.registrationForm.valid);

    // Affiche des détails sur les erreurs de validation si le formulaire n'est pas valide
    // Imprimez l'état de validation de chaque champ
    Object.keys(this.registrationForm.controls).forEach((key) => {
      const control = this.registrationForm.get(key);
      console.log(
        `${key} est valide:`,
        control?.valid,
        'Valeur:',
        control?.value
      );
      if (control?.errors) {
        console.log(`${key} erreurs:`, control.errors);
      }
    });

    console.log('État de this.cvFile:', this.cvFile);
    console.log('Validité du formulaire:', this.registrationForm.valid);
    console.log('État de this.cvFile:', this.cvFile);

    if (this.isAddNote && this.registrationForm.valid && this.userProfileId) {
      // Si le formulaire est valide, procède à la modification.
      const payload = this.registrationForm.value; // Récupère les données du formulaire.
      const userId = this.userProfileId;

      // Utilisation de formData pour l'appel API
      this.userService.updateCandidateNoteInterview(userId, payload).subscribe({
        next: (response: ApiResponse) => {
          response.data as SignupResponse;
          // Gestion de la réponse réussie
          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '300px',
            data: {
              title: 'Modification réussie',
              message: `La note de l'enteretien a été ajoutée avec succès.`,
              buttons: [
                { text: 'Fermer', value: 'close', class: 'cancel-button' },
              ],
              messageClass: 'message-success',
            },
          });
          // Après la fermeture du dialogue
          dialogRef.afterClosed().subscribe((result) => {
            if (result === 'close') {
              this.initializeForm(); // Réinitialiser le formulaire
              this.dialogRef.close();
          //    location.reload();
            }
          });
        },
         // Gestion de l'erreur
         error: (errorResponse: ApiResponse) => {
          // Utilisation de la classe Base "handleError" pour gérer les erreurs
          this.errorMessage = this.handleError(errorResponse);

          // Affiche le dialogue d'erreur avec le message d'erreur
          this.showRegisterAppointmentErrorDialog(
            this.errorMessage ?? 'Une erreur inconnue est survenue.'
          );
        },
      });
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@  Validateur personnalisé pour vérifier la présence d'un fichier @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  isFileRequired(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      // La vérification se concentre uniquement sur la présence d'une valeur
      // ce qui indiquerait qu'un fichier a été sélectionné.
      if (control.value && control.value !== '') {
        return null; // Aucune erreur, un fichier semble avoir été sélectionné
      } else {
        // Aucun fichier n'a été sélectionné
        return { requiredFile: true };
      }
    };
  }

  // @@@@@@@@@@@@  // Cette méthode est déclenchée lorsqu'un utilisateur sélectionne un fichier dans le champ de saisie du fichier CV. @@@@@@@@@@@@@@@@@@@@@@
  onFileSelected(event: Event): void {
    // On récupère l'input de type fichier à partir de l'événement déclenché.
    const input = event.target as HTMLInputElement;

    // On vérifie si un fichier a été sélectionné.
    if (input.files && input.files.length) {
      // On prend le premier fichier sélectionné [0]
      const file = input.files[0];
      let errorFlag = false; // Un indicateur pour suivre si des erreurs de validation ont été trouvées.

      // On vérifie si le fichier est au format PDF.
      if (file.type !== 'application/pdf') {
        // Si le fichier n'est pas un PDF, on définit une erreur sur le champ 'cv'.
        this.registrationForm.get('cv')?.setErrors({ invalidFileType: true });
        errorFlag = true; // On met à jour l'indicateur d'erreur.
      }
      // On vérifie si la taille du fichier est inférieure à 5MB.
      if (file.size > 5 * 1024 * 1024) {
        // Si le fichier est plus grand que 5MB, on définit une autre erreur sur le champ 'cv'.
        this.registrationForm.get('cv')?.setErrors({ fileSizeExceeded: true });
        errorFlag = true; // On met à jour l'indicateur d'erreur.
      }

      // Si aucun drapeau d'erreur n'a été levé, le fichier est valide.
      if (!errorFlag) {
        // On assigne le fichier sélectionné à 'this.cvFile' pour qu'il puisse être soumis avec le formulaire.
        this.cvFile = file;

        // On met à jour le champ 'cv' du formulaire avec le nom du fichier, pour l'afficher dans l'interface utilisateur.
        this.registrationForm.patchValue({ cv: file.name });
      }
    } else {
      // Si aucun fichier n'a été sélectionné, on définit une erreur de 'fichier requis' sur le champ 'cv'.
      this.registrationForm.get('cv')?.setErrors({ requiredFile: true });
    }
  }

  // Méthode pour afficher un message d'erreur dans une snackbar.
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
  get jobTitleId() {
    return this.registrationForm.get('jobTitleId');
  }
  get experienceId() {
    return this.registrationForm.get('experienceId');
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
  get address() {
    return this.registrationForm.get('address');
  }
  get interviewNote() {
    return this.registrationForm.get('interviewNote');
  }
  
  get cv() {
    return this.registrationForm.get('cv');
  }

  generateNoteText(): { plainText: string, htmlText: string } {
    const plainText = `
  Note de l'entretien :
  
  Candidat : Le candidat
  Date de l'entretien : ${new Date().toLocaleDateString()}
  Poste : Développeur Fullstack Angular
  
  Résumé de l'entretien :
  Nous avons récemment mené un entretien avec le candidat pour le poste de Développeur Fullstack Angular. Voici un résumé de ses compétences et de son expérience :
  
  Compétences techniques :
  - Solide expertise en Angular pour le développement front-end.
  - Bonne maîtrise de Node.js et Express pour le développement back-end.
  - Expérience significative avec les bases de données SQL et NoSQL.
  - Capacité à écrire du code propre, maintenable et bien documenté.
  
  Expérience professionnelle :
  - Plusieurs années d'expérience en tant que développeur fullstack.
  - A travaillé sur plusieurs projets de grande envergure chez des entreprises réputées.
  - A démontré une capacité à collaborer efficacement en équipe et à livrer des projets dans les délais.
  
  Qualités personnelles :
  - Excellentes compétences en communication.
  - Proactif, motivé et doté d'une forte éthique de travail.
  - Capable de s'adapter rapidement à de nouveaux environnements et technologies.
  
  Recommandation :
  En conclusion, le candidat est un développeur fullstack Angular compétent et expérimenté. Je recommande fortement son embauche pour ce poste.
  
  Signature :
  [Votre Nom]
  Consultant en recrutement informatique
  [Votre Société]
  [Votre Email]
  [Votre Téléphone]`;
  
    const htmlText = plainText.replace(/\n/g, '<br>');
  
    return { plainText, htmlText };
  }
  
  

  // Rendre visible le mot de passe à l'utilisateur
  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  redirectToHome() {
    this.router.navigate(['/home']); // Redirige vers la page d'accueil
  }
 
  
  // Désabonnement pour éviter les fuites de mémoire
  ngOnDestroy(): void {
    // Signale la désinscription
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

 

 
}
