import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import {
  FormArray,
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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MaterialModule } from '../../../../../module/Material.module';
import {
  ContractTypes,
  DialogData,
  JobListings,
  JobLocation,
  JobTitle,
  Roles,
} from '../../../../models';
import { Experiences } from '../../../../models/experience.models';
import { ApiResponse } from '../../../../shared/model';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';
import { AuthentificationService } from '../../../security/service/authServiceIndex';
import { DataService } from '../../../service';
import { JoblistingService } from '../../../service/joblisting.service';
import { HandleErrorBase } from '../../../shared/HandleErrorBase';
import { DetailJoblistingComponent } from '../detail-joblisting/detail-joblisting.component';

@Component({
  selector: 'app-addjoblisting',
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
  templateUrl: './addjoblisting.component.html',
  styleUrls: ['./addjoblisting.component.css'],
})
export class AddjoblistingComponent extends HandleErrorBase implements OnInit {
  errorMessage: string | null = null; // Pour stocker le message d'erreur
  registrationForm!: FormGroup; //  Initialiser FormGroup avant son utilisation.
  // Dans votre composant
  jobListing?: JobListings | null;
  jobTitles: JobTitle[] = [];
  experiences: Experiences[] = [];
  jobLocations: JobLocation[] = [];
  contractTypes: ContractTypes[] = [];
  roles: Roles[] = [];

  jobTitlesCount: number | null | undefined; // Nombre de province
  jobLocationsCount: number | null | undefined; // Nombre d'entreprise
  contractTypesCount: number | null | undefined; // Nombre de poste
  experiencesCount: number | null | undefined; // Nombre de Expereience

  title1 = 'Create Joblisting';
  title2 = 'Updating Joblisting Befor Publication';
  title3 = 'Updating Deadline';
  isCreate: boolean = false; // ou true, selon le contexte initial
  isEdit: boolean = false; // ou true, selon le contexte initial
  isEditDeadline: boolean = false; //

  constructor(
    private formBuilder: FormBuilder, // Service Angular pour construire des formulaires réactifs.
    private dialog: MatDialog,
    private authService: AuthentificationService,
    private joblistingService: JoblistingService,
    private router: Router, // Service Angular pour la navigation entre les routes.
 // Service pour l'internationalisation et la traduction des messages.
   public translateService: TranslateService, 
   private dataService: DataService,

    @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() private dialogRef: MatDialogRef<DetailJoblistingComponent>
  ) {
    super(translateService);
    this.processDialogData(data);
  }

  ngOnInit(): void {
    // S'abonner au statut d'authentification de l'utilisateur.
    this.checkAuthentication();
  }

  // On Traite les données reçues du dialogue et configure l'état initial du composant.
  private processDialogData(data: DialogData): void {
    if (data.type === 'updateListing' && data.jobListingData) {
      this.jobListing = data.jobListingData;
      this.isEdit = true;
      console.log(`LE MODE ISEDIT EST ACTIVE`, this.isEdit);
      this.initializeFormWithJobListingData();
    } else if (data.type === 'updateDeadline' && data.jobListingData) {
      this.jobListing = data.jobListingData;

      this.isEditDeadline = true;
      console.log(` LE MODE ISEDITDEALINE EST ACTIVE`, this.isEditDeadline);
      this.initializeFormWithJobListingData();
    } else {
      this.isCreate = true;
      console.log(` LE MODE ISCREATE EST ACTIVEE`, this.isCreate);
      this.initializeForm(); // Pour les nouveaux job listings ou lorsque les données ne sont pas fournies
    }
  }

  //  Vérifie si l'utilisateur est authentifié et initialise le formulaire en conséquence.

  private checkAuthentication(): void {
    this.authService.getIsAuthenticated().subscribe((isAuthenticated) => {
      if (!isAuthenticated) {
        this.router.navigate(['/signin']);
      } else {
        this.initializeFormBasedOnState();
      }
    });
  }

  // Initialise le formulaire basé sur l'état actuel du composant.

  private initializeFormBasedOnState(): void {
    if (this.isEdit) {
      this.initializeFormWithJobListingData();
    } else if (this.isEditDeadline) {
      this.initializeFormWithJobListingData();
      console.log(
        'Mode édition deadline activé avec les données:',
        this.jobListing
      );
    } else {
      this.initializeForm();
    }
    this.subscribeToData();
  }

