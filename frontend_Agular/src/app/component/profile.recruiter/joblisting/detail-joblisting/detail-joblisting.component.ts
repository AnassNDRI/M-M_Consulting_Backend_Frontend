import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe, CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  Optional,
} from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, Subject, Subscription, of, switchMap, takeUntil } from 'rxjs';
import { MaterialModule } from '../../../../../module/Material.module';
import { JobApplications, JobListings, Users } from '../../../../models';
import { ApiResponse } from '../../../../shared/model';
import { DateWithSuffixPipe } from '../../../../shared/pipe/date-with-suffix.pipe';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';
import { MenuheaderComponent } from '../../../menuheader/menuheader.component';
import { JobApplicationPayload } from '../../../security/model/payload/indexPayload';
import { ApiResponseWithCount } from '../../../security/securityIndex';
import { AuthentificationService } from '../../../security/service/authServiceIndex';
import {
  DataService,
  JobapplicationService,
  JoblistingService,
  OthersTablesService,
  SavejobService,
  UserService,
} from '../../../service';
import { VisibilityStateManagerService } from '../../../service/visibilityStateManager.service';
import { HandleErrorBase } from '../../../shared/HandleErrorBase';
import { AddjoblistingComponent } from '../addjoblisting/addjoblisting.component';

@Component({
  selector: 'app-detail-joblisting',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    MaterialModule,
    MenuheaderComponent,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    AsyncPipe,
    DateWithSuffixPipe,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './detail-joblisting.component.html',
  styleUrl: './detail-joblisting.component.css',
})
export class DetailJoblistingComponent
  extends HandleErrorBase
  implements OnInit, OnDestroy
{
  private unsubscribe$ = new Subject<void>();
  private subscriptions = new Subscription();

  noteJoblistingForm!: FormGroup; //  Initialiser FormGroup avant son utilisation.
  assingnJoblistingForm!: FormGroup; //  Initialiser FormGroup avant son utilisation.
  registrationDeadlineForm!: FormGroup; //  Initialiser Deadline de FormGroup avant son utilisation.
  isFormVisible: boolean = false; // Pour rendre le formulaire de saisie de notre visible
  isAssignFormVisible: boolean = false; // Pour rendre le formulaire de saisie de notre visible
  isDivVisible: boolean = true; // Pour rendre la div des butons visble
  hasAlreadyApplied: boolean = true; // si le candidat a deja Postulé

  UpdateJoblisting: boolean = false;
  updateJoblistindDeadline: boolean = false;

  errorMessage: string | null = null; // Pour stocker le message d'erreur
  jobListing?: JobListings;
  jobApllication?: JobApplications;
  collaborators: Users[] = [];
  jobListingId: number | null | undefined;
  isRecruiter: boolean = false; // Indique si l'utilisateur est recruteur
  isCandidate: boolean = false; // Indique si l'utilisateur est candidat
  isAdmin: boolean = false; // Indique si l'utilisateur est un Admin
  isConsultant = false; // Indique si l'utilisateur est un consultant
  isAuthenticated: boolean = false; // État d'authentification initial de l'utilisateur
  isValided: boolean = true; //  vérifie l'état "validate" du jobListing
  currentUserId: number | null | undefined;
  theRecruiter: number | null | undefined;
  isOwner: boolean = false; // Indique s'il est proprietaire de l'offre affichée

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private jobListingService: JoblistingService,
    private jobApplicationService: JobapplicationService,
    private authService: AuthentificationService,
    private visibilityStateManagerService: VisibilityStateManagerService,
    public translateService: TranslateService,
    private dialog: MatDialog,
    private othersTablesService: OthersTablesService,
    private cdr: ChangeDetectorRef,
    private dataService: DataService,
    private userService: UserService,
    private saveJobService: SavejobService,
    private observer: BreakpointObserver,
    private mediaObserver: MediaObserver,
    @Optional() private dialogRef: MatDialogRef<DetailJoblistingComponent>
  ) {
    super(translateService);
  }

  // Méthode ngOnInit appelée à l'initialisation du composant.
  ngOnInit(): void {
    this.initializeAssignForm();
    this.subscribeToJobListingId(); // S'abonne aux changements de l'ID du jobListing dans l'URL
    this.subscribeToAuthState(); // S'abonne aux changements de l'état d'authentification
    this.fetchCollaborators();
    // Initialisation du formulaire et chargement des données nécessaires
    this.initializeForm();
   
  }


  // Initialisation du formulaire avec des champs et des validations.
  initializeAssignForm(): void {
    this.assingnJoblistingForm = this.formBuilder.group({
      userId: ['', [Validators.required]],
    });
  }

  get userId() {
    return this.assingnJoblistingForm.get('userId');
  }

    // Initialisation du formulaire avec des champs et des validations.
    initializeForm(): void {
      this.noteJoblistingForm = this.formBuilder.group({
        noteJoblisting: [
          '',
          [
            Validators.required,
            Validators.minLength(20),
            Validators.maxLength(1000),
          ],
        ],
      });
    }
  
    get noteJoblisting() {
      return this.noteJoblistingForm.get('noteJoblisting');
    }



    // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Validation d'une annonce publiée par le recruiteur, (Consultant) @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
