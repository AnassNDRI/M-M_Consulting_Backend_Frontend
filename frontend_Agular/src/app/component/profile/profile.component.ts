import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { MaterialModule } from '../../../module/Material.module';
import { JobApplications, JobListings, Users } from '../../models';
import { ApiResponse } from '../../shared/model';
import { DateWithSuffixPipe } from '../../shared/pipe/date-with-suffix.pipe';
import { RegisterCollaboratorComponent } from '../administrator/register-collaborator/register-collaborator.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MenuheaderComponent } from '../menuheader/menuheader.component';
import { CandidateCvViewerComponentComponent } from '../profile.candidate/candidate-cv-viewer-component/candidate-cv-viewer-component.component';
import { RegisterCandidateComponent } from '../register-candidate/register-candidate.component';
import { RegisterRecruiterComponent } from '../register-recruiter/register-recruiter.component';
import {
  JobApplicationPayload,
  UpdatePayload,
} from '../security/model/payload/indexPayload';
import { SignupResponse } from '../security/model/response/indexResponse';
import { AuthentificationService } from '../security/securityIndex';
import {
  DataService,
  JobapplicationService,
  JoblistingService,
  SavejobService,
  UserService,
} from '../service';
import { HandleErrorBase } from '../shared/HandleErrorBase';
import { VisibilityStateManagerService } from '../service/visibilityStateManager.service';