  initializeFormWithJobListingData() {
    this.registrationForm = this.formBuilder.group({
      jobTitleId: [this.jobListing?.jobTitleId, [Validators.required]],
      jobLocationId: [this.jobListing?.jobLocationId, [Validators.required]],
      contractTypeId: [this.jobListing?.contractTypeId, [Validators.required]],
      experienceId: [this.jobListing?.experienceId, [Validators.required]],
      description: [
        this.jobListing?.description,
        [
          Validators.required,
          Validators.minLength(50),
          Validators.maxLength(2000),
        ],
      ],
      /*
      responsibilities: this.formBuilder.array([this.initDescription()]), // Ajout comme FormArray
      requiredQualifications: this.formBuilder.array([this.initDescription()]), // Ajout comme FormArray
      benefits: this.formBuilder.array([this.initDescription()]), // Ajout comme FormArray
*/
      responsibilities: this.formBuilder.array(
        this.jobListing?.responsibilities
          ? this.jobListing.responsibilities.map((res) =>
              this.initDescription(res)
            )
          : [this.initDescription()]
      ),
      requiredQualifications: this.formBuilder.array(
        this.jobListing?.requiredQualifications
          ? this.jobListing.requiredQualifications.map((qual) =>
              this.initDescription(qual)
            )
          : [this.initDescription()]
      ),
      benefits: this.formBuilder.array(
        this.jobListing?.benefits
          ? this.jobListing.benefits.map((benefit) =>
              this.initDescription(benefit)
            )
          : [this.initDescription()]
      ),
      workingHours: [
        this.jobListing?.workingHours,
        [Validators.required, Validators.pattern(/^([1-9]|[1-3]\d|40)$/)],
      ], // Entre 1 et 40 H/Semaine
      numberOfCandidates: [
        this.jobListing?.numberOfCandidates,
        [Validators.required, Validators.pattern(/^[1-9]$|^10$/)], // Entre 1 et 10 Personnes
      ],
      workingHoursStart: [
        this.jobListing?.workingHoursStart,
        [
          Validators.required,
          Validators.pattern(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
        ],
      ], // Pour "HH:MM" (ex : 18:00)
      workingHoursEnd: [
        this.jobListing?.workingHoursEnd,
        [
          Validators.required,
          Validators.pattern(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
        ],
      ], // Pour "HH:MM" (ex : 18:00)
      startDate: [this.jobListing?.startDate, [Validators.required]],
      salary: [
        this.jobListing?.salary,
        [
          Validators.required,
          Validators.pattern(/^(0|([1-9]\d{0,5}))(\.\d+)?$/),
        ],
      ], //  Pour s'assurer que le salaire n'est pas négatif
      deadline: [this.jobListing?.deadline, [Validators.required]],
    });
  }

  initializeFormWithDeadlineData() {
    this.registrationForm = this.formBuilder.group({
      jobTitleId: [this.jobListing?.jobTitleId, [Validators.required]],
      jobLocationId: [this.jobListing?.jobLocationId, [Validators.required]],
      contractTypeId: [this.jobListing?.contractTypeId, [Validators.required]],
      experienceId: [this.jobListing?.experienceId, [Validators.required]],
      description: [
        this.jobListing?.description,
        [
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(2000),
        ],
      ],

      responsibilities: this.formBuilder.array(
        this.jobListing?.responsibilities
          ? this.jobListing.responsibilities.map((res) =>
              this.initDescription(res)
            )
          : [this.initDescription()]
      ),
      requiredQualifications: this.formBuilder.array(
        this.jobListing?.requiredQualifications
          ? this.jobListing.requiredQualifications.map((qual) =>
              this.initDescription(qual)
            )
          : [this.initDescription()]
      ),
      benefits: this.formBuilder.array(
        this.jobListing?.benefits
          ? this.jobListing.benefits.map((benefit) =>
              this.initDescription(benefit)
            )
          : [this.initDescription()]
      ),
      workingHours: [
        this.jobListing?.workingHours,
        [Validators.required, Validators.pattern(/^([1-9]|[1-3]\d|40)$/)],
      ], // Entre 1 et 40 H/Semaine
      numberOfCandidates: [
        this.jobListing?.numberOfCandidates,
        [Validators.required, Validators.pattern(/^[1-9]$|^10$/)], // Entre 1 et 10 Personnes
      ],
      workingHoursStart: [
        this.jobListing?.workingHoursStart,
        [
          Validators.required,
          Validators.pattern(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
        ],
      ], // Pour "HH:MM" (ex : 18:00)
      workingHoursEnd: [
        this.jobListing?.workingHoursEnd,
        [
          Validators.required,
          Validators.pattern(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
        ],
      ], // Pour "HH:MM" (ex : 18:00)
      startDate: [this.jobListing?.startDate, [Validators.required]],
      salary: [
        this.jobListing?.salary,
        [
          Validators.required,
          Validators.pattern(/^(0|([1-9]\d{0,5}))(\.\d+)?$/),
        ],
      ], //  Pour s'assurer que le salaire n'est pas négatif
      deadline: [this.jobListing?.deadline, [Validators.required]],
    });

    // On Désactive tous les contrôles sauf 'deadline', 'workingHours', 'workingHoursStart', 'workingHoursEnd', et 'startDate'
    Object.keys(this.registrationForm.controls).forEach((key) => {
      if (
        ![
          'deadline',
          'workingHours',
          'workingHoursStart',
          'workingHoursEnd',
          'startDate',
        ].includes(key)
      ) {
        this.registrationForm.get(key)?.disable();
      }
    });
  }

  // Initialisation du formulaire avec des champs et des validations.
  initializeForm(): void {
    this.registrationForm = this.formBuilder.group({
      jobTitleId: [this.jobListing, [Validators.required]],
      jobLocationId: ['', [Validators.required]],
      contractTypeId: ['', [Validators.required]],
      experienceId: ['', [Validators.required]],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(2000),
        ],
      ],

      responsibilities: this.formBuilder.array([this.initDescription()]), // Ajout comme FormArray
      requiredQualifications: this.formBuilder.array([this.initDescription()]), // Ajout comme FormArray
      benefits: this.formBuilder.array([this.initDescription()]), // Ajout comme FormArray

      workingHours: [
        '',
        [Validators.required, Validators.pattern(/^([1-9]|[1-3]\d|40)$/)],
      ], // Entre 1 et 40 H/Semaine
      numberOfCandidates: [
        '',
        [Validators.required, Validators.pattern(/^[1-9]$|^10$/)],
      ],
      workingHoursStart: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
        ],
      ], // Pour "HH:MM" (ex : 18:00)
      workingHoursEnd: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
        ],
      ], // Pour "HH:MM" (ex : 18:00)
      startDate: ['', [Validators.required]],
      salary: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(0|([1-9]\d{0,5}))(\.\d+)?$/),
        ],
      ], //  Pour s'assurer que le salaire n'est pas négatif
      deadline: ['', [Validators.required]],
    });
  }








  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   Methode privée  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  handleJobListingCreating(): void {
    if ( (this.isEdit || this.isEditDeadline)  && this.registrationForm.valid ) {
      // Si le formulaire est valide, procède à la modification.
      this.updateJoblistingBeforPublication();
    }/* else if (this.isEditDeadline && this.registrationForm.valid) {
      this.updateJoblistingAfterPublising();
    } */else if (this.registrationForm.valid) {
      this.createJoblisting();
    } else {
      // Marque tous les contrôles comme 'touched' pour afficher les messages d'erreur
      Object.values(this.registrationForm.controls).forEach((control) => {
        control.markAsTouched();
      });
    }
  }
  /*
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Register Candidate @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // Méthode pour la connexion de l'utilisateur.
  createJoblisting(): void {
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

    console.log('Validité du formulaire:', this.registrationForm.valid);

    // On vérifie l'état d'authentification de l'utilisateur avant de soumettre le formulaire
    this.authService.getIsAuthenticated().subscribe((isAuthenticated) => {
      if (!isAuthenticated) {
        // Rediriger vers la page de connexion ou montrer une alerte
        this.router.navigate(['/signin']);
      } else {
        // Transformation des FormArray en JSON avec types explicites
        const responsibilitiesJSON = JSON.stringify(
          this.registrationForm
            .get('responsibilities')
            ?.value.map((r: { item: string }) => r.item)
        );
        const requiredQualificationsJSON = JSON.stringify(
          this.registrationForm
            .get('requiredQualifications')
            ?.value.map((q: { item: string }) => q.item)
        );
        const benefitsJSON = JSON.stringify(
          this.registrationForm
            .get('benefits')
            ?.value.map((b: { item: string }) => b.item)
        );

        // Conversion des FormArray en prenant en compte la structure des groupes de formulaire
        const submissionData = {
          ...this.registrationForm.value,
          responsibilities: responsibilitiesJSON,
          requiredQualifications: requiredQualificationsJSON,
          benefits: benefitsJSON,
        };

        if (this.registrationForm.valid) {
          // Remplacement de payload par submissionData pour l'appel API
          this.joblistingService.createJobListing(submissionData).subscribe({
            next: (response: ApiResponse) => {
              // Gestion de la réponse réussie
              const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                width: '400px',
                data: {
                  title: 'Enregistrement réussi !',
                  message: `Merci pour votre annonce. Un e-mail vous a été envoyé.
                Nous attirons votre attention que votre annonce 
                sera soumise pour vérification avant publication.`,
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
                  location.reload();
                }
              });
            },
            // Gestion de l'erreur
            error: (errorResponse: ApiResponse) => {
              // Impression de l'erreur dans la console du navigateur
              console.error(`Erreur lors de l'enregistrement:`, errorResponse);

              // Utilisation de la classe Base "handleError" pour gérer les erreurs
              this.errorMessage = this.handleError(errorResponse);
              //  this.isSubmitting = false; // Réactivez le bouton en cas d'erreur
            },
          });
        } else {
          // Marque tous les contrôles comme 'touched' pour afficher les messages d'erreur
          Object.values(this.registrationForm.controls).forEach((control) => {
            control.markAsTouched();
          });
        }
      }
    });
  }*/

  // Crée un groupe de formulaire pour un élément de liste (comme une responsabilité ou une qualification) avec validation.
  initDescription(description: any = '') {
    return this.formBuilder.group({
      item: [
        description,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(1000),
        ],
      ],
    });
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   Methode privée  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // Ajoute une nouvelle responsabilité au formulaire, utilisant `initDescription` pour la structure.
  addResponsibility(): void {
    this.responsibilities.push(this.initDescription());
    console.log(
      'Responsabilité ajoutée, nouvelles valeurs:',
      this.responsibilities.value
    );
  }

  // Ajoute une nouvelle qualification requise, identique à `addResponsibility` dans son fonctionnement.
  addQualification(): void {
    this.requiredQualifications.push(this.initDescription());
  }

  // Ajoute un nouvel avantage, similaire aux méthodes pour responsabilités et qualifications.
  addBenefit(): void {
    this.benefits.push(this.initDescription()); // Accès direct sans '()'
  }

  // Supprime une responsabilité du formulaire basé sur son index.
  removeResponsibility(index: number): void {
    this.responsibilities.removeAt(index);
    console.log(
      'Responsabilité supprimée, nouvelles valeurs:',
      this.responsibilities.value
    );
  }

  // Supprime une qualification requise, similaire à `removeResponsibility` mais pour les qualifications.
  removeQualification(index: number): void {
    this.requiredQualifications.removeAt(index);
  }

  // Supprime un avantage basé sur son index, permettant de gérer la liste des avantages.
  removeBenefit(index: number): void {
    this.benefits.removeAt(index);
  }

  // @@@@@@@@@@@@@@@@@@ Méthode privée pour s'abonner aux données depuis DataService..@@@@@@@@@@@@@@@@@@@@@
  private subscribeToData() {
    // S'abonne aux titres de postes depuis DataService et reçoit les données sous forme d'un objet incluant la liste et le nombre total.
    this.dataService.jobTitles$.subscribe(
      ({ jobTitles, count: jobTitlesCount }) => {
        // Met à jour les propriétés du composant avec les données reçues.
        this.jobTitles = jobTitles; // Liste des titres de postes.
        this.jobTitlesCount = jobTitlesCount; // Nombre total de titres de postes.
      }
    );

    // S'abonne aux titre d'année d'experience depuis DataService.
    this.dataService.experiences$.subscribe(
      ({ experiences, count: experiencesCount }) => {
        // Met à jour les propriétés du composant avec les données reçues.
        this.experiences = experiences; // Liste des titres de postes.
        this.experiencesCount = experiencesCount; // Nombre total de titres de postes.
      }
    );

    // S'abonne aux localisations de postes depuis DataService et reçoit les données sous forme d'un objet incluant la liste et le nombre total.
    this.dataService.jobLocations$.subscribe(
      ({ jobLocations, count: jobLocationsCount }) => {
        // Met à jour les propriétés du composant avec les données reçues.
        this.jobLocations = jobLocations; // Liste des localisations de postes.
        this.jobLocationsCount = jobLocationsCount; // Nombre total de localisations de postes.
      }
    );

    // S'abonne aux types de contrat depuis DataService et reçoit les données sous forme d'un objet incluant la liste et le nombre total.
    this.dataService.contractTypes$.subscribe(
      ({ contractTypes, count: contractTypesCount }) => {
        // Met à jour les propriétés du composant avec les données reçues.
        this.contractTypes = contractTypes; // Liste des types de contrat.
        this.contractTypesCount = contractTypesCount; // Nombre total de types de contrat.
      }
    );
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   Methode privées  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Create a Joblisting @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // Méthode pour la connexion de l'utilisateur.
  private createJoblisting(): void {
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

    console.log('Validité du formulaire:', this.registrationForm.valid);

    // Transformation des FormArray en JSON avec types explicites
    const responsibilitiesJSON = JSON.stringify(
      this.registrationForm
        .get('responsibilities')
        ?.value.map((r: { item: string }) => r.item)
    );
    const requiredQualificationsJSON = JSON.stringify(
      this.registrationForm
        .get('requiredQualifications')
        ?.value.map((q: { item: string }) => q.item)
    );
    const benefitsJSON = JSON.stringify(
      this.registrationForm
        .get('benefits')
        ?.value.map((b: { item: string }) => b.item)
    );

    // Conversion des FormArray en prenant en compte la structure des groupes de formulaire
    const submissionData = {
      ...this.registrationForm.value,
      responsibilities: responsibilitiesJSON,
      requiredQualifications: requiredQualificationsJSON,
      benefits: benefitsJSON,
    };

    if (this.registrationForm.valid) {
      // Remplacement de payload par submissionData pour l'appel API
      this.joblistingService.createJobListing(submissionData).subscribe({
        next: (response: ApiResponse) => {
          // Gestion de la réponse réussie
          this.showCreateJobSuccessDialog();
        },
        // Gestion de l'erreur
        // Gestion de l'erreur
        error: (errorResponse: ApiResponse) => {
          // Utilisation de la classe Base "handleError" pour gérer les erreurs
          this.errorMessage = this.handleError(errorResponse);

          // Affiche le dialogue d'erreur avec le message d'erreur
          this.showJobListingBackendErrorDialog(
            this.errorMessage ?? 'Une erreur inconnue est survenue.'
          );
        },
      });
    }
  }

  // Méthode pour afficher le dialogue d'erreur après une tentative d'enregistrement échouée
  private showBackendErrorDialog(errorMessage: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
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

  // Méthode pour afficher le dialogue de succès apres Validation
private showCreateJobSuccessDialog() {
  this.translateService.get([
    'dialog.successTitle',
    'dialog.createJobSuccessMessage',
    'dialog.closeButton'
  ]).subscribe(translations => {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: translations['dialog.successTitle'],
        message: translations['dialog.createJobSuccessMessage'],
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
}


 // Méthode pour afficher le dialogue de succès apres Validation
private showUpdateJobSuccessDialog() {
  this.translateService.get([
    'dialog.updateJobSuccessTitle',
    'dialog.updateJobSuccessMessage',
    'dialog.closeButton'
  ]).subscribe(translations => {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: translations['dialog.updateJobSuccessTitle'],
        message: translations['dialog.updateJobSuccessMessage'],
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
}


  // Méthode pour afficher le dialogue de succès apres Validation
private showUpdateJobDeadlineSuccessDialog() {
  this.translateService.get([
    'dialog.updateJobSuccessTitle',
    'dialog.updateJobDeadlineSuccessMessage',
    'dialog.closeButton'
  ]).subscribe(translations => {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: translations['dialog.updateJobSuccessTitle'],
        message: translations['dialog.updateJobDeadlineSuccessMessage'],
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
}


  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Updating a JOblisting @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  private updateJoblistingBeforPublication(): void {
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

    console.log('Validité du formulaire:', this.registrationForm.valid);

    // Transformation des FormArray en JSON avec types explicites
    const responsibilitiesJSON = JSON.stringify(
      this.registrationForm
        .get('responsibilities')
        ?.value.map((r: { item: string }) => r.item)
    );
    const requiredQualificationsJSON = JSON.stringify(
      this.registrationForm
        .get('requiredQualifications')
        ?.value.map((q: { item: string }) => q.item)
    );
    const benefitsJSON = JSON.stringify(
      this.registrationForm
        .get('benefits')
        ?.value.map((b: { item: string }) => b.item)
    );

    // Conversion des FormArray en prenant en compte la structure des groupes de formulaire
    const submissionData = {
      ...this.registrationForm.value,
      responsibilities: responsibilitiesJSON,
      requiredQualifications: requiredQualificationsJSON,
      benefits: benefitsJSON,
    };

    const jobListingId = this.jobListing?.jobListingId;

    if (this.registrationForm.valid && (this.isEdit || this.isEditDeadline)) {
      if (jobListingId) {
        // Remplacement de payload par submissionData pour l'appel API
        this.joblistingService
          .updateJobBeforePublished(jobListingId, submissionData)
          .subscribe({
            next: (response: ApiResponse) => {
              // Gestion de la réponse réussie
              if (this.isEdit) {
                this.showUpdateJobSuccessDialog();
              } else if (this.isEditDeadline) {
                this.showUpdateJobDeadlineSuccessDialog();
              }
            },
            // Gestion de l'erreur
            error: (errorResponse: ApiResponse) => {
              // Utilisation de la classe Base "handleError" pour gérer les erreurs
              this.errorMessage = this.handleError(errorResponse);

              // Affiche le dialogue d'erreur avec le message d'erreur
              this.showJobListingBackendErrorDialog(
                this.errorMessage ?? 'Une erreur inconnue est survenue.'
              );
            },
          });
      }
    }
  }




    // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Updating a JOblisting @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  

    private updateJoblistingAfterPublising(): void {
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
    
      const jobListingId = this.jobListing?.jobListingId;
    
      if (this.isEditDeadline && this.registrationForm.valid) {
        const payload = this.registrationForm.value;
    
        if (jobListingId) {
          this.joblistingService
            .updateJobBeforePublished(jobListingId, payload)
            .subscribe({
              next: (response: ApiResponse) => {
                this.showUpdateJobDeadlineSuccessDialog();
              },
              error: (errorResponse: ApiResponse) => {
                this.errorMessage = this.handleError(errorResponse);
                this.showJobListingBackendErrorDialog(
                  this.errorMessage ?? 'Une erreur inconnue est survenue.'
                );
              },
            });
        }
      }
    }
  

  // Méthode pour afficher le dialogue d'erreur après une tentative d'enregistrement échouée
     private showJobListingBackendErrorDialog(errorMessage: string) {
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

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Updating a JOblisting @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@zz

  // @@@@@@@@@@@@@@@@@@ Méthodes pour obtenir facilement l'accès aux champs du formulaire dans le template HTML. @@@@@@@@@@@@@@@@@@@@@

  get jobTitleId() {
    return this.registrationForm.get('jobTitleId');
  }
  get jobLocationId() {
    return this.registrationForm.get('jobLocationId');
  }
  get contractTypeId() {
    return this.registrationForm.get('contractTypeId');
  }
  get description() {
    return this.registrationForm.get('description');
  }
  // Obtient le FormArray pour les responsabilités, permettant des opérations comme l'ajout ou la suppression d'éléments.
  get responsibilities() {
    return this.registrationForm.get('responsibilities') as FormArray;
  }

  // Obtient le FormArray pour les qualifications requises.
  get requiredQualifications() {
    return this.registrationForm.get('requiredQualifications') as FormArray;
  }
  // Obtient le FormArray pour les avantages, similaire aux responsabilités et qualifications.
  get benefits() {
    return this.registrationForm.get('benefits') as FormArray;
  }
  get workingHours() {
    return this.registrationForm.get('workingHours');
  }
  get workingHoursStart() {
    return this.registrationForm.get('workingHoursStart');
  }
  get workingHoursEnd() {
    return this.registrationForm.get('workingHoursEnd');
  }
  get startDate() {
    return this.registrationForm.get('startDate');
  }
  get salary() {
    return this.registrationForm.get('salary');
  }
  get deadline() {
    return this.registrationForm.get('deadline');
  }
  get numberOfCandidates() {
    return this.registrationForm.get('numberOfCandidates');
  }
  get experienceId() {
    return this.registrationForm.get('experienceId');
  }
  redirectToHome() {
    this.router.navigate(['/home']); // Redirige vers la page d'accueil
  }
  redirectToJobListing() {
    this.router.navigate(['/job-list']); // Redirige vers la page d'accueil
  }
}