validateJobPublished() {
  // On vérifie si l'utilisateur est authentifié.
  this.authService.getIsAuthenticated().subscribe((isAuthenticated) => {
    if (!isAuthenticated) {
      // Redirection vers la page de connexion si l'utilisateur n'est pas authentifié
      const currentUrl = this.router.url;
      this.router.navigate(['/signin'], {
        queryParams: { returnUrl: currentUrl },
      });
    } else {
      if (!this.isAdmin && !this.isConsultant) {
        // Affichage d'un message si l'utilisateur n'a pas les droits nécessaires
        this.showNotAllowedToValidateDialog();
        return; // Important : arrête l'exécution si l'utilisateur n'a pas les droits
      } else if (this.jobListing && this.jobListing.jobListingId) {
        const jobListingId = this.jobListing.jobListingId;
        const payload = { validate: true }; // On définit la valeur directement dans le payload

        // Demande de confirmation avant validation
        this.showConfirmDemandBeforValidateDialog().subscribe(confirmDialogRef => {
          // Gestion de la réponse de la boîte de dialogue de confirmation
          confirmDialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
              // Vérification que l'utilisateur a confirmé la suppression
              this.jobListingService
                .validateJobPublished(jobListingId, payload)
                .subscribe({
                  next: (response: ApiResponse) => {
                    this.showValidateSuccessDialog(); // Affichage du succès de la suppression
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
          });
        });
      }
    }
  });
}

  
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Postuler à une annonce (jobListing) par un candidat @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  applyForJob(): void {
    // Premièrement, s'abonner à l'état d'authentification pour vérifier si l'utilisateur est connecté.
    this.authService.getIsAuthenticated().subscribe((isAuthenticated) => {
      // On vérifie si l'utilisateur est connecté.
      if (!isAuthenticated) {
        console.log(` 1: je pars vers la connection:`);
        // Si l'utilisateur n'est pas connecté, on  le rediriger vers la page de connexion.
        const currentUrl = this.router.url; // On stocke l'URL actuelle pour un retour après connexion.
        console.log(` 2: je viens de :`, currentUrl);
        this.router.navigate(['/signin'], {
          queryParams: { returnUrl: currentUrl },
        });
      } else {
        console.log(` 3: je viens connecté :`, this.isAuthenticated);
        // Si l'utilisateur est connecté, on vérifie ensuite s'il a le rôle de candidat.
        if (!this.isCandidate) {
          console.log(`4: je ne suis pas un candidate :`);
          // Si l'utilisateur n'est pas un candidat, on affiche un message d'erreur. via une boîte de dialogue.
          this.showNotAllowedDialog();
        } else {
          console.log(`5: je connecté et candidate :`, this.isCandidate);

          // L'utilisateur est connecté et a le rôle de candidat, procéder à la postulation.
          console.log(`6: j'ai le Id:`, this.jobListing?.jobListingId);
          // Vérifier que l'ID du jobListing est défini.
          if (this.jobListing && this.jobListing.jobListingId) {
            console.log(
              `7: je rentre le if avec le Id:`,
              this.jobListing?.jobListingId
            );
            const payload: JobApplicationPayload = {
              jobListingId: this.jobListing.jobListingId,
            };

            this.jobApplicationService.createJobApplication(payload).subscribe({
              next: (response: ApiResponse) => {
                // La postulation a été soumise avec succès, afficher une boîte de dialogue de confirmation.
                this.showApplySuccessDialog();
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
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Updating Deadline @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // Méthode pour la connexion de l'utilisateur.
  updatingDeadline(): void {
    console.log('Tentative de soumission du formulaire de candidature.');
    console.log('Valeurs du formulaire:', this.registrationDeadlineForm.value);
    console.log('Validité du formulaire:', this.registrationDeadlineForm.valid);

    // Affiche des détails sur les erreurs de validation si le formulaire n'est pas valide
    // Imprimez l'état de validation de chaque champ
    Object.keys(this.registrationDeadlineForm.controls).forEach((key) => {
      const control = this.registrationDeadlineForm.get(key);
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

    console.log('Validité du formulaire:', this.registrationDeadlineForm.valid);

    const payload = {
      // On récupère la valeur du champ de formulaire
      deadline: this.registrationDeadlineForm.get('deadline')?.value,
    };
    const jobListingId = this.jobListing?.jobListingId;

    if (this.registrationDeadlineForm.valid) {
      if (jobListingId) {
        // Remplacement de payload par submissionData pour l'appel API
        this.jobListingService
          .updateJobDeadline(jobListingId, payload)
          .subscribe({
            next: (response: ApiResponse) => {
              // Gestion de la réponse réussie
              const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                width: '300px',
                data: {
                  title: 'Modification réussi !',
                  message: `Votre date limite de postulation a été modifiée avec succes.`,
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
    } else {
      // Marque tous les contrôles comme 'touched' pour afficher les messages d'erreur
      Object.values(this.registrationDeadlineForm.controls).forEach(
        (control) => {
          control.markAsTouched();
        }
      );
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Suppression d'une annonce par le consultant ou le proprietaire @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
deleteMyJobListingOrDeleteByConsultant() {
  // On vérifie si l'utilisateur a les droits nécessaires pour supprimer l'annonce.
  if (
    !this.isAdmin &&
    !this.isConsultant &&
    !this.isRecruiter &&
    this.currentUserId !== this.jobListing?.userId
  ) {
    // Si non autorisé, on affiche une boîte de dialogue d'alerte.
    this.showNotAllowedToDeleteDialog();
  } else if (this.jobListing && this.jobListing.jobListingId) {
    const joblistingId = this.jobListing.jobListingId;

    // On demande de confirmation avant de procéder à la suppression.
    this.showConfirmDemandBeforDeleteDialog().subscribe(confirmDialogRef => {
      // On gère la réponse de la boîte de dialogue de confirmation.
      confirmDialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          // L'utilisateur confirme la suppression, on procède.
          this.jobListingService
            .deleteJobListingByConsultant(joblistingId)
            .subscribe({
              next: (response: ApiResponse) => {
                // Affichage d'une boîte de dialogue de succès.
                this.showDeleteSuccessDialog();
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
        // Si l'utilisateur annule, l'action est avortée et aucune autre action n'est entreprise.
      });
    });
  }
}

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Demande de modification ou correction au recruteur avant validation, (Consultant) @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
updateRequestToRecruiter() {
  // Vérifier d'abord si le formulaire est valide
  if (this.noteJoblistingForm.valid) {
    this.authService.getIsAuthenticated().subscribe((isAuthenticated) => {
      if (!isAuthenticated) {
        // Redirection vers la page de connexion si l'utilisateur n'est pas authentifié
        const currentUrl = this.router.url;
        this.router.navigate(['/signin'], {
          queryParams: { returnUrl: currentUrl },
        });
      } else {
        if (!this.isAdmin && !this.isConsultant) {
          // Affichage d'un message si l'utilisateur n'a pas les droits nécessaires
          this.showNotAllowedToValidateDialog();
        } else if (this.jobListing && this.jobListing.jobListingId) {
          const jobListingId = this.jobListing.jobListingId;
          const payload = {
            validate: false,
            // On récupère la valeur du champ de formulaire
            noteJoblisting: this.noteJoblistingForm.get('noteJoblisting')?.value,
          };
          // Demande de confirmation avant
          this.showDemandUpdateDialog().subscribe(confirmDialogRef => {
            // Gestion de la réponse de la boîte de dialogue de confirmation
            confirmDialogRef.afterClosed().subscribe((result) => {
              if (result === true) {
                // Vérification que l'utilisateur a confirmé
                this.jobListingService
                  .validateJobPublished(jobListingId, payload)
                  .subscribe({
                    next: (response: ApiResponse) => {
                      this.showUpdateDemandSuccessDialog(); // Affichage du succès
                      this.noteJoblistingForm.reset(); // Réinitialisation du formulaire
                      this.isFormVisible = false; // Rendre le formulaire invisible
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
            });
          });
        }
      }
    });
  } else {
    // Marque le contrôle comme 'touched' pour afficher les messages d'erreur
    Object.values(this.noteJoblistingForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }
}







  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  // Méthode pour invalider et supprimer une annonce par un consultant ou un administrateur @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
invalidateJobListingToDeleteByConsultant() {
  // On vérifie si l'utilisateur est authentifié.
  this.authService.getIsAuthenticated().subscribe((isAuthenticated) => {
    if (!isAuthenticated) {
      // Redirection vers la page de connexion si l'utilisateur n'est pas authentifié
      const currentUrl = this.router.url;
      this.router.navigate(['/signin'], {
        queryParams: { returnUrl: currentUrl },
      });
    } else {
      if (!this.isAdmin && !this.isConsultant) {
        // Affichage d'un message si l'utilisateur n'a pas les droits nécessaires
        this.showNotAllowedIsNotAdminDialog();
        return; // Important : arrête l'exécution si l'utilisateur n'a pas les droits
      } else if (this.jobListing && this.jobListing.jobListingId) {
        const jobListingId = this.jobListing.jobListingId;
        const payload = { invalidatyToDelete: true }; // On définit la valeur directement dans le payload

        // Demande de confirmation avant suppression
        this.showConfirmDemandBeforDeleteDialog().subscribe(confirmDialogRef => {
          // Gestion de la réponse de la boîte de dialogue de confirmation
          confirmDialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
              // Vérification que l'utilisateur a confirmé la suppression
              this.jobListingService
                .invalidateDeleteJobPublished(jobListingId, payload)
                .subscribe({
                  next: (response: ApiResponse) => {
                    this.showDeleteSuccessDialog(); // Affichage du succès de la suppression
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
          });
        });
      }
    }
  });
}


  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  assignation de taches (Suivi) d'une offre a un autre consultant @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
assignJobListingToConsultant() {
  // Vérifier d'abord si le formulaire est valide
  if (this.assingnJoblistingForm.valid) {
    if (!this.isAdmin) {
      // Affichage d'un message si l'utilisateur n'a pas les droits nécessaires
      this.showNotAllowedToAssignDialog();
    } else if (this.jobListing && this.jobListing.jobListingId) {
      const jobListingId = this.jobListing.jobListingId;

      const payload = {
        // On récupère la valeur du champ de formulaire
        userId: this.assingnJoblistingForm.get('userId')?.value,
      };

      // Demande de confirmation avant
      this.showDemandAssignationDialog().subscribe(confirmDialogRef => {
        // Gestion de la réponse de la boîte de dialogue de confirmation
        confirmDialogRef.afterClosed().subscribe((result) => {
          if (result === true) {
            console.log('LA VALEUR DU JOBID : ', jobListingId);
            console.log('LA VALEUR DU CONSULTANTID : ', payload);
            // Vérification que l'utilisateur a confirmé
            this.saveJobService
              .assignJobListingToConsultant(jobListingId, payload)
              .subscribe({
                next: (response: ApiResponse) => {
                  this.showUpdateDemandSuccessDialog(); // Affichage du succès
                  this.assingnJoblistingForm.reset(); // Réinitialisation du formulaire
                  this.isAssignFormVisible = false; // Rendre le formulaire invisible
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
        });
      });
    }
  } else {
    // Marque le contrôle comme 'touched' pour afficher les messages d'erreur
    Object.values(this.noteJoblistingForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }
}



  // Mise à jour du job listing avant publication:
  updateJobListingBeforePublished() {
    if (this.jobListing) {
      this.openPopup({
        code: 0,
        title: 'Update Job Listing',
        jobListingData: this.jobListing,
        type: 'updateListing',
      });
    } else {
      // Gérer le cas où jobListing est undefined
      console.error(
        `Erreur mise à joiur de l'annonce: Les données ne sont pas disponibles.`
      );
    }
  }

  // Mise à jour de l'échéance:
  updateDeadline() {
    if (this.jobListing) {
      this.openPopup({
        code: 0,
        title: 'Update Job Listing Deadline',
        jobListingData: this.jobListing,
        type: 'updateDeadline',
      });
    } else {
      // Gérer le cas où jobListing est undefined
      console.error(
        `Erreur mise à jour de la date limite: Les données ne sont pas disponibles.`
      );
    }
  }

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  // Méthode pour invalider et supprimer une annonce par un consultant ou un administrateur @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
activeThisJobListing() {
  // On vérifie si l'utilisateur est authentifié.
  if (this.jobListingId) {
    const jobListingToCloseId = this.jobListingId;
    const payload = { jobClose: false }; // On définit la valeur directement dans le payload

    // Demande de confirmation avant suppression
    this.showDemandReactivationDialog().subscribe(confirmDialogRef => {
      // Gestion de la réponse de la boîte de dialogue de confirmation
      confirmDialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          // Vérification que l'utilisateur a confirmé la suppression
          this.jobListingService
            .reactivationJoblisting(jobListingToCloseId, payload)
            .subscribe({
              next: (response: ApiResponse) => {
                this.showActivationSuccessDialog(); // Affichage du succès de la suppression
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
      });
    });
  }
}


  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  les Collaborateurs @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  private fetchCollaborators() {
    this.othersTablesService.collaboratorsList().subscribe({
      next: (response: ApiResponseWithCount) => {
        if (response.result && Array.isArray(response.data)) {
          this.collaborators = response.data as Users[];
          console.log(' COLLABORATEURS : ', this.collaborators);
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

  private openPopup(data: {
    code: number;
    title: string;
    jobListingData: JobListings;
    type: string;
  }) {
    this.dialog.open(AddjoblistingComponent, {
      width: 'auto',
      height: 'auto',
      enterAnimationDuration: '1000ms',
      exitAnimationDuration: '1000ms',
      disableClose: true,
      data: data, // Passer tout l'objet de données
    });
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   MES METHODES PRIVEES $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Souscription aux paramètres de la route pour récupérer l'ID du jobListing.
  private subscribeToJobListingId(): void {
    this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe((params) => {
      const joblistingId = +params['jobListingId']; // Convertit le paramètre en nombre
      if (joblistingId) {
        this.fetchJobListing(joblistingId); // Récupère les détails du jobListing si l'ID est valide
      }
    });
  }
  //// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Souscription à l'état d'authentification de l'utilisateur. // @@@@@@@@@@@@@@@@
  private subscribeToAuthState(): void {
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isAuthenticated) => {
        this.isAuthenticated = isAuthenticated; // Met à jour l'état d'authentification
        this.isRecruiter = this.authService.isRecruiter; // Met à jour si l'utilisateur est un recruteur
        this.isAdmin = this.authService.isAdmin; // Met à jour si l'utilisateur est un admin

        
        this.isConsultant = this.authService.isConsultant; // Met à jour si l'utilisateur est un admin
        this.isCandidate = this.authService.isCandidate; // Met à jour si l'utilisateur est un candidate
        this.currentUserId = this.authService.getCurrentUserId();
        this.theRecruiter = this.authService.getRecruiterId(); // par defaut pour checker le recruiter proprietaire de l'emploi
        this.cdr.detectChanges(); // Détecte les changements (utile si les mises à jour ne sont pas détectées automatiquement)
        
       
      });
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  les Details d'un JobLisntings @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // Méthode pour récupérer les détails d'un jobListing à partir de son ID.
  private fetchJobListing(joblistingId: number): void {
    this.jobListingService.jobListingDetail(joblistingId).subscribe({
      next: (response: ApiResponse) => {
        this.jobListing = response.data as JobListings;
        this.isOwner = this.jobListing.userId === this.currentUserId;
        this.isValided = this.jobListing.validate ?? false;

        this.jobListingId = this.jobListing.jobListingId;

        // Réinitialisation de hasAlreadyApplied
        this.hasAlreadyApplied = false;

        // Vérification si l'utilisateur actuel a déjà postulé
        if (
          this.jobListing.jobApplications &&
          this.jobListing.jobApplications.length > 0
        ) {
          this.hasAlreadyApplied = this.jobListing.jobApplications.some(
            (app) => app.user.userId === this.currentUserId
          );
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
  //////***************************************************************************************************** */
  private verifyAuthenticationAndRedirect(): void {
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isAuthenticated) => {
        if (!isAuthenticated) {
          // Si non authentifié, on redirige vers la page de connexion.
          const currentUrl = this.router.url;
          this.router.navigate(['/signin'], {
            queryParams: { returnUrl: currentUrl },
          });
        } else {
          // Si authentifié, récupérer l'ID de l'utilisateur et les détails.
          this.currentUserId = this.authService.getCurrentUserId();
          if (this.currentUserId) {
            this.fetchUserProfile();
          }
        }
      });
  }

  private fetchUserProfile() {
    this.userService.me().subscribe({
      next: (response: ApiResponse) => {
        // On traitera les donnees de l'utilisateur ici
        console.log(response);
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
  /*********************************************************************************************************** */
   
  // Méthode pour afficher le dialogue d'erreur après une tentative d'enregistrement échouée
  private showJobListingBackendErrorDialog(errorMessage: string) {
    this.translateService.get([
      'dialog.errorTitle',
      'dialog.closeButton'
    ]).subscribe(translations => {
      const dialogRef =  this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: translations['dialog.errorTitle'],
          message: errorMessage,
          buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
          messageClass: 'message-error',
        },
      });
      // Après la fermeture du dialogue
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'close') {
        // location.reload();
      }
    });
    });
    
  }


  // Méthode pour informer en cas de répétition.
private showDemandAssignationDialog(): Observable<MatDialogRef<ConfirmDialogComponent>> {
  return this.translateService.get([
    'dialog.confirmationRequired',
    'dialog.demandAssignationMessage',
    'dialog.yesButton',
    'dialog.noButton'
  ]).pipe(
    switchMap(translations => {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        disableClose: true,
        data: {
          title: translations['dialog.confirmationRequired'],
          message: translations['dialog.demandAssignationMessage'],
          buttons: [
            { text: translations['dialog.yesButton'], value: true, class: 'confirm-button' },
            { text: translations['dialog.noButton'], value: false, class: 'cancel-button' },
          ],
          messageClass: 'message-warning',
        },
      });
      return of(dialogRef);
    })
  );
}

// Méthode pour demander confirmation avant de procéder à la suppression.
private showConfirmDemandBeforDeleteDialog(): Observable<MatDialogRef<ConfirmDialogComponent>> {
  return this.translateService.get([
    'dialog.confirmationRequired',
    'dialog.deleteOfferMessage',
    'dialog.yesButton',
    'dialog.noButton'
  ]).pipe(
    switchMap(translations => {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        disableClose: true,
        data: {
          title: translations['dialog.confirmationRequired'],
          message: translations['dialog.deleteOfferMessage'],
          buttons: [
            { text: translations['dialog.yesButton'], value: true, class: 'confirm-button' },
            { text: translations['dialog.noButton'], value: false, class: 'cancel-button' },
          ],
          messageClass: 'message-warning',
        },
      });
      return of(dialogRef);
    })
  );
}

// Méthode pour demander confirmation avant de procéder à la validation.
private showConfirmDemandBeforValidateDialog(): Observable<MatDialogRef<ConfirmDialogComponent>> {
  return this.translateService.get([
    'dialog.confirmationRequired',
    'dialog.validateOfferMessage',
    'dialog.yesButton',
    'dialog.noButton'
  ]).pipe(
    switchMap(translations => {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        disableClose: true,
        data: {
          title: translations['dialog.confirmationRequired'],
          message: translations['dialog.validateOfferMessage'],
          buttons: [
            { text: translations['dialog.yesButton'], value: true, class: 'confirm-button' },
            { text: translations['dialog.noButton'], value: false, class: 'cancel-button' },
          ],
          messageClass: 'message-warning',
        },
      });
      return of(dialogRef);
    })
  );
}

// Méthode pour demander confirmation avant de réactiver une offre.
private showDemandReactivationDialog(): Observable<MatDialogRef<ConfirmDialogComponent>> {
  return this.translateService.get([
    'dialog.confirmationRequired',
    'dialog.demandReactivationMessage',
    'dialog.yesButton',
    'dialog.noButton'
  ]).pipe(
    switchMap(translations => {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '300px',
        disableClose: true,
        data: {
          title: translations['dialog.confirmationRequired'],
          message: translations['dialog.demandReactivationMessage'],
          buttons: [
            { text: translations['dialog.yesButton'], value: true, class: 'confirm-button' },
            { text: translations['dialog.noButton'], value: false, class: 'cancel-button' },
          ],
          messageClass: 'message-warning',
        },
      });
      return of(dialogRef);
    })
  );
}












  // Méthode pour informer en cas de repetition.
 // Méthode pour demander confirmation avant de procéder à la modification.
private showDemandUpdateDialog(): Observable<MatDialogRef<ConfirmDialogComponent>> {
  return this.translateService.get([
    'dialog.confirmationRequired',
    'dialog.demandUpdateMessage',
    'dialog.yesButton',
    'dialog.noButton'
  ]).pipe(
    switchMap(translations => {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        disableClose: true,
        data: {
          title: translations['dialog.confirmationRequired'],
          message: translations['dialog.demandUpdateMessage'],
          buttons: [
            { text: translations['dialog.yesButton'], value: true, class: 'confirm-button' },
            { text: translations['dialog.noButton'], value: false, class: 'cancel-button' },
          ],
          messageClass: 'message-warning',
        },
      });
      return of(dialogRef);
    })
  );
}

 
  // Méthode pour afficher le dialogue de succès après suppression
  private showDeleteSuccessDialog() {
    this.translateService.get([
      'dialog.deleteSuccessTitle',
      'dialog.deleteSuccessMessage',
      'dialog.closeButton'
    ]).subscribe(translations => {
      this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        disableClose: true,
        data: {
          title: translations['dialog.deleteSuccessTitle'],
          message: translations['dialog.deleteSuccessMessage'],
          buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
          messageClass: 'message-success',
        },
      }).afterClosed().subscribe(() => {
        if (this.isOwner) {
          this.router.navigate(['/recruiter-profile']);
        } else {
          this.router.navigate(['/home']);
        }
      });
    });
  }
  // Méthode pour afficher le dialogue de succès après Validation
  private showValidateSuccessDialog() {
    this.translateService.get([
      'dialog.validateSuccessTitle',
      'dialog.validateSuccessMessage',
      'dialog.closeButton'
    ]).subscribe(translations => {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        disableClose: true,
        data: {
          title: translations['dialog.validateSuccessTitle'],
          message: translations['dialog.validateSuccessMessage'],
          buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
          messageClass: 'message-success',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'close') {
          location.reload();
        }
      });
    });
  }
  // Méthode pour afficher le dialogue de succès après Validation
  private showActivationSuccessDialog() {
    this.translateService.get([
      'dialog.activationSuccessTitle',
      'dialog.activationSuccessMessage',
      'dialog.closeButton'
    ]).subscribe(translations => {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        disableClose: true,
        data: {
          title: translations['dialog.activationSuccessTitle'],
          message: translations['dialog.activationSuccessMessage'],
          buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
          messageClass: 'message-success',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'close') {
          location.reload();
        }
      });
    });
  }
  // Méthode pour afficher le dialogue de succès après Validation
  private showUpdateDemandSuccessDialog() {
    this.translateService.get([
      'dialog.updateDemandSuccessTitle',
      'dialog.updateDemandSuccessMessage',
      'dialog.closeButton'
    ]).subscribe(translations => {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '250px',
        disableClose: true,
        data: {
          title: translations['dialog.updateDemandSuccessTitle'],
          message: translations['dialog.updateDemandSuccessMessage'],
          buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
          messageClass: 'message-success',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'close') {
          this.initializeForm();
          this.dialogRef.close();
          location.reload();
        }
      });
    });
  }
  // Méthode pour afficher le dialogue de succès après postulation
  private showApplySuccessDialog(): void {
    this.translateService.get([
      'dialog.applySuccessTitle',
      'dialog.applySuccessMessage',
      'dialog.closeButton'
    ]).subscribe(translations => {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        disableClose: true,
        data: {
          title: translations['dialog.applySuccessTitle'],
          message: translations['dialog.applySuccessMessage'],
          buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
          messageClass: 'message-success',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'close') {
          location.reload();
        }
      });
    });
  }
  // Méthode pour afficher le dialogue d'erreur de suppression non autorisée
  private showNotAllowedToDeleteDialog(): void {
    this.translateService.get([
      'dialog.notAllowedToDeleteTitle',
      'dialog.notAllowedToDeleteMessage',
      'dialog.closeButton'
    ]).subscribe(translations => {
      this.dialog.open(ConfirmDialogComponent, {
        width: '300px',
        disableClose: true,
        data: {
          title: translations['dialog.notAllowedToDeleteTitle'],
          message: translations['dialog.notAllowedToDeleteMessage'],
          buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
          messageClass: 'message-error',
        },
      });
    });
  }
  // Méthode pour afficher le dialogue d'erreur de validation non autorisée
  private showNotAllowedToValidateDialog(): void {
    this.translateService.get([
      'dialog.notAllowedToValidateTitle',
      'dialog.notAllowedToValidateMessage',
      'dialog.closeButton'
    ]).subscribe(translations => {
      this.dialog.open(ConfirmDialogComponent, {
        width: '300px',
        disableClose: true,
        data: {
          title: translations['dialog.notAllowedToValidateTitle'],
          message: translations['dialog.notAllowedToValidateMessage'],
          buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
          messageClass: 'message-error',
        },
      });
    });
  }
  // Méthode pour afficher le dialogue d'erreur d'assignation non autorisée
  private showNotAllowedToAssignDialog(): void {
    this.translateService.get([
      'dialog.notAllowedToAssignTitle',
      'dialog.notAllowedToAssignMessage',
      'dialog.closeButton'
    ]).subscribe(translations => {
      this.dialog.open(ConfirmDialogComponent, {
        width: '300px',
        disableClose: true,
        data: {
          title: translations['dialog.notAllowedToAssignTitle'],
          message: translations['dialog.notAllowedToAssignMessage'],
          buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
          messageClass: 'message-error',
        },
      });
    });
  }
  // Méthode pour afficher le dialogue d'erreur de suppression non autorisée pour non admin
  private showNotAllowedIsNotAdminDialog(): void {
    this.translateService.get([
      'dialog.notAllowedIsNotAdminTitle',
      'dialog.notAllowedIsNotAdminMessage',
      'dialog.closeButton'
    ]).subscribe(translations => {
      this.dialog.open(ConfirmDialogComponent, {
        width: '300px',
        disableClose: true,
        data: {
          title: translations['dialog.notAllowedIsNotAdminTitle'],
          message: translations['dialog.notAllowedIsNotAdminMessage'],
          buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
          messageClass: 'message-error',
        },
      });
    });
  }
  // Méthode pour afficher le dialogue d'erreur de postulation non autorisée
  private showNotAllowedDialog(): void {
    this.translateService.get([
      'dialog.notAllowedTitle',
      'dialog.notAllowedMessage',
      'dialog.closeButton'
    ]).subscribe(translations => {
      this.dialog.open(ConfirmDialogComponent, {
        width: '300px',
        disableClose: true,
        data: {
          title: translations['dialog.notAllowedTitle'],
          message: translations['dialog.notAllowedMessage'],
          buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
          messageClass: 'message-error',
        },
      });
    });
  }
  
/*
  // Méthode pour afficher le dialogue de succès après Validation
  private showValidateSuccessDialog() {
    this.translateService.get([
      'dialog.validateSuccessTitle',
      'dialog.validateSuccessMessage',
      'dialog.closeButton'
    ]).subscribe(translations => {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
        data: {
          title: translations['dialog.validateSuccessTitle'],
          message: translations['dialog.validateSuccessMessage'],
          buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
          messageClass: 'message-success',
        },
      });

      // Après la fermeture du dialogue
      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'close') {
          location.reload();
        }
      });
    });
  } */

  goBack() {
    if (this.isAdmin || this.isConsultant) {
      this.visibilityStateManagerService.restoreState('dashboardState');
      this.router.navigate(['/dashboard']);
    } else if (this.isRecruiter) {
      this.router.navigate(['/recruiter-profile']);
    } else if (this.isCandidate) {
      this.router.navigate(['/candidate-profile']);
    } else {
      this.router.navigate(['/home']);
    }
  }
  // Méthode ngOnDestroy appelée juste avant que le composant soit détruit.
  ngOnDestroy(): void {
    // Signale la désinscription
    this.unsubscribe$.next();
    this.unsubscribe$.next(); // Envoie un signal pour désabonner toutes les souscriptions
    this.unsubscribe$.complete(); // Marque le sujet comme terminé
  }

  /*
  applyForJob2(): void {
    this.authService.getIsAuthenticated().subscribe((isAuthenticated) => {
      if (!isAuthenticated) {
        const currentUrl = this.router.url;
        this.router.navigate(['/signin'], {
          queryParams: { returnUrl: currentUrl },
        });
      } else {
        if (!this.isCandidate) {
          this.showNotAllowedDialog();
        } else {
          this.createJobApplication();
        }
      }
    });
  } */

  /*
  private createJobApplication(): void {
    if (this.jobListing?.jobListingId) {
      const payload: JobApplicationPayload = {
        jobListingId: this.jobListing.jobListingId,
      };
      this.jobApplicationService.createJobApplication(payload).subscribe({
        next: (response: ApiResponse) => {
          this.showSuccessDialog();
        },
        error: (error) => {
           // Gérer les erreurs de postulation.
           const errorMessage = this.handleError(error);

           this.dialog.open(ConfirmDialogComponent, {
             width: '400px',
             data: {
               title: 'Erreur lors de la postulation',
               message: errorMessage, // Affiche le message d'erreur récupéré.
               buttons: [
                 {
                   text: 'Fermer',
                   value: 'close',
                   class: 'cancel-button',
                 },
               ],
               messageClass: 'message-error',
             },
           });
        },
      });
    } else {
      console.error('ID du jobListing non disponible pour la postulation.');
    }
  }

  openDialog(): void {
    // Ajouter la classe pour bloquer le défilement
    this.toggleScrolling(false);

    const dialogRef = this.dialog.open(DetailJoblistingComponent, {
      // Ajoutez ici des options pour personnaliser la position, si nécessaire
    });

    dialogRef.afterClosed().subscribe((result) => {
      // Réactiver le défilement
      this.toggleScrolling(true);
    });
  }

  private toggleScrolling(enable: boolean): void {
    document.body.style.overflow = enable ? '' : 'hidden';
  } */
}