@Component({
  selector: 'app-profile',
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
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent
  extends HandleErrorBase
  implements OnInit, OnDestroy
{
  private unsubscribe$ = new Subject<void>();

  returnUrl!: string;
  managerUsersBloc!: boolean;

  noteInscriptionForm!: FormGroup; //  Initialiser FormGroup avant son utilisation.
  registrationForm!: FormGroup; //  Initialiser FormGroup avant son utilisation.
  cvFile: File | null = null;

  user?: Users;
  userProfileId: number | null | undefined;
  errorMessage: string | null = null; // Pour stocker le message d'erreur

  isOwnerProfile: boolean = false; // Indique s'il est proprietaire du profile
  isManager: boolean = false; // Indique si l'utilisateur est un Admin
  isConsultant: boolean = false;
  isAdministrator: boolean = false;
  isImmutableCollaborator: boolean = false;
  isCandidate: boolean = false; // Indique si l'utilisateur est candidat
  isCurrentCandidate: boolean = false;
  isCurrentAdmin: boolean = false; 
  isCurrentConsultant: boolean = false;
  isCurrentManager: boolean = false;
  isCurrentRecruiter: boolean = false;
  descriptionDisplay: boolean = false;
  isAddedNoteInterview: boolean = false;
  interviewNoteDisplay: boolean = true; // pour controler la visibilité de la noite d'entretien
  isCandidateInterviewNote: boolean = false; 
  showInterviewNote = false;
  cvDisplay: boolean = false;

  isValided: boolean = false;

  isFormVisible = false; // Pour rendre le formulaire de saisie de notre visible
  isDivVisible = true; // Pour rendre la div des butons visble

  isCvFormVisible = false; // Pour rendre le formulaire de saisie de notre visible

  isCandidateCvBtn = false; // Pour rendre le formulaire de saisie de notre visible
  isCvBtnVisible = true; // Pour rendre le buton de modification de cv visble
  isBarVisible = true; // Pour rendre le buton de modification de cv visble

  notificationControl = new FormControl(true);

  jobListing?: JobListings;
  jobApllication?: JobApplications;
  jobListingId: number | null | undefined;
  isRecruiter: boolean = false; // Indique si l'utilisateur est recruteur

  isAdmin: boolean = false; // Indique si l'utilisateur est un Admin
  theRecruiterId: number | null | undefined;

  isAuthenticated: boolean = false; // État d'authentification initial de l'utilisateur
  currentUserId: number | null | undefined;

  userWhitInterviewNoteId: number | null | undefined;

  theConsultantId: number | null | undefined;
  theAdminId: number | null | undefined;

  isOwnerConsultant: boolean = false;
  isOwnerAdmin: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private jobListingService: JoblistingService,
    private jobApplicationService: JobapplicationService,
    private authService: AuthentificationService,
    private userService: UserService,
    public visibilityStateManagerService: VisibilityStateManagerService,
    translateService: TranslateService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private dataService: DataService,
    private saveJobService: SavejobService,
    private observer: BreakpointObserver,
    private mediaObserver: MediaObserver
  ) {
    super(translateService);
  }

  // Méthode ngOnInit appelée à l'initialisation du composant.
  ngOnInit(): void {
    this.subscribeToAuthState(); // S'abonne aux changements de l'état d'authentification
    this.subscribeToUserId(); // S'abonne aux changements de l'ID de user dans l'URL
    // Initialisation du formulaire et chargement des données nécessaires
    this.initializeNoteInscriptionForm();
    this.initializeCvForm(); //CV
  }

  showInModeEditDialog() {
    if (this.isCandidate) {
      // Ouvre un dialogue pour les candidats
      this.updateProfileCandidate;
    } else if (this.isRecruiter) {
      // Ouvre un dialogue pour les recruteurs
      this.updateProfileRecruiter();
    } else if (this.isAdmin || this.isConsultant) {
      // Ouvre un dialogue pour les administrateurs ou les consultants
      this.updateProfileRecruiter();
    }
  }
  updateProfileCandidate() {
    this.OpenPopup(0, 'Update Profile Candidate');
  }

  candidateCvViewer() {
    this.OpenCvViewerPopup(0, 'Update Profile Candidate');
  }

  updateProfileRecruiter() {
    this.OpenPopup(0, 'Update Profile Recruiter');
  }

  updateProfileCollaborator() {
    this.OpenPopup(0, 'Update Profile Collarator');
  }

  OpenPopup(code: number, title: string) {
    if (this.isCandidate) {
      // Ouvre un dialogue pour les candidats
      this.openDialog(RegisterCandidateComponent, code, title);
    } else if (this.isRecruiter) {
      // Ouvre un dialogue pour les recruteurs
      this.openDialog(RegisterRecruiterComponent, code, title);
    } else if (this.isAdmin || this.isConsultant) {
      // Ouvre un dialogue pour les administrateurs ou les consultants
      this.openDialogRegistration(RegisterCollaboratorComponent, code, title);
    }
  }

  OpenCvViewerPopup(code: number, title: string) {
    this.openDialog(CandidateCvViewerComponentComponent, code, title);
  }

  private openDialog(component: any, code: number, title: string): void {
    this.dialog.open(component, {
      width: 'auto', // Définit la largeur du dialogue comme automatique
      height: 'auto', // Définit la hauteur du dialogue comme automatique
      enterAnimationDuration: '1000ms', // Durée de l'animation à l'ouverture
      exitAnimationDuration: '1000ms', // Durée de l'animation à la fermeture
      disableClose: true, // Empêche la fermeture du dialogue par des clics en dehors ou la touche ESC
      data: {
        // Les données à passer au composant ouvert dans la boîte de dialogue
        code: code,
        title: title,
        userData: this.user, // Les données de l'utilisateur à passer au dialogue
      },
    });
  }

  private openDialogRegistration(
    component: any,
    code: number,
    title: string
  ): void {
    this.dialog.open(component, {
      width: 'auto', // Définit la largeur du dialogue comme automatique
      height: 'auto', // Définit la hauteur du dialogue comme automatique
      enterAnimationDuration: '1000ms', // Durée de l'animation à l'ouverture
      exitAnimationDuration: '1000ms', // Durée de l'animation à la fermeture
      disableClose: true, // Empêche la fermeture du dialogue par des clics en dehors ou la touche ESC
      data: {
        // Les données à passer au composant ouvert dans la boîte de dialogue
        code: code,
        title: title,
        userData: this.user, // Les données de l'utilisateur à passer au dialogue
      },
    });
  }

  // Initialisation du formulaire avec des champs et des validations.

  initializeNoteInscriptionForm(): void {
    this.noteInscriptionForm = this.formBuilder.group({
      noteInscription: [
        '',
        [
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(500),
        ],
      ],
    });
  }

  // Initialisation du formulaire avec des champs et des validations.
  initializeCvForm(): void {
    this.registrationForm = this.formBuilder.group({
      cv: ['', [this.isFileRequired()]], // Applique le validateur personnalisé correctement.
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Validation d'une annonce publiée par le recruiteur, (Consultant) @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  validateCreatedAccount() {
    // On vérifie si l'utilisateur est authentifié.
    this.authService.getIsAuthenticated().subscribe((isAuthenticated) => {
      if (!isAuthenticated) {
        // Redirection vers la page de connexion si l'utilisateur n'est pas authentifié
        const currentUrl = this.router.url;
        this.router.navigate(['/signin'], {
          queryParams: { returnUrl: currentUrl },
        });
      } else {
        if (!this.isManager) {
          // Affichage d'un message si l'utilisateur n'a pas les droits nécessaires
          this.showNotAllowedToValidateDialog();
          return; // Important : arrête l'exécution si l'utilisateur n'a pas les droits
        } else if (this.user && this.user.userId) {
          const userId = this.user.userId;
          const payload = { actif: true }; // On définit la valeur directement dans le payload

          // Demande de confirmation avant suppression
          const confirmDialogRef = this.showConfirmDemandBeforValidateDialog();
          // Gestion de la réponse de la boîte de dialogue de confirmation
          confirmDialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
              // Vérification que l'utilisateur a confirmé la suppression
              this.userService.validateUser(userId, payload).subscribe({
                next: (response: ApiResponse) => {
                  this.showvalidateSuccessDialog(); // Affichage du succès de la suppression
                },
                error: (error) => {
                  //  On utilise la méthode showErrorDialog pour gérer les erreurs
                  this.showErrorDialog(error); //
                },
              });
            }
          });
        }
      }
    });
  }

  //  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  // Méthode pour invalider et supprimer une annonce par un consultant ou un administrateur @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  invalidateCreatedAccountToDeleteByConsultant() {
    // On vérifie si l'utilisateur est authentifié.
    this.authService.getIsAuthenticated().subscribe((isAuthenticated) => {
      if (!isAuthenticated) {
        // Redirection vers la page de connexion si l'utilisateur n'est pas authentifié
        const currentUrl = this.router.url;
        this.router.navigate(['/signin'], {
          queryParams: { returnUrl: currentUrl },
        });
      } else {
        if (!this.isManager) {
          // Affichage d'un message si l'utilisateur n'a pas les droits nécessaires
          this.showNotAllowedIsNotAdminDialog();
          return; // Important : arrête l'exécution si l'utilisateur n'a pas les droits
        } else if (this.user && this.user.userId) {
          const userId = this.user.userId;
          const payload = {
            actif: false,
            noteInscription:
              this.noteInscriptionForm.get('noteJoblisting')?.value,
          }; // On définit la valeur directement dans le payload

          // Demande de confirmation avant suppression
          const confirmDialogRef = this.showConfirmDemandBeforDeleteDialog();

          // Gestion de la réponse de la boîte de dialogue de confirmation
          confirmDialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
              // Vérification que l'utilisateur a confirmé la suppression
              this.userService.validateUser(userId, payload).subscribe({
                next: (response: ApiResponse) => {
                  this.showDeleteSuccessDialog(); // Affichage du succès de la suppression
                },
                error: (error) => {
                  //  On utilise la méthode showErrorDialog pour gérer les erreurs
                  this.showErrorDialog(error); //
                },
              });
            }
          });
        }
      }
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Demande de modification ou correction au recruiteur avant validation, (Consultant) @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  updateRequestToRecruiter() {
    console.log('Tentative de soumission du formulaire de candidature.');
    console.log('Valeurs du formulaire:', this.noteInscriptionForm.value);
    console.log('Validité du formulaire:', this.noteInscriptionForm.valid);

    // Affiche des détails sur les erreurs de validation si le formulaire n'est pas valide
    // Imprimez l'état de validation de chaque champ
    Object.keys(this.noteInscriptionForm.controls).forEach((key) => {
      const control = this.noteInscriptionForm.get(key);
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

    console.log('Validité du formulaire:', this.noteInscriptionForm.valid);

    // Vérifier d'abord si le formulaire est valide
    if (this.noteInscriptionForm.valid) {
      this.authService.getIsAuthenticated().subscribe((isAuthenticated) => {
        if (!isAuthenticated) {
          // Redirection vers la page de connexion si l'utilisateur n'est pas authentifié
          const currentUrl = this.router.url;
          this.router.navigate(['/signin'], {
            queryParams: { returnUrl: currentUrl },
          });
        } else {
          if (!this.isManager) {
            // Affichage d'un message si l'utilisateur n'a pas les droits nécessaires
            this.showNotAllowedToValidateDialog();
          } else if (this.user && this.user.userId) {
            const userId = this.user.userId;
            const payload = {
              actif: false,
              // On récupère la valeur du champ de formulaire
              noteInscription:
                this.noteInscriptionForm.get('noteInscription')?.value,
            };
            // Demande de confirmation avant
            const confirmDialogRef = this.showDemandUpdateDialog();
            // Gestion de la réponse de la boîte de dialogue de confirmation
            confirmDialogRef.afterClosed().subscribe((result) => {
              if (result === true) {
                // Vérification que l'utilisateur a confirmé
                this.userService.validateUser(userId, payload).subscribe({
                  next: (response: ApiResponse) => {
                    this.showUpdateDemandSuccessDialog(); // Affichage du succès
                    this.noteInscriptionForm.reset(); // Réinitialisation du formulaire
                    this.isFormVisible = false; // Rendre le formulaire invisible
                  },
                  error: (error) => {
                    // On utilise la méthode showErrorDialog pour gérer les erreurs
                    this.showErrorDialog(error);
                  },
                });
              }
            });
          }
        }
      });
    } else {
      // Marque le contrôle comme 'touched' pour afficher les messages d'erreur
      Object.values(this.noteInscriptionForm.controls).forEach((control) => {
        control.markAsTouched();
      });
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Suppression d'une annonce par le consultant ou le proprietaire @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  deleteThisAccount() {
    // On vérifie si l'utilisateur est authentifié.
    this.authService.getIsAuthenticated().subscribe((isAuthenticated) => {
      if (!isAuthenticated) {
        // Si l'utilisateur n'est pas connecté, on le redirige vers la page de connexion.
        // On récupère et conserve l'URL actuelle pour un retour post-connexion.
        const currentUrl = this.router.url;
        this.router.navigate(['/signin'], {
          queryParams: { returnUrl: currentUrl },
        });
      } else {
        // On vérifie si l'utilisateur a les droits nécessaires pour supprimer l'annonce.
        if (!this.isManager) {
          // Si non autorisé, on affiche une boîte de dialogue d'alerte.
          this.showNotAllowedToDeleteDialog();
        } else if (this.user && this.user.userId) {
          const userId = this.user.userId;

          // On demande de confirmation avant de procéder à la suppression.
          const confirmDialogRef = this.showConfirmDemandBeforDeleteDialog();

          // On gère la réponse de la boîte de dialogue de confirmation.
          confirmDialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
              // L'utilisateur confirme la suppression, on procède.
              this.userService.deleteUserByAdmin(userId).subscribe({
                next: (response: ApiResponse) => {
                  // Affichage d'une boîte de dialogue de succès.
                  this.showDeleteSuccessDialog();
                },
                error: (error) => {
                  //  On utilise la méthode showErrorDialog pour gérer les erreurs
                  this.showErrorDialog(error);
                },
              });
            }
            // Si l'utilisateur annule, l'action est avortée et aucune autre action n'est entreprise.
          });
        }
      }
    });
  }

  /* onNotificationChange(isEnabled: boolean) {
    const payload: UpdatePayload = {
      notification: isEnabled
    };

    this.userService.updateNotification(payload).subscribe({
      next: (response) => {
        console.log('Mise à jour réussie', response);
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour', error);
      }
    });
  } */

  // @@@@@@@@@@@@@@@@@@@@@   Méthode pour activer ou désactiver les notifications @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  onNotificationChange(isEnabled: boolean) {
    // Préparation du payload avec l'état de notification désiré
    const payload: UpdatePayload = {
      notification: isEnabled,
    };

    // Si isEnabled est faux, l'utilisateur souhaite désactiver les notifications
    if (!isEnabled) {
      // Affiche une boîte de dialogue demandant une confirmation pour désactiver les notifications
      const confirmDialogRef = this.showDisableNotificationDialog();

      // Attend la fermeture de la boîte de dialogue et agit en fonction du résultat
      confirmDialogRef.afterClosed().subscribe((result) => {
        // Si l'utilisateur confirme la désactivation, procède à la mise à jour
        if (result === true) {
          this.userService.updateNotification(payload).subscribe({
            next: (response: ApiResponse) => {
              // Affiche une boîte de dialogue de succès en cas de désactivation réussie
              this.showDisableNotificationSuccessDialog();
            },
            // Appelle la fonction de gestion d'erreur en cas d'erreur lors de la mise à jour
            error: (error) => this.handleUpdateNotificationError(error),
          });
        }
      });
    } else {
      // Si isEnabled est vrai, l'utilisateur souhaite activer les notifications
      this.userService.updateNotification(payload).subscribe({
        next: (response: ApiResponse) => {
          // Affiche une boîte de dialogue de succès en cas d'activation réussie
          this.showEnableNotificationSuccessDialog();
        },
        // Appelle la fonction de gestion d'erreur en cas d'erreur lors de la mise à jour
        error: (error) => this.handleUpdateNotificationError(error),
      });
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@   Méthode pour voir le cv de l'utilisateur @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  viewCandidateCv() {
    if (this.user?.userId) {
      const userId = this.user?.userId;
      //Récupère l'URL actuelle
      const currentUrl = this.router.url;
      // Navigue vers le détail de l'offre d'emploi avec l'URL actuelle comme paramètre de requête 'returnUrl'
      this.router.navigate(['candidate-cv-viewer', userId], {
        queryParams: { returnUrl: currentUrl },
      });
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@   Méthode pour supprimer son compte @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  deleteMyProfile() {
    // Affiche une boîte de dialogue demandant une confirmation pour supprimer le compte
    const confirmDialogRef = this.showDeleteAccountDialog();
    // Attend la fermeture de la boîte de dialogue et agit en fonction du résultat
    confirmDialogRef.afterClosed().subscribe((result) => {
      // Si l'utilisateur confirme la désactivation, procède à la mise à jour
      if (result === true) {
        this.userService.deleteProfile().subscribe({
          next: (response: ApiResponse) => {
            // Affiche une boîte de dialogue de succès en cas de désactivation réussie
            this.showDeleteAccountSuccessDialog();
          },
          // Appelle la fonction de gestion d'erreur en cas d'erreur lors de la mise à jour
          error: (error) => this.handleUpdateNotificationError(error),
        });
      }
    });
  }

  // Méthode privée pour gérer les erreurs lors de la mise à jour des notifications
  private handleUpdateNotificationError(error: any) {
    // Affiche une boîte de dialogue d'erreur avec les informations de l'erreur
    this.showErrorDialog(error);
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
              error: (error) => {
                //  On utilise la méthode showErrorDialog pour gérer les erreurs
                this.showErrorDialog(error);
              },
            });
          }
        }
      }
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Register Candidate @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // Méthode pour la connexion de l'utilisateur.
  UpdatingUserCV(): void {
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

    if (this.cvFile == null) {
      this.showshowErrorMessageCVDialog();
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
      this.userService.updateUserCv(formData).subscribe({
        next: (response: ApiResponse) => {
          response.data as SignupResponse;
          // Gestion de la réponse réussie
          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
              title: 'Modification  réussi !',
              message: 'Votre CV a été modifié avec success !',
              buttons: [
                { text: 'Fermer', value: 'close', class: 'cancel-button' },
              ],
              messageClass: 'message-success',
            },
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result === 'close') {
              this.initializeNoteInscriptionForm(); // Réinitialiser le formulaire
              location.reload();
            }
          });
        },
        // Gestion de l'erreur
        error: (errorResponse: ApiResponse) => {
          // Impression de l'erreur dans la console du navigateur
          console.error(`Erreur lors de l'enregistrement:`, errorResponse);

          // Utilisation de la classe Base "handleError" pour gerer les erreurs
          this.errorMessage = this.handleError(errorResponse);
        },
      });
    } else {
      // Marque tous les contrôles comme 'touched' pour afficher les messages d'erreur
      Object.values(this.registrationForm.controls).forEach((control) => {
        control.markAsTouched();
      });
    }
  }

  // Bascule la visibilité entre la barre d'actions et le formulaire d'édition du CV.
  toggleCvFormVisibility(): void {
    this.isBarVisible = false;
    this.isCvFormVisible = true;
  }

  // Cache le formulaire d'édition du CV et affiche le bouton associé.
  hideCvFormAndShowButton(): void {
    this.isCvFormVisible = false;
    this.isBarVisible = true;
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   MES METHODES PRIVEES $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Souscription aux paramètres de la route pour récupérer l'ID du User.
  private subscribeToUserId(): void {
    this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe((params) => {
      const userId = +params['userId']; // Convertit le paramètre en nombre

      this.userProfileId = userId;
      if (userId) {
        this.fetchProfile(); // Récupère les détails du user si l'ID est valide
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
        this.isCurrentCandidate = this.authService.isCandidate; // Met à jour si l'utilisateur est un candidate
        this.isCurrentAdmin = this.authService.isAdmin; 
        this.isCurrentConsultant = this.authService.isConsultant; 
        this.isCurrentRecruiter = this.authService.isRecruiter; 

        this.currentUserId = this.authService.getCurrentUserId();
        this.theRecruiterId = this.authService.getRecruiterId(); // par defaut pour checker le recruiter proprietaire du profil
        this.theConsultantId = this.authService.getConsultantId(); // par defaut pour checker le consultant proprietaire du profil
        this.theAdminId = this.authService.getAdminId(); // par defaut pour checker le recruiter proprietaire du profil

        if (this.isAuthenticated && (this.theConsultantId || this.theAdminId)) {
          this.isManager = true;
        }
       
        console.log('JE SUIS ADMIN :', this.isCurrentAdmin);
        console.log('JE SUIS CONSULATNT :', this.isCurrentConsultant);
        console.log('JE SUIS CANDIDAT :', this.isCurrentCandidate);
        console.log('JE SUIS RECRUITER :', this.isCurrentRecruiter);
        

        this.cdr.detectChanges(); // Détecte les changements (utile si les mises à jour ne sont pas détectées automatiquement)
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
            this.fetchProfile();
          }
        }
      });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Methode pour afficher le profile de l'id fournie @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  private fetchProfile() {
    if (this.userProfileId) {
      this.userService.profile(this.userProfileId).subscribe({
        next: (response: ApiResponse) => {
          if (response.data && !Array.isArray(response.data)) {
            this.user = response.data as Users;

            // Définir les flags de propriété basés sur l'identifiant de l'utilisateur
            this.isOwnerConsultant = this.user.userId === this.currentUserId;
            this.isOwnerAdmin = this.user.userId === this.currentUserId;
            this.isOwnerProfile =
              this.user.userId === this.currentUserId ||
              this.user.userId === this.theConsultantId ||
              this.user.userId === this.theAdminId;
            this.descriptionDisplay = this.user.role.title === 'Recruiter';
            this.cvDisplay = this.user.role.title === 'Candidate';
            this.isCandidate = this.user.role.title === 'Candidate';
            this.isImmutableCollaborator =
              !this.isAdmin &&
              (this.user.role.title === 'Administrator' ||
                this.user.role.title === 'Consultant');
                
                this.userWhitInterviewNoteId = this.user.userId;

                if(this.userWhitInterviewNoteId === this.currentUserId ) {
                  this.interviewNoteDisplay = false;
                }

                if(this.user.role.title === 'Candidate' && this.user.interviewNote && this.user.interviewNote.trim() !== '')
                  {
                    this.isAddedNoteInterview = true;
                  }

           
            this.isValided = this.user.actif ?? false; // . Si null ou undefined, this.isValider sera défini à false.

            
            /* if (this.user.actif === true) {
              this.isValided = true;
            } else if (this.user.actif === false || this.user.actif === null ) {
              this.isValided = false;
            } */

            console.log('Mon Profile', this.user); // Afficher ici

            console.log('Mon Profile', this.user); // Afficher ici
          }
        },
        error: (error) => this.showErrorDialog(error),
      });
    }
  }

  /*********************************************************************************************************** */

  // Méthode pour afficher le dialogue de confirmation lors de la suppression définitive du compte
  private showDeleteAccountDialog() {
    return this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
      data: {
        title: 'Confirmer la suppression du compte',
        message: `Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible et vous perdrez l'accès à toutes les données et fonctionnalités du compte.`,
        buttons: [
          { text: 'Supprimer', value: true, class: 'confirm-button' }, // Bouton de confirmation avec un style visuel indiquant une action dangereuse
          { text: 'Annuler', value: false, class: 'cancel-button' },
        ],
        messageClass: 'message-danger', // Classe CSS pour styliser le message d'avertissement
      },
    });
  }

  // Méthode pour afficher le dialogue d'erreur
  private showErrorDialog(error: any) {
    const errorMessage = this.handleError(error); // Utilise une méthode existante pour obtenir le message d'erreur
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
      data: {
        title: 'Une erreur est survenue',
        message: errorMessage, // Affiche le message d'erreur récupéré
        buttons: [{ text: 'Fermer', value: 'close', class: 'cancel-button' }],
        messageClass: 'message-error',
      },
    });
  }
  // Méthode pour demander confirmation avant de procéder à la suppression.
  private showConfirmDemandBeforDeleteDialog() {
    return this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
      data: {
        title: 'Confirmation requise',
        message:
          'Êtes-vous sûr de vouloir supprimer ce compte utilisateur ? Cette action est irréversible.',
        buttons: [
          { text: 'Oui', value: true, class: 'confirm-button' },
          { text: 'Non', value: false, class: 'cancel-button' },
        ],
        messageClass: 'message-warning',
      },
    });
  }
  // Méthode pour demander confirmation avant de procéder à la validation.
  private showConfirmDemandBeforValidateDialog() {
    return this.dialog.open(ConfirmDialogComponent, {
      width: '340px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
      data: {
        title: 'Confirmation requise',
        message: 'Voulez-vous activer cet compte ? ',
        buttons: [
          { text: 'Oui', value: true, class: 'confirm-button' },
          { text: 'Non', value: false, class: 'cancel-button' },
        ],
        messageClass: 'message-warning',
      },
    });
  }

  // Méthode pour afficher le dialogue de succès après désactivation des notifications
  private showDisableNotificationSuccessDialog() {
    return this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
      data: {
        title: 'Notifications désactivées',
        message: `Vos notifications ont été désactivées avec succès.`,
        buttons: [{ text: 'OK', value: true, class: 'sucess-button' }],
        messageClass: 'message-success',
      },
    });
  }

  // Méthode pour afficher le dialogue de succès après suppression de Compte
  private showDeleteAccountSuccessDialog() {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '400px',
        disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
        data: {
          title: 'Suppression réussie !',
          message: 'Votre com a été supprimée avec succès.',
          buttons: [{ text: 'Fermer', value: 'close', class: 'cancel-button' }],
          messageClass: 'message-success',
        },
      })
      .afterClosed()
      .subscribe(() => {
        //     this.authService.reloadPage();
        // Navigue vers la page d'accueil
        this.router.navigate(['home']);
      });
  }

  // Méthode pour afficher le dialogue de succès après activation des notifications
  private showEnableNotificationSuccessDialog() {
    return this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
      data: {
        title: 'Notifications activées',
        message: `Vos notifications ont été activées avec succès.`,
        buttons: [{ text: 'OK', value: true, class: 'sucess-button' }],
        messageClass: 'message-success',
      },
    });
  }

  // Méthode pour informer en cas de repetition.
  private showDemandUpdateDialog() {
    return this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
      data: {
        title: 'Confirmation requise',
        message: `Souhaitez-vous vraiment invalider ce Compte ?`,
        buttons: [
          { text: 'Oui', value: true, class: 'confirm-button' },
          { text: 'Non', value: false, class: 'cancel-button' },
        ],
        messageClass: 'message-warning',
      },
    });
  }

  // Méthode pour afficher le dialogue de confirmation lors de la désactivation des notifications
  private showDisableNotificationDialog() {
    return this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
      data: {
        title: 'Confirmer la désactivation',
        message: `Êtes-vous sûr de vouloir désactiver les notifications ? Vous risquez de manquer des informations importantes.`,
        buttons: [
          { text: 'Oui', value: true, class: 'confirm-button' },
          { text: 'Non', value: false, class: 'cancel-button' },
        ],
        messageClass: 'message-warning',
      },
    });
  }

  // Méthode pour afficher le dialogue de succès apres suppression
  private showDeleteSuccessDialog() {
    // Récupère l'URL de retour ou définit un fallback
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
      data: {
        title: 'Suppression réussie !',
        message: "L'offre d'emploi a été supprimée avec succès.",
        buttons: [{ text: 'Fermer', value: 'close', class: 'cancel-button' }],
        messageClass: 'message-success',
      },
    });
    // Après la fermeture du dialogue
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'close') {
        this.router.navigateByUrl(returnUrl);
      }
    });
  }
  // Méthode pour afficher le dialogue de succès apres Validation
  private showvalidateSuccessDialog() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
      data: {
        title: 'Validation réussie',
        message: 'Le compte a été activé avec succès.',
        buttons: [{ text: 'Fermer', value: 'close', class: 'cancel-button' }],
        messageClass: 'message-success',
      },
    });
    // Après la fermeture du dialogue
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'close') {
        location.reload();
      }
    });
  }

  // Méthode pour afficher le dialogue de succès apres Validation
  private showUpdateDemandSuccessDialog() {
    // Récupère l'URL de retour ou définit un fallback
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
      data: {
        title: 'Compte invalidé !',
        message:
          'Le compte a été invalidé et e-mail explicatif envoyé avec succès.',
        buttons: [{ text: 'Fermer', value: 'close', class: 'cancel-button' }],
        messageClass: 'message-success',
      },
    });
    // Après la fermeture du dialogue
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'close') {
        this.router.navigateByUrl(returnUrl);
      }
    });
  }
  // Méthode pour afficher le dialogue de succès apres postulation
  private showApplySuccessDialog(): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
      data: {
        title: 'Postulation réussie !',
        message:
          'Merci de votre postulation. Nous reviendrons vers vous rapidement.',
        buttons: [{ text: 'Fermer', value: 'close', class: 'cancel-button' }],
        messageClass: 'message-success',
      },
    });
  }
  // Méthode pour afficher le dialogue d'error de supprimeur non recruiteur ni Admin
  private showNotAllowedToDeleteDialog(): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
      data: {
        title: 'Suppresssion non autorisée',
        message: `Seul un Consoltant ou Administateur peut effectuer cette action.`,
        buttons: [{ text: 'Fermer', value: 'close', class: 'cancel-button' }],
        messageClass: 'message-error',
      },
    });
  }

  // Méthode pour afficher le dialogue d'error pour Fichier CV null
  private showshowErrorMessageCVDialog(): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
      data: {
        title: 'Chargement du CV Échoué',
        message: `Un problème est survenu avec le fichier du CV, veuillez réessayer.`,
        buttons: [{ text: 'Fermer', value: 'close', class: 'cancel-button' }],
        messageClass: 'message-error',
      },
    });
  }
  // Méthode pour afficher le dialogue d'error de validatiion non recruiteur ni Admin
  private showNotAllowedToValidateDialog(): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
      data: {
        title: 'Action non autorisée',
        message: `Seul un Consoltant ou Administateur peut effectuer cette action.`,
        buttons: [{ text: 'Fermer', value: 'close', class: 'cancel-button' }],
        messageClass: 'message-error',
      },
    });
  }
  // Méthode pour afficher le dialogue d'error de supprimeur non  Admin
  private showNotAllowedIsNotAdminDialog(): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
      data: {
        title: 'Suppresssion non autorisée',
        message: `Seul un recruteur ou l'utilisateur proprietaire de l'offre peut la supprimer.`,
        buttons: [{ text: 'Fermer', value: 'close', class: 'cancel-button' }],
        messageClass: 'message-error',
      },
    });
  }
  // Méthode pour afficher le dialogue d'error postulant non candidate
  private showNotAllowedDialog(): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
      data: {
        title: 'Postulation non autorisée',
        message: 'Seuls les candidats peuvent postuler aux annonces.',
        buttons: [{ text: 'Fermer', value: 'close', class: 'cancel-button' }],
        messageClass: 'message-error',
      },
    });
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

  get noteInscription() {
    return this.noteInscriptionForm.get('noteInscription');
  }
  get cv() {
    return this.registrationForm.get('cv');
  }

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
getFormattedInterviewNote(): string {
  if (this.user?.interviewNote && this.isCandidate) {
    const note = JSON.parse(this.user.interviewNote);
    return `
      <b>Note de l'entretien :</b><br><br>
      <b>Candidat :</b> ${note.candidate}<br>
      <b>Date de l'entretien :</b> ${note.interviewDate}<br>
      <b>Poste :</b> ${note.position}<br><br>
      <b>Compétences techniques :</b><br> ${note.technicalSkills.replace(/\n/g, '<br>')}<br><br>
      <b>Expérience professionnelle :</b><br> ${note.professionalExperience.replace(/\n/g, '<br>')}<br><br>
      <b>Qualités personnelles :</b><br> ${note.personalQualities.replace(/\n/g, '<br>')}<br><br>
      <b>Recommandation :</b><br> ${note.recommendation.replace(/\n/g, '<br>')}<br><br>
      <b>Signature :</b><br> ${note.signature.replace(/\n/g, '<br>')}
    `;
  }
  return '';
}

// Ouvrir ou fermer la Div note interview
toggleInterviewNoteVisibility() {
  this.showInterviewNote = !this.showInterviewNote;
}



  /*
  goBack() {
    // On tente de récupérer returnUrl depuis les queryParams
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];

    if (returnUrl) {
      // On restaure les états dans le dashboard de visibilité
      this.visibilityStateManagerService.managerUsersBloc = true; // 

      // On nettoie returnUrl pour éviter des redirections erronées
      const cleanUrl = decodeURIComponent(returnUrl);
      this.router.navigateByUrl(cleanUrl);
      return; // On arrete l'exécution après la navigation pour éviter les actions supplémentaires
    }

    // Structure conditionnelle pour naviguer basée sur le rôle de l'utilisateur
    this.navigateBasedOnRole();
  }

  private navigateBasedOnRole() {
    if (this.isAdmin || this.isConsultant) {
      this.router.navigate(['/dashboard']);
    } else if (this.isRecruiter) {
      this.router.navigate(['/recruiter-profile']);
    } else {
      this.router.navigate(['/home']);
    }
  } */
  // Méthode ngOnDestroy appelée juste avant que le composant soit détruit.

  // Désabonnement pour éviter les fuites de mémoire
  ngOnDestroy(): void {
    // Signale la désinscription
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
