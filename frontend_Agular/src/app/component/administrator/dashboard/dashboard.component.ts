import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe, CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  NavigationStart,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  Observable,
  Subject,
  Subscription,
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  map,
  of,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { MaterialModule } from '../../../../module/Material.module';
import {
  Appointment,
  Company,
  ContractTypes,
  JobApplications,
  JobListings,
  JobLocation,
  JobTitle,
  Roles,
  SaveJobs,
  TimeSlot,
  Users,
} from '../../../models';
import { ApiResponse } from '../../../shared/model';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { MenuheaderComponent } from '../../menuheader/menuheader.component';
import { ApiResponseWithCount } from '../../security/model/response/api.response.with.count';
import { SaveJobResponse } from '../../security/model/response/savejob.response/saveJob.response';
import { AuthentificationService } from '../../security/securityIndex';
import {
  AppointmentService,
  DataService,
  JobapplicationService,
  JoblistingService,
  OthersTablesService,
  SavejobService,
  UserService,
} from '../../service';
import { VisibilityStateManagerService } from '../../service/visibilityStateManager.service';
import { HandleErrorBase } from '../../shared/HandleErrorBase';
import { InterviewNoteComponent } from '../interview-note/interview-note.component';
import { RegisterCollaboratorComponent } from '../register-collaborator/register-collaborator.component';
import { CalendarView, CalendarEvent, CalendarEventAction, CalendarModule } from 'angular-calendar';
import { isSameMonth, isSameDay } from 'date-fns';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DateWithSuffixPipe } from '../../../shared/pipe/date-with-suffix.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    MaterialModule,
    MenuheaderComponent,
    CommonModule,
    RouterLink,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    AsyncPipe,
    CommonModule,
    CalendarModule,
    DateWithSuffixPipe,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
@UntilDestroy()
export class DashboardComponent
  extends HandleErrorBase
  implements OnInit, OnDestroy
{
  private subscriptions = new Subscription();
  private queryParamSubscription!: Subscription;

  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  isHandset$: Observable<boolean>;
  private unsubscribe$ = new Subject<void>();
  errorMessage: string | null = null; // Pour stocker le message d'erreur
  filtre = '';

  searchUsersControl = new FormControl('');
  searchUsersValidateControl = new FormControl('');
  searchInfoInMyAppointementInterviewControl = new FormControl('');
  searchInfoInAppointementInterviewControl = new FormControl('');
  searchUsersInvalidateControl = new FormControl('');

  searchJoblistingsControl = new FormControl('');
  searchJoblistingsValidateControl = new FormControl('');
  searchJoblistingsInvalidateControl = new FormControl('');

  isSearchJoblistingValidateControl = new FormControl('');
  isdisplayCalendar: boolean = true;

  isAdmin: boolean = false;
  isConsultant: boolean = false;


  jobListings: JobListings[] = [];
  myAppointmentGrouped: Appointment[] = [];
  myAppointment?: Appointment;

  AllAppointmentGrouped: Appointment[] = [];
  jobListingsValide: JobListings[] = [];
  jobListingsInvalide: JobListings[] = [];
  jobTitles: JobTitle[] = [];
  users: Users[] = [];
  allUSers: Users[] = [];
  inactiveUsers: Users[] = [];
  activeUsers: Users[] = [];

  jobLocations: JobLocation[] = [];

  contractTypes: ContractTypes[] = [];
  roles: Roles[] = [];
  company: Company[] = [];

  @ViewChild(MatSidenav)

  // Pour rendre la liste des offres vidible

  // Propriété pour suivre les visibilité

  // managerUsersBloc: boolean = false;
  savedJobs: SaveJobs[] = [];
  myJobsaved: SaveJobs[] = [];
  jobAppli: JobApplications[] = [];
  selectMyAppointmentGroupedDate: 'day' | 'week' | 'month' | 'all' = 'all';
  theAppointmentDate: Date = new Date();

  user?: Users;
  userToAddNote?: Users;

  jobApplicationsCount: number | null | undefined; // Nombre d'emploi
  totalApplicationsCount: number | null | undefined;

  jobListingsCount: number | null | undefined; // Nombre d'emploi
  AllAppointmentGroupedCount: number | null | undefined; // Nombre de RDV
  myAppointmentGroupedCount: number | null | undefined; // Nombre de RDV
  allJobListingsCount: number | null | undefined;
  jobTitlesCount: number | null | undefined; // Nombre de province
  inactiveUsersCount: number | null | undefined;

  tesCount: number = 1;
  activeUsersCount: number | null | undefined;
  savedJoibsCount: number | null | undefined;
  myJobsavedCount: number | null | undefined;
  usersCount: number | null | undefined;
  allUSersCount: number | null | undefined;

  invalidedJobListingCount: number | null | undefined;
  validedJobListingCount: number | null | undefined;
  myValidedJobListingCount: number | null | undefined;

  jobLocationsCount: number | null | undefined; // Nombre de localité
  contractTypesCount: number | null | undefined; // Nombre de poste
  rolesCount: number | null | undefined; // Nombre de contrat
  companyCount: number | null | undefined; //  Nombre d'entreprise

  collaboratorName: string | null | undefined;
  collaboratorID: number | null | undefined;
  myAppointmentId: number | null | undefined;
  collaboratorFirstname: string | null | undefined;
  collaboratorRole: string | null | undefined;

  // Variable pour stocker l'option sélectionnée
  selectDate: string | null | undefined;
  selectInvalidateDate: string | null | undefined;
  selectValidateDate: string | null | undefined;
  selectedContractType: number | null | undefined; // Nombre de poste
  selectedInvalidateContractType: number | null | undefined; // Nombre de poste
  selectedValidateContractType: number | null | undefined; // Nombre de poste
  selectedJobTitle: number | null | undefined;
  selectedValidateJobTitle: number | null | undefined;
  selectedInvalidateJobTitle: number | null | undefined;
  selectedRoleTitleForInactiveUsers: number | null | undefined;
  selectedRoleTitleForActiveUsers: number | null | undefined;
  selectedJobLocation: number | null | undefined; // Nombre de poste
  selectedInvalidateJobLocation: number | null | undefined; // Nombre de poste
  selectedValidateJobLocation: number | null | undefined; // Nombre de poste
  selectedCompany: number | null | undefined; // Nombre de localité
  selectedValidateCompany: number | null | undefined; // Nombre de localité
  selectedInvalidateCompany: number | null | undefined; // Nombre de localité
  selectMyJobSavedDate: string | null | undefined;
  selectedMyJobSavedContractType: number | null | undefined; // Nombre de poste
  selectedMyJobSavedJobTitle: number | null | undefined;
  selectedMyJobSavedJobLocation: number | null | undefined; // Nombre de poste
  selectedMyJobSavedCompany: number | null | undefined; // Nombre de localité

  isRecruiter: boolean = false; // Indique si l'utilisateur est recruteur
  isAuthenticated: boolean = false; // État d'authentification initial de l'utilisateur













  registrationForm!: FormGroup; //  Initialiser FormGroup avant son utilisation.

  @ViewChild('modalContent', { static: true }) modalContent!: TemplateRef<any>;
  @ViewChild('formSection') formSection!: ElementRef;

 

  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  modalData!: { action: string; event: CalendarEvent };
  refresh = new Subject<void>();
  events: CalendarEvent[] = [];
  activeDayIsOpen: boolean = true;



  isCreate: boolean = false;
  isUpdate: boolean = false;
  isUpdateFromTheCalendarboolean = false;



  jobApplication: JobApplications[] = [];
  myAllAppointmentGrouped: Appointment[] = [];

  timeslots: TimeSlot[] = [];

  theJobApplication?: JobApplications;


  jobApplyId: number | null | undefined;
  appointmentJobApplyId: number | null | undefined;

  theCalendarAppointmentId: number | null | undefined;



  constructor(
    private observer: BreakpointObserver,
    private router: Router,
    private mediaObserver: MediaObserver,
    private jobListingService: JoblistingService,
    public translateService: TranslateService,
    private dialog: MatDialog,
    public visibilityStateManagerService: VisibilityStateManagerService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private othersTablesService: OthersTablesService,
    private saveJobService: SavejobService,
    private jobApplicationService: JobapplicationService,
    private appointmentService: AppointmentService,
    private route: ActivatedRoute,
    private savedJobsService: SavejobService,
    private userService: UserService,
    private cdr: ChangeDetectorRef, // Référence pour détecter les changements,
    private authService: AuthentificationService
  ) {
    super(translateService);
    this.isHandset$ = this.mediaObserver.asObservable().pipe(
      map((change) =>
        change.some(
          (mediaChange) =>
            mediaChange.mqAlias === 'xs' || mediaChange.mqAlias === 'sm'
        )
      ),
      takeUntil(this.unsubscribe$)
    );
  }

  ngOnInit(): void {

    // Rafraîchir les données du RecruiterProfileComponent
    const authSubscription = this.authService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;
        // Qui retourne le rôle du recruiteur connecté
        //   this.isRecruiter = this.authService.isRecruiter;
        this.isAdmin = this.authService.isAdmin;
        this.isConsultant = this.authService.isConsultant;

        this.cdr.detectChanges();
      }
    );
    this.subscriptions.add(authSubscription);

    // Restaurer l'état lors du chargement de la page
    this.visibilityStateManagerService.restoreState('dashboardState');



    this.fetchMyProfile();


    this.fetchJobListing(); // Charge toutes les offres...
    this.fetchJobApplication();
    this.fetchUsersList(); // Charge toutes les utilisateur
    this.fetchInactiveUsersList();
    this.fetchValidedJobListing();
    this.fetchActiveUsersList();
    this.loadMySavedJobListings();
    this.loadAllInterviewAppointments();
    this.fetchInvalidedJobListing();
    this.subscribeToData(); // Charge les JobTitles, Localités, Contracts
    this.initializeAsyncUsersSearch(); // l'écoute des changements sur le champ de recherche
    this.initializeAsyncUsersInvalideSearch();
    this.initializeAsyncUsersValidateSearch();

    this.initializeAsyncJobListingSearch();
    this.initializeAsyncJobListingValidateSearch();
    this.initializeAsyncJobListingInvalidateSearch();
    this.initializeAsyncInfoInAppointSearch();
    this.initializeAsyncInfoInMyInterviewAppointmentsSearch();
    this.loadMyInterviewAppointmentsFilterByDate();
    this.findAllJobApplicationsFollowUpByConsultant();
  


    this.registrationForm = this.formBuilder.group({
      jobApplicationId: [null, Validators.required],
      appointmentDate: ['', Validators.required],
      timeSlotId: ['', Validators.required],
    });

    this.fetchTimeSlot();
    this.subscribeToAuthState(); // S'abonne aux changements de l'état d'authentification
    this.subscribeToJobApplicationOrAppointmentId(); // S'abonne aux changements de l'ID de user dans l'URL
    this.loadMyInterviewAppointments();
    this.fetchTheJobApplication();

     
  }

  

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Mes Rendez-Vous d'entretien @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  loadMyInterviewAppointmentsFilterByDate() {
    if (this.selectMyAppointmentGroupedDate) {
      this.appointmentService
        .getMyAllFutureAppointmentsGrouped(this.selectMyAppointmentGroupedDate)
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            this.myAppointmentGrouped = response.data as Appointment[];
            this.myAppointmentGroupedCount = response.count;
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

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Mes Rendez-Vous d'entretien @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  loadAllInterviewAppointments() {
    this.appointmentService.getAllFutureAppointmentsGrouped().subscribe({
      next: (response: ApiResponseWithCount) => {
        this.AllAppointmentGrouped = response.data as Appointment[];
        this.AllAppointmentGroupedCount = response.count;
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

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Pour permettre l'ajout de note @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  updateAddNoteInterview(userId: number) {
    this.jobApplicationService.updateAddNoteInterview(userId).subscribe({
      next: (response: ApiResponseWithCount) => {},
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

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Pour Ajouter une note apres interview @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  addNoteInterview(user: Users) {
    this.userToAddNote = user; // On assigne les données de l'utilisateur à userToAddNote

    this.dialog.open(InterviewNoteComponent, {
      width: '900px',
      height: '90%',
      enterAnimationDuration: '1000ms',
      exitAnimationDuration: '1000ms',
      disableClose: true,
      data: {
        userId: user.userId, // On passe l'ID de l'utilisateur concerné
        title: 'Add note',
        userToAddNoteData: this.userToAddNote, // Passer userToAddNote avec les bonnes données
      },
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Validation d'une annonce publiée par le recruiteur, (Consultant) @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
validateJobApplication(jobApplicationId: number) {
  // On vérifie si l'utilisateur est authentifié.
  if (!this.isAdmin && !this.isConsultant) {
    // Affichage d'un message si l'utilisateur n'a pas les droits nécessaires
    this.showNotAllowedToValidateDialog();
    return; // Important : arrête l'exécution si l'utilisateur n'a pas les droits
  } else if (jobApplicationId) {
    const jobApplicationToValidateId = jobApplicationId;
    const payload = { status: true }; // On définit la valeur directement dans le payload

    // Demande de confirmation avant validation
    this.showConfirmDemandBeforValidateDialog().subscribe(confirmDialogRef => {
      // Gestion de la réponse de la boîte de dialogue de confirmation
      confirmDialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          // Vérification que l'utilisateur a confirmé la suppression
          this.jobApplicationService
            .updateJobApplicationStatus(jobApplicationToValidateId, payload)
            .subscribe({
              next: (response: ApiResponse) => {
                this.showvalidateSuccessDialog(); // Affichage du succès de la validation
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
      });
    });
  }
}

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  // Méthode pour invalider et supprimer une annonce par un consultant ou un administrateur @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
invalidateJobApplication(jobApplicationId: number) {
  if (jobApplicationId) {
    const jobApplicationToRefuseId = jobApplicationId;
    const payload = { status: false }; // On définit la valeur directement dans le payload

    // Demande de confirmation avant suppression
    this.showConfirmDemandBeforDeleteDialog().subscribe(confirmDialogRef => {
      // Gestion de la réponse de la boîte de dialogue de confirmation
      confirmDialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          // Vérification que l'utilisateur a confirmé la suppression
          this.jobApplicationService
            .updateJobApplicationStatus(jobApplicationToRefuseId, payload)
            .subscribe({
              next: (response: ApiResponse) => {
                this.showDeleteJobApplicationSuccessDialog(); // Affichage du succès de la suppression
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
      });
    });
  }
}


  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  // Méthode pour invalider et supprimer une annonce par un consultant ou un administrateur @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
closeThisJobListing(jobListingId: number, event: MouseEvent) {
  event.stopPropagation(); // Empêche l'événement de se propager
  // On vérifie si l'utilisateur est authentifié.
  if (jobListingId) {
    console.log(`WWWWWWWWWWWWWWWWWWW :`, jobListingId);
    const jobListingToCloseId = jobListingId;
    const payload = { jobClose: true }; // On définit la valeur directement dans le payload

    // Demande de confirmation avant suppression
    this.showConfirmDemandBeforClosingJobDialog().subscribe(confirmDialogRef => {
      // Gestion de la réponse de la boîte de dialogue de confirmation
      confirmDialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          console.log(`WWWWWWWWWWWWWWWWWWW :`, jobListingToCloseId, payload);
          // Vérification que l'utilisateur a confirmé la suppression
          this.jobListingService
            .closeJoblisting(jobListingToCloseId, payload)
            .subscribe({
              next: (response: ApiResponse) => {
                this.showClosingJobSuccessDialog(); // Affichage du succès de la suppression
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
      });
    });
  }
}


  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Validation d'une annonce publiée par le recruiteur, (Consultant) @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  finallyValidateJobApplicationAfterInterview(jobApplicationId: number) {
    if (jobApplicationId) {
      const jobApplicationToValidateId = jobApplicationId;
      const payload = { jobInterviewOK: true }; // On définit la valeur directement dans le payload

      // Demande de confirmation avant validation
      const confirmDialogRef =
        this.showConfirmDemandBeforValidateInterviewDialog().subscribe(confirmDialogRef => {
      // Gestion de la réponse de la boîte de dialogue de confirmation
      confirmDialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          // activer l'ajout de note
          this.updateAddNoteInterview(jobApplicationId);

          // Vérification que l'utilisateur a confirmé la suppression
          this.jobApplicationService
            .resultJobApplicationInterview(jobApplicationToValidateId, payload)
            .subscribe({
              next: (response: ApiResponse) => {
                this.showvalidateSuccessDialog(); // Affichage du succès de la suppression
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
      });
    });
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  // Méthode pour invalider et supprimer une annonce par un consultant ou un administrateur @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
finallyInvalidateJobApplicationAfterInterview(jobApplicationId: number) {
  // On vérifie si l'utilisateur est authentifié.
  this.authService.getIsAuthenticated().subscribe((isAuthenticated) => {
    if (!isAuthenticated) {
      this.router.navigate(['/signin']);
    } else {
      if (!this.isAdmin && !this.isConsultant) {
        // Affichage d'un message si l'utilisateur n'a pas les droits nécessaires
        this.showNotAllowedIsNotAdminDialog();
        return; // Important : arrête l'exécution si l'utilisateur n'a pas les droits
      } else if (jobApplicationId) {
        const jobApplicationToRefuseId = jobApplicationId;
        const payload = { jobInterviewOK: false }; // On définit la valeur directement dans le payload

        // Demande de confirmation avant suppression
        this.showConfirmDemandBeforDeleteDialog().subscribe(confirmDialogRef => {
          // Gestion de la réponse de la boîte de dialogue de confirmation
          confirmDialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
              // Vérification que l'utilisateur a confirmé la suppression
              this.jobApplicationService
                .resultJobApplicationInterview(
                  jobApplicationToRefuseId,
                  payload
                )
                .subscribe({
                  next: (response: ApiResponse) => {
                    this.showDeleteJobApplicationSuccessDialog(); // Affichage du succès de la suppression
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
          });
        });
      }
    }
  });
}

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Suppression d'une annonce par le consultant ou le proprietaire @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
deleteThisAppointment(appointmentId: number) {
  if (appointmentId) {
    // Demande de confirmation avant de procéder à la suppression.
    this.showConfirmDemandBeforDeleteAppointmentDialog().subscribe(confirmDialogRef => {
      // On gère la réponse de la boîte de dialogue de confirmation.
      confirmDialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          // L'utilisateur confirme la suppression, on procède.
          this.appointmentService.cancelAppointment(appointmentId).subscribe({
            next: (response: ApiResponse) => {
              // Affichage d'une boîte de dialogue de succès.
              this.showDeleteSuccessDialog();
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
        // Si l'utilisateur annule, l'action est avortée et aucune autre action n'est entreprise.
      });
    });
  }
}


  // Méthode pour afficher le dialogue de succès apres suppression
  private showDeleteJobApplicationSuccessDialog() {
    this.translateService.get([
      'dialog.actionSuccess',
      'dialog.deleteJobApplicationSuccessMessage',
      'dialog.closeButton'
    ]).subscribe(translations => {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        disableClose: true,
        data: {
          title: translations['dialog.actionSuccess'],
          message: translations['dialog.deleteJobApplicationSuccessMessage'],
          buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
          messageClass: 'message-success',
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'close') {
          this.visibilityStateManagerService.saveState('dashboardState');
          this.toggleAppointmentMenuVisibility();
          location.reload();
        }
      });
    });
  }




  
    // Méthode pour afficher le dialogue de succès apres fermeture d'une offre
    private showClosingJobSuccessDialog() {
      this.translateService.get([
        'dialog.offerClosed',
        'dialog.offerClosedSuccessMessage',
        'dialog.closeButton'
      ]).subscribe(translations => {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          width: '350px',
          disableClose: true,
          data: {
            title: translations['dialog.offerClosed'],
            message: translations['dialog.offerClosedSuccessMessage'],
            buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
            messageClass: 'message-success',
          },
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result === 'close') {
            this.visibilityStateManagerService.saveState('dashboardState');
            this.toggleAppointmentMenuVisibility();
            location.reload();
          }
        });
      });
    }
  
    // Méthode pour afficher le dialogue de succès apres suppression
    private showDeleteSuccessDialog() {
      this.translateService.get([
        'dialog.deletionSuccess',
        'dialog.appointmentDeletedSuccessMessage',
        'dialog.closeButton'
      ]).subscribe(translations => {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          width: '400px',
          disableClose: true,
          data: {
            title: translations['dialog.deletionSuccess'],
            message: translations['dialog.appointmentDeletedSuccessMessage'],
            buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
            messageClass: 'message-success',
          },
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result === 'close') {
            this.visibilityStateManagerService.restoreState('dashboardState');
            this.toggleAppointmentMenuVisibility();
            location.reload();
          }
        });
      });
    }
  
  
   
// Méthode pour demander confirmation avant de clôturer une offre d'emploi.
private showConfirmDemandBeforClosingJobDialog(): Observable<MatDialogRef<ConfirmDialogComponent>> {
  return this.translateService.get([
    'dialog.confirmationRequired',
    'dialog.closeOfferConfirmationMessage',
    'dialog.yesButton',
    'dialog.noButton'
  ]).pipe(
    switchMap(translations => {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        disableClose: true,
        data: {
          title: translations['dialog.confirmationRequired'],
          message: translations['dialog.closeOfferConfirmationMessage'],
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
  
    // Méthode pour afficher le dialogue d'erreur après une tentative d'enregistrement échouée
    private showRegisterAppointmentErrorDialog(errorMessage: string) {
      this.translateService.get([
        'dialog.errorTitle',
        'dialog.closeButton'
      ]).subscribe(translations => {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
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
            this.visibilityStateManagerService.restoreState('dashboardState');
            this.toggleAppointmentMenuVisibility();
            location.reload();
          }
        });
      });
    }
  
    // Méthode pour afficher le dialogue d'erreur de suppression non autorisée par un non Admin
    private showNotAllowedIsNotAdminDialog(): void {
      this.translateService.get([
        'dialog.notAllowedDeleteTitle',
        'dialog.notAllowedDeleteMessage',
        'dialog.closeButton'
      ]).subscribe(translations => {
        this.dialog.open(ConfirmDialogComponent, {
          width: '300px',
          disableClose: true,
          data: {
            title: translations['dialog.notAllowedDeleteTitle'],
            message: translations['dialog.notAllowedDeleteMessage'],
            buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
            messageClass: 'message-error',
          },
        });
      });
    }
  
    // Méthode pour afficher le dialogue d'erreur de validation non autorisée par un non recruteur ni Admin
    private showNotAllowedToValidateDialog(): void {
      this.translateService.get([
        'dialog.notAllowedValidationTitle',
        'dialog.notAllowedValidationMessage',
        'dialog.closeButton'
      ]).subscribe(translations => {
        this.dialog.open(ConfirmDialogComponent, {
          width: '300px',
          disableClose: true,
          data: {
            title: translations['dialog.notAllowedValidationTitle'],
            message: translations['dialog.notAllowedValidationMessage'],
            buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
            messageClass: 'message-error',
          },
        });
      });
    }
  
  
// Méthode pour demander confirmation avant de procéder à la validation d'un entretien.
private showConfirmDemandBeforValidateInterviewDialog(): Observable<MatDialogRef<ConfirmDialogComponent>> {
  return this.translateService.get([
    'dialog.confirmationRequired',
    'dialog.validateInterviewConfirmationMessage',
    'dialog.validateInterviewDetails.part1',
    'dialog.validateInterviewDetails.listItem1',
    'dialog.validateInterviewDetails.listItem2',
    'dialog.validateInterviewDetails.listItem3',
    'dialog.validateInterviewDetails.confirmation',
    'dialog.yesButton',
    'dialog.noButton'
  ]).pipe(
    switchMap(translations => {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '650px',
        disableClose: true,
        data: {
          title: translations['dialog.confirmationRequired'],
          message: `
            <p>${translations['dialog.validateInterviewConfirmationMessage']}</p>
            <p>${translations['dialog.validateInterviewDetails.part1']}</p>
            <ul>
              <li> - ${translations['dialog.validateInterviewDetails.listItem1']}</li>
              <li> - ${translations['dialog.validateInterviewDetails.listItem2']}</li>
              <li> - ${translations['dialog.validateInterviewDetails.listItem3']}</li>
            </ul>
            <p>${translations['dialog.validateInterviewDetails.confirmation']}</p>
          `,
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

 
  
    private showvalidateSuccessDialog() {
      this.translateService.get([
        'dialog.candidateRetained',
        'dialog.candidateRetainedMessage',
        'dialog.closeButton'
      ]).subscribe(translations => {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          width: '350px',
          height: 'auto',
          disableClose: true,
          data: {
            title: translations['dialog.candidateRetained'],
            message: translations['dialog.candidateRetainedMessage'],
            buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
            messageClass: 'message-success',
          },
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result === 'close') {
            this.visibilityStateManagerService.saveState('dashboardState');
            this.toggleAppointmentMenuVisibility();
            location.reload();
          }
        });
      });
    }





  

// Méthode pour afficher le dialogue d'erreur
private showErrorDialog(error: any) {
  const errorMessage = this.handleError(error); // Utilise une méthode existante pour obtenir le message d'erreur
  this.translateService.get(['dialog.errorTitle', 'dialog.closeButton']).subscribe(translations => {
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
      data: {
        title: translations['dialog.errorTitle'],
        message: errorMessage, // Affiche le message d'erreur récupéré
        buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
        messageClass: 'message-error',
      },
    });
  });
}





// Méthode pour demander confirmation avant de procéder à la validation.
private showConfirmDemandBeforValidateDialog(): Observable<MatDialogRef<ConfirmDialogComponent>> {
  return this.translateService.get([
    'dialog.confirmationRequired',
    'dialog.validateApplicationConfirmationMessage',
    'dialog.yesButton',
    'dialog.noButton'
  ]).pipe(
    switchMap(translations => {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        disableClose: true,
        data: {
          title: translations['dialog.confirmationRequired'],
          message: translations['dialog.validateApplicationConfirmationMessage'],
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
    'dialog.rejectApplicationConfirmationMessage',
    'dialog.yesButton',
    'dialog.noButton'
  ]).pipe(
    switchMap(translations => {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        disableClose: true,
        data: {
          title: translations['dialog.confirmationRequired'],
          message: translations['dialog.rejectApplicationConfirmationMessage'],
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
// Méthode pour demander confirmation avant de procéder à la suppression d'un rendez-vous
private showConfirmDemandBeforDeleteAppointmentDialog(): Observable<MatDialogRef<ConfirmDialogComponent>> {
  return this.translateService.get([
    'dialog.confirmationRequired',
    'dialog.deleteAppointmentMessage',
    'dialog.yesButton',
    'dialog.noButton'
  ]).pipe(
    switchMap(translations => {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
        data: {
          title: translations['dialog.confirmationRequired'],
          message: translations['dialog.deleteAppointmentMessage'],
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




// Méthode pour afficher le dialogue de succès après validation
private showRegisterAppointmentSuccessDialog() {
  this.translateService.get([
    'dialog.successTitle',
    'dialog.registerAppointmentSuccessMessage',
    'dialog.closeButton'
  ]).subscribe(translations => {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: translations['dialog.successTitle'],
        message: translations['dialog.registerAppointmentSuccessMessage'],
        buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
        messageClass: 'message-success',
      },
    });
    // Après la fermeture du dialogue
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'close') {
        this.initializeFormWithJobApplicationData(); // Réinitialiser le formulaire
        location.reload();
      }
    });
  });
}



  //  Liste les candidatures suivies par le consultant avec infos sélectionnées.
  findAllJobApplicationsFollowUpByConsultant() {
    console.log('Executing toggleJobApplyMenuVisibility');
    this.subscriptions.add(
      this.jobApplicationService
        .findAllJobApplicationsFollowUpByConsultant()
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            if (response.result && Array.isArray(response.data)) {
              // Cast response.data to the JobApplications[] type.
              this.jobAppli = response.data as JobApplications[];

              // Calculer le nombre total de candidatures
              this.totalApplicationsCount = this.jobAppli.length;

              // Ajouter la propriété applicationCount à chaque offre d'emploi
              this.jobAppli.forEach((application) => {
                application.applicationCount = this.jobAppli.filter(
                  (app) =>
                    app.jobListing.jobListingId ===
                    application.jobListing.jobListingId
                ).length;
              });

              // Afficher le nombre total de candidatures dans la console (pour le débogage)
              console.log('Total applications:', this.totalApplicationsCount);
              // Afficher les candidatures avec leur nombre dans la console (pour le débogage)
              console.log('Job applications:', this.jobAppli);
            }
          },
          // Gestion de l'erreur
          error: (error) => {
            this.showErrorDialog(error); //
          },
        })
    );
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Pour basculer entre sauvegarder et supprimer la sauvegarde d'une offre d'emploi @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  toggleSaveJob(job: JobListings, event: MouseEvent): void {
    event.stopPropagation(); // Empêche l'événement de se propager

    this.authService.getIsAuthenticated().subscribe((isAuthenticated) => {
      if (!isAuthenticated) {
        const currentUrl = this.router.url; // Obtient l'URL actuelle
        this.router.navigate(['/signin'], {
          queryParams: { returnUrl: currentUrl },
        });
      } else {
        if (job.isSaved) {
          //       this.deleteSaveJob(job.jobListingId, event, job); // Appelle deleteSaveJob si l'offre est déjà sauvegardée
        } else {
          this.saveJob(job, event); // Appelle saveJob si l'offre n'est pas sauvegardée
        }
      }
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Save a Job @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  saveJob(job: JobListings, event: MouseEvent): void {
    event.stopPropagation(); // Empêche l'événement de se propager

    // Utilisation du service pour l'appel API
    this.saveJobService
      .createSavejob({ jobListingId: job.jobListingId })
      .subscribe({
        next: (response: ApiResponse) => {
          // On caste la réponse,
          response.data as SaveJobResponse;

          job.isSaved = true; // Met à jour la propriété isSaved de l'objet job l'indicateur de sauvegarde

          // Gestion de la réponse réussie avec popup de confirmation
          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '360px',
            height: '180px',
            data: {
              //  title: 'Sauvegarde réussie !',
              message: 'Sauvegarde ajoutée à votre profil.',
              // buttons: [{ text: 'Fermer', value: 'close', class: 'cancel-button' }],
              messageClass: 'message-success',
            },
            // Désactivation de la fermeture automatique au clic à l'extérieur
            disableClose: true,
          });

          // Fermeture automatique du dialogue après 2 secondes
          setTimeout(() => {
            dialogRef.close();
          }, 1000);
        },
        error: (errorResponse: ApiResponse) => {
          console.error(`Erreur lors de l'enregistrement:`, errorResponse);
          // Utilisation de la classe Base "handleError" pour gérer les erreurs
          this.errorMessage = this.handleError(errorResponse);
        },
      });
  }
  

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour supprimer la sauvegarde d'une offre d'emploi
  deleteSaveJob(jobId: number, event: MouseEvent, job: SaveJobs): void {
    event.stopPropagation(); // Empêche l'événement de se propager plus loin (utile pour éviter des clics supplémentaires)

    // Appel à l'API pour supprimer la sauvegarde
    this.savedJobsService.saveJobDelete(jobId).subscribe({
      next: (response: ApiResponse) => {},
      error: (errorResponse: ApiResponse) => {
        this.errorMessage = this.handleError(errorResponse);
        // Potentiellement gérer ici l'indication visuelle d'une erreur
      },
    });
    location.reload();
  }

  fetchUsersList() {
    this.userService.usersListByAdmin().subscribe({
      next: (response: ApiResponseWithCount) => {
        if (response.result && Array.isArray(response.data)) {
          this.users = response.data as Users[];
          this.usersCount = response.count;

          this.allUSers = this.users;
          this.allUSersCount = this.usersCount;
        }
      },
      error: (error) => {
        this.errorMessage = this.handleError(error);
      },
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  les job titles @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  fetchInactiveUsersList() {
    this.userService.inactiveUsersListByAdmin().subscribe({
      next: (response: ApiResponseWithCount) => {
        if (response.result && Array.isArray(response.data)) {
          this.users = response.data as Users[];
          this.usersCount = response.count;

          this.inactiveUsers = this.users;
          this.inactiveUsersCount = this.usersCount;
        }
      },
      error: (error) => {
        this.errorMessage = this.handleError(error);
      },
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  les job titles @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  fetchActiveUsersList() {
    this.userService.activeUsersListByAdmin().subscribe({
      next: (response: ApiResponseWithCount) => {
        if (response.result && Array.isArray(response.data)) {
          this.users = response.data as Users[];
          this.usersCount = response.count;

          this.activeUsers = this.users;
          this.activeUsersCount = this.usersCount;
        }
      },
      error: (error) => {
        this.errorMessage = this.handleError(error);
      },
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  les job titles @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  fetchJobListing() {
    this.jobListingService.jobListingListByAdmin().subscribe({
      next: (response: ApiResponseWithCount) => {
        if (response.result && Array.isArray(response.data)) {
          // Cast response.data to the JobListings[] type.
          this.jobListings = response.data as JobListings[];
          this.allJobListingsCount = response.count;
          this.jobListingsCount = response.count;
        }
      },
      error: (error) => {
        this.errorMessage = this.handleError(error);
      },
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  les job titles @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  fetchJobApplication() {
    this.jobApplicationService.getAllJobApplications().subscribe({
      next: (response: ApiResponseWithCount) => {
        if (response.result && Array.isArray(response.data)) {
          // Cast response.data to the JobListings[] type.
          this.jobAppli = response.data as JobApplications[];
          this.jobApplicationsCount = response.count;
        }
      },
      error: (error) => {
        this.errorMessage = this.handleError(error);
      },
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  les job titles @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  fetchInvalidedJobListing() {
    this.jobListingService.invalidedJobListingByAdmin().subscribe({
      next: (response: ApiResponseWithCount) => {
        if (response.result && Array.isArray(response.data)) {
          // Cast response.data to the JobListings[] type.
          this.jobListings = response.data as JobListings[];
          this.jobListingsCount = response.count;

          this.jobListingsInvalide = this.jobListings;

          this.invalidedJobListingCount = this.jobListingsCount;
        }
      },
      error: (error) => {
        this.errorMessage = this.handleError(error);
      },
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  les job titles @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  fetchValidedJobListing() {
    this.jobListingService.validedJobListingByAdmin().subscribe({
      next: (response: ApiResponseWithCount) => {
        if (response.result && Array.isArray(response.data)) {
          // Cast response.data to the JobListings[] type.
          this.jobListings = response.data as JobListings[];
          this.jobListingsCount = response.count;

          this.jobListingsValide = this.jobListings;
          this.validedJobListingCount = this.jobListingsCount;
        }
      },
      error: (error) => {
        this.errorMessage = this.handleError(error);
      },
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Mes Offres Suivies @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  loadMySavedJobListings() {
    // On appelle le service pour récupérer les offres d'emploi sauvegardées par le consultant
    this.savedJobsService.myAllJobsSavedConsultant().subscribe({
      next: (response: ApiResponseWithCount) => {
        // On vérifie si la réponse est valide et si les données sont un tableau
        if (response.result && Array.isArray(response.data)) {
          // On cast response.data au type SaveJobs[]
          this.myJobsaved = response.data as SaveJobs[];
          this.myJobsavedCount = response.count;

          // On ajoute la propriété applicationCount à chaque offre d'emploi
          this.myJobsaved.forEach((savedJob) => {
            // On affiche les candidatures liées à l'offre d'emploi pour le débogage
            console.log('Job Applications:', this.myJobsaved);

            // On compte le nombre de candidatures pour chaque offre d'emploi
            savedJob.jobListing.applicationCount = savedJob.jobListing
              .jobApplications
              ? savedJob.jobListing.jobApplications.length
              : 0;
              // On trie les candidatures avant de les utiliser
              savedJob.jobListing.jobApplications.sort((a, b) => {
                // Critère 1 : jobInterviewOK true
                if (a.jobInterviewOK && !b.jobInterviewOK) return -1;
                if (!a.jobInterviewOK && b.jobInterviewOK) return 1;

                // Critère 2 : application.appointment
                if (a.appointment && !b.appointment) return -1;
                if (!a.appointment && b.appointment) return 1;

                // Critère 3 : Trier sur la date du rendez-vous du plus proche au plus ancien
                if (a.appointment?.appointmentDate && b.appointment?.appointmentDate) {
                  return (
                    new Date(a.appointment.appointmentDate).getTime() -
                    new Date(b.appointment.appointmentDate).getTime()
                  );
                }

                // Critère 4 : application.status
                if (a.status && !b.status) return -1;
                if (!a.status && b.status) return 1;

                // Critère 5 : JobApplications.createdAt
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              });

              // On met à jour theAppointmentDate pour chaque application
          savedJob.jobListing.jobApplications.forEach(application => {
            if (application.appointment?.appointmentDate) {
              this.theAppointmentDate = new Date(application.appointment.appointmentDate);
            }
          });

            // On affiche le nombre de candidatures après tri pour le débogage
            console.log(
              'Application Count:',
              savedJob.jobListing.applicationCount
            );
          });

          // On affiche les offres sauvegardées avec leur nombre de candidatures dans la console pour le débogage
          console.log('MY JOB SAVED WITH APPLICATIONS:', this.myJobsaved);
        }
      },
      // On gère les erreurs en affichant une boîte de dialogue d'erreur
      error: (error) => {
        this.showErrorDialog(error);
      },
    });
  }

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  // Méthode vérifier le jour du RDV @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
isAppointmentTodayOrPast(appointmentDate: Date): boolean {

  if (!appointmentDate) {
    return false; // Si aucune date de rendez-vous n'est fournie, retourner false
  }

  const today = new Date();
  const appointment = new Date(appointmentDate);

  // Supprimer la partie heure pour comparer uniquement les dates
  today.setHours(0, 0, 0, 0);
  appointment.setHours(0, 0, 0, 0);

  // Comparer l'année, le mois et le jour des deux dates
  if (
    today.getFullYear() === appointment.getFullYear() &&
    today.getMonth() === appointment.getMonth() &&
    today.getDate() === appointment.getDate()
  ) {
    return true; // La date de rendez-vous est aujourd'hui
  }

  // Si la date de rendez-vous est dans le passé, retourner true
  if (appointment < today) {
    return true; // La date de rendez-vous est dans le passé
  }

  // Si la date de rendez-vous est dans le futur, retourner false
  return false;
}


  

  fetchMyProfile() {
    this.userService.me().subscribe({
      next: (response: ApiResponse) => {
        if (response.data && !Array.isArray(response.data)) {
          this.user = response.data as Users;
          this.collaboratorID = this.user?.userId;
          this.collaboratorName = this.user.name;
          this.collaboratorFirstname = this.user.firstname;
          this.collaboratorRole = this.user.role.title;
        }
      },
      error: (error) => this.showErrorDialog(error),
    });
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$    $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$






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

    // S'abonne aux rôles depuis DataService et reçoit les données sous forme d'un objet incluant la liste et le nombre total.
    this.dataService.roles$.subscribe(({ roles, count: rolesCount }) => {
      // Met à jour les propriétés du composant avec les données reçues.
      this.roles = roles; // Liste des rôles.
      this.rolesCount = rolesCount; // Nombre total de rôles.
    });

    this.dataService.company$.subscribe(({ company, count: companyCount }) => {
      // Met à jour les propriétés du composant avec les données reçues.
      this.company = company; // Liste des rôles.
      this.companyCount = companyCount; // Nombre total de rôles.
    });
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$  les Services de Filtrage   $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour filtrer les annonces par date de publication @@@@@@@@@
  filterByDate() {
    if (this.selectDate) {
      this.jobListingService
        .getAllJobsGroupedByTime(this.selectDate)
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            this.jobListings = response.data as JobListings[];
            this.jobListingsCount = response.count;
          },
          error: (error) => {
            this.errorMessage = this.handleError(error);
          },
        });
    }
  }

  filterByDateJObsValidate() {
    if (this.selectValidateDate) {
      this.jobListingService
        .getJobsGroupedByTimeValidate(this.selectValidateDate)
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            this.jobListings = response.data as JobListings[];
            this.jobListingsCount = response.count;

            this.jobListingsValide = this.jobListings;
          },
          error: (error) => {
            this.errorMessage = this.handleError(error);
          },
        });
    }
  }
  filterByDateJObsInvalidate() {
    if (this.selectInvalidateDate) {
      this.jobListingService
        .getJobsGroupedByTimeInvalidate(this.selectInvalidateDate)
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            this.jobListings = response.data as JobListings[];
            this.jobListingsCount = response.count;

            this.jobListingsInvalide = this.jobListings;
          },
          error: (error) => {
            this.errorMessage = this.handleError(error);
          },
        });
    }
  }

  filterByDateJObsMyJobSaved() {
    if (this.selectMyJobSavedDate) {
      this.jobListingService
        .getJobsGroupedByTimeInvalidate(this.selectMyJobSavedDate)
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            this.jobListings = response.data as JobListings[];
            this.jobListingsCount = response.count;

            this.jobListingsInvalide = this.jobListings;
          },
          error: (error) => {
            this.errorMessage = this.handleError(error);
          },
        });
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour filtrer les utilisateurs actifs avec un compte actif  @@@@@@@@@
  filterActiveUsersByRoleId() {
    // Vérifie si un role a été selectionné
    if (
      this.selectedRoleTitleForActiveUsers !== null &&
      this.selectedRoleTitleForActiveUsers !== undefined
    ) {
      // Appel au service JoblistingService pour rechercher les annonces par titre de poste
      this.userService
        .getAllActiveUsersByRoleId(this.selectedRoleTitleForActiveUsers)
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            // En cas de succès, les annonces filtrées sont affectées à users
            this.users = response.data as Users[];

            this.activeUsers = this.users;

            this.activeUsersCount = this.usersCount;
          },
          error: (error) => {
            // Gestion des erreurs et affichage d'un message si nécessaire
            this.errorMessage = this.handleError(error);
          },
        });
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour filtrer les utilisateurs actifs avec un compte actif  @@@@@@@@@
  filterInactiveUsersByRoleId() {
    // Vérifie si un role a été selectionné
    if (
      this.selectedRoleTitleForInactiveUsers !== null &&
      this.selectedRoleTitleForInactiveUsers !== undefined
    ) {
      // Appel au service JoblistingService pour rechercher les annonces par titre de poste
      this.userService
        .getAllInactiveUsersByRoleId(this.selectedRoleTitleForInactiveUsers)
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            // En cas de succès, les annonces filtrées sont affectées à users
            this.users = response.data as Users[];
            this.usersCount = response.count;

            this.inactiveUsers = this.users;
            this.inactiveUsersCount = this.usersCount;
          },
          error: (error) => {
            // Gestion des erreurs et affichage d'un message si nécessaire
            this.errorMessage = this.handleError(error);
          },
        });
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour filtrer les annonces par titre de poste @@@@@@@@@
  filterByJobTitle() {
    // Vérifie si un titre de poste a été sélectionné
    if (this.selectedJobTitle !== null && this.selectedJobTitle !== undefined) {
      // Appel au service JoblistingService pour rechercher les annonces par titre de poste
      this.jobListingService
        .searchJobByFunction(this.selectedJobTitle)
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            // En cas de succès, les annonces filtrées sont affectées à jobListings
            this.jobListings = response.data as JobListings[];
            // Mise à jour du compteur d'annonces
            this.jobListingsCount = response.count;
          },
          error: (error) => {
            // Gestion des erreurs et affichage d'un message si nécessaire
            this.errorMessage = this.handleError(error);
          },
        });
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour filtrer les annonces Validées par titre de poste @@@@@@@@@
  filterJobValidateByJobTitle() {
    // Vérifie si un titre de poste a été sélectionné
    if (
      this.selectedValidateJobTitle !== null &&
      this.selectedValidateJobTitle !== undefined
    ) {
      // Appel au service JoblistingService pour rechercher les annonces par titre de poste
      this.jobListingService
        .searchJobValidateByFunction(this.selectedValidateJobTitle)
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            // En cas de succès, les annonces filtrées sont affectées à jobListings
            this.jobListings = response.data as JobListings[];
            // Mise à jour du compteur d'annonces
            this.jobListingsValide = this.jobListings;
          },
          error: (error) => {
            // Gestion des erreurs et affichage d'un message si nécessaire
            this.errorMessage = this.handleError(error);
          },
        });
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour filtrer les annonces Invalidées par titre de poste @@@@@@@@@
  filterJobInvalidateByJobTitle() {
    // Vérifie si un titre de poste a été sélectionné
    if (
      this.selectedInvalidateJobTitle !== null &&
      this.selectedInvalidateJobTitle !== undefined
    ) {
      // Appel au service JoblistingService pour rechercher les annonces par titre de poste
      this.jobListingService
        .searchJobInvalidateByFunction(this.selectedInvalidateJobTitle)
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            // En cas de succès, les annonces filtrées sont affectées à jobListings
            this.jobListings = response.data as JobListings[];
            this.jobListingsInvalide = this.jobListings;
          },
          error: (error) => {
            // Gestion des erreurs et affichage d'un message si nécessaire
            this.errorMessage = this.handleError(error);
          },
        });
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour filtrer les annonces par localisation @@@@@@@@@
  filterByJobLocation() {
    // Vérifie si une localisation a été sélectionnée
    if (
      this.selectedJobLocation !== null &&
      this.selectedJobLocation !== undefined
    ) {
      // Appel au service pour rechercher les annonces par localisation
      this.jobListingService
        .searchJobByLocation(this.selectedJobLocation)
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            // Affectation des résultats filtrés à la liste des annonces
            this.jobListings = response.data as JobListings[];
            // Mise à jour du nombre total d'annonces filtrées
            this.jobListingsCount = response.count;
          },
          error: (error) => {
            // Affichage d'un message en cas d'erreur
            this.errorMessage = this.handleError(error);
          },
        });
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour filtrer les annonces par localisation @@@@@@@@@
  filterInvalideByJobLocation() {
    // Vérifie si une localisation a été sélectionnée
    if (
      this.selectedInvalidateJobLocation !== null &&
      this.selectedInvalidateJobLocation !== undefined
    ) {
      // Appel au service pour rechercher les annonces par localisation
      this.jobListingService
        .searchInvalideByJobLocation(this.selectedInvalidateJobLocation)
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            // Affectation des résultats filtrés à la liste des annonces
            this.jobListings = response.data as JobListings[];
            // Mise à jour du nombre total d'annonces filtrées
            this.jobListingsInvalide = this.jobListings;
          },
          error: (error) => {
            // Affichage d'un message en cas d'erreur
            this.errorMessage = this.handleError(error);
          },
        });
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour filtrer les annonces par localisation @@@@@@@@@
  filterValideByJobLocation() {
    // Vérifie si une localisation a été sélectionnée
    if (
      this.selectedValidateJobLocation !== null &&
      this.selectedValidateJobLocation !== undefined
    ) {
      // Appel au service pour rechercher les annonces par localisation
      this.jobListingService
        .searchValideByJobLocation(this.selectedValidateJobLocation)
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            // Affectation des résultats filtrés à la liste des annonces
            this.jobListings = response.data as JobListings[];
            // Mise à jour du nombre total d'annonces filtrées
            this.jobListingsValide = this.jobListings;
          },
          error: (error) => {
            // Affichage d'un message en cas d'erreur
            this.errorMessage = this.handleError(error);
          },
        });
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour filtrer les annonces par type de contrat @@@@@@@@@
  filterByContractType() {
    // Vérifie si un type de contrat a été sélectionné
    if (
      this.selectedContractType !== null &&
      this.selectedContractType !== undefined
    ) {
      // Appel au service JoblistingService pour rechercher les annonces par type de contrat
      this.jobListingService
        .searchJobByContractTypeByAdmin(this.selectedContractType)
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            // En cas de succès, les données reçues sont affectées à la propriété jobListings.
            // response.data est casté en JobListings[] pour correspondre au type attendu par jobListings.
            this.jobListings = response.data as JobListings[];
            // Le nombre total d'annonces correspondantes est stocké dans jobListingsCount.
            this.jobListingsCount = response.count;
          },
          error: (error) => {
            // En cas d'erreur lors de l'appel au service, handleError est appelé avec l'erreur
            // pour traiter l'erreur et éventuellement afficher un message.
            this.errorMessage = this.handleError(error);
          },
        });
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour filtrer les annonces par type de contrat @@@@@@@@@
  filterByContractTypeInvalidate() {
    // Vérifie si un type de contrat a été sélectionné
    if (
      this.selectedInvalidateContractType !== null &&
      this.selectedInvalidateContractType !== undefined
    ) {
      // Appel au service JoblistingService pour rechercher les annonces par type de contrat
      this.jobListingService
        .searchJobByContractTypeInvalidate(this.selectedInvalidateContractType)
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            // En cas de succès, les données reçues sont affectées à la propriété jobListings.
            // response.data est casté en JobListings[] pour correspondre au type attendu par jobListings.
            this.jobListings = response.data as JobListings[];
            // Le nombre total d'annonces correspondantes est stocké dans jobListingsCount.
            this.jobListingsInvalide = this.jobListings;
          },
          error: (error) => {
            // En cas d'erreur lors de l'appel au service, handleError est appelé avec l'erreur
            // pour traiter l'erreur et éventuellement afficher un message.
            this.errorMessage = this.handleError(error);
          },
        });
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour filtrer les annonces par type de contrat @@@@@@@@@
  filterByContractTypeValidate() {
    // Vérifie si un type de contrat a été sélectionné
    if (
      this.selectedValidateContractType !== null &&
      this.selectedValidateContractType !== undefined
    ) {
      // Appel au service JoblistingService pour rechercher les annonces par type de contrat
      this.jobListingService
        .searchJobByContractTypeValidate(this.selectedValidateContractType)
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            // En cas de succès, les données reçues sont affectées à la propriété jobListings.
            // response.data est casté en JobListings[] pour correspondre au type attendu par jobListings.
            this.jobListings = response.data as JobListings[];
            // Le nombre total d'annonces correspondantes est stocké dans jobListingsCount.
            this.jobListingsValide = this.jobListings;
          },
          error: (error) => {
            // En cas d'erreur lors de l'appel au service, handleError est appelé avec l'erreur
            // pour traiter l'erreur et éventuellement afficher un message.
            this.errorMessage = this.handleError(error);
          },
        });
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour filtrer les annonces par nom de compagnie @@@@@@@@@
  filterByCompany() {
    // Vérifie si une compagnie a été sélectionnée
    if (this.selectedCompany !== null && this.selectedCompany !== undefined) {
      // Recherche des annonces par nom de compagnie
      this.jobListingService
        .searchJobByCompanyNameByAdmin(this.selectedCompany)
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            // Les annonces filtrées sont stockées dans jobListings
            this.jobListings = response.data as JobListings[];
            // Actualisation du compteur d'annonces
            this.jobListingsCount = response.count;
          },
          error: (error) => {
            // Traitement de l'erreur et affichage d'un message si nécessaire
            this.errorMessage = this.handleError(error);
          },
        });
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour filtrer les annonces par nom de compagnie @@@@@@@@@
  filterValidateByCompany() {
    // Vérifie si une compagnie a été sélectionnée
    if (
      this.selectedValidateCompany !== null &&
      this.selectedValidateCompany !== undefined
    ) {
      // Recherche des annonces par nom de compagnie
      this.jobListingService
        .searchJobByCompanyNameValidate(this.selectedValidateCompany)
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            // Les annonces filtrées sont stockées dans jobListings
            this.jobListings = response.data as JobListings[];

            this.jobListingsValide = this.jobListings;
          },
          error: (error) => {
            // Traitement de l'erreur et affichage d'un message si nécessaire
            this.errorMessage = this.handleError(error);
          },
        });
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour filtrer les annonces par nom de compagnie @@@@@@@@@
  filterInvalidateByCompany() {
    // Vérifie si une compagnie a été sélectionnée
    if (
      this.selectedInvalidateCompany !== null &&
      this.selectedInvalidateCompany !== undefined
    ) {
      // Recherche des annonces par nom de compagnie
      this.jobListingService
        .searchJobByCompanyNameInvalidate(this.selectedInvalidateCompany)
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            // Les annonces filtrées sont stockées dans jobListings
            this.jobListings = response.data as JobListings[];
            // Actualisation du compteur d'annonces
            this.jobListingsInvalide = this.jobListings;
          },
          error: (error) => {
            // Traitement de l'erreur et affichage d'un message si nécessaire
            this.errorMessage = this.handleError(error);
          },
        });
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour initialiser la recherche asynchrone par mot clé dans la table Users @@@@@@@@@
  initializeAsyncUsersSearch() {
    this.searchUsersControl.valueChanges
      .pipe(
        map((term) => (term ? term.trim() : '')), // Supprime les espaces inutiles au début et à la fin.
        debounceTime(300), // Attend 300ms après la dernière frappe avant de considérer le terme.
        distinctUntilChanged(),
        tap((term) => {
          if (term === '') {
            // Si le champ de recherche est vidé, appeler fetchInactiveUsersList.
            this.fetchUsersList();
          }
        }),
        // Ignorer le nouveau terme s'il est identique au terme précédent.
        filter(
          (term) =>
            term.length > 2 && term.length <= 50 && /^[a-zA-Z0-9 ]+$/.test(term)
        ), // Vérifie la longueur et les caractères permis.
        map((term) => term.replace(/[^a-zA-Z0-9 ]/g, '')), // Nettoie la chaîne en supprimant tout ce qui n'est pas alphanumérique ou espace.
        switchMap((term) => this.userService.searchUsersByNameByAdmin(term)), // Effectue la recherche avec le terme nettoyé.
        takeUntil(this.unsubscribe$) // Assure la désinscription proprement lors de la destruction du composant.
      )
      .subscribe({
        next: (response: ApiResponseWithCount) => {
          // Traiter la réponse ici. Les résultats de la recherche sont assignés à la variable jobListings.
          this.allUSers = response.data as Users[];
        },
        error: (error) => {
          // Traitement de l'erreur et affichage d'un message si nécessaire.
          this.errorMessage = this.handleError(error);
        },
      });
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour initialiser la recherche asynchrone par mot clé dans les comptes invalidés  @@@@@@@@@
  initializeAsyncUsersInvalideSearch() {
    this.searchUsersInvalidateControl.valueChanges
      .pipe(
        map((term) => (term ? term.trim() : '')), // Supprime les espaces inutiles au début et à la fin.
        debounceTime(300), // Attend 300ms après la dernière frappe avant de considérer le terme.
        distinctUntilChanged(),
        tap((term) => {
          if (term === '') {
            // Si le champ de recherche est vidé, appeler fetchInactiveUsersList.
            this.fetchInactiveUsersList();
          }
        }),
        // Ignorer le nouveau terme s'il est identique au terme précédent.
        filter(
          (term) =>
            term.length > 2 && term.length <= 50 && /^[a-zA-Z0-9 ]+$/.test(term)
        ), // Vérifie la longueur et les caractères permis.
        map((term) => term.replace(/[^a-zA-Z0-9 ]/g, '')), // Nettoie la chaîne en supprimant tout ce qui n'est pas alphanumérique ou espace.
        switchMap((term) =>
          this.userService.searchUsersInactiveByNameByAdmin(term)
        ), // Effectue la recherche avec le terme nettoyé.
        takeUntil(this.unsubscribe$) // Assure la désinscription proprement lors de la destruction du composant.
      )
      .subscribe({
        next: (response: ApiResponseWithCount) => {
          // Traiter la réponse ici. Les résultats de la recherche sont assignés à la variable jobListings.
          this.users = response.data as Users[];
          this.usersCount = response.count;

          this.inactiveUsers = this.users;
        },
        error: (error) => {
          // Traitement de l'erreur et affichage d'un message si nécessaire.
          this.errorMessage = this.handleError(error);
        },
      });
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour initialiser la recherche asynchrone par mot clé dans les comptes validés @@@@@@@@@
  initializeAsyncUsersValidateSearch() {
    this.searchUsersValidateControl.valueChanges
      .pipe(
        map((term) => (term ? term.trim() : '')), // Supprime les espaces inutiles au début et à la fin.
        debounceTime(300), // Attend 300ms après la dernière frappe avant de considérer le terme.
        distinctUntilChanged(),
        tap((term) => {
          if (term === '') {
            // Si le champ de recherche est vidé, appeler fetchInactiveUsersList.
            this.fetchActiveUsersList();
          }
        }),
        // Ignorer le nouveau terme s'il est identique au terme précédent.
        filter(
          (term) =>
            term.length > 2 && term.length <= 50 && /^[a-zA-Z0-9 ]+$/.test(term)
        ), // Vérifie la longueur et les caractères permis.
        map((term) => term.replace(/[^a-zA-Z0-9 ]/g, '')), // Nettoie la chaîne en supprimant tout ce qui n'est pas alphanumérique ou espace.
        switchMap((term) =>
          this.userService.searchUsersActiveByNameByAdmin(term)
        ), // Effectue la recherche avec le terme nettoyé.
        takeUntil(this.unsubscribe$) // Assure la désinscription proprement lors de la destruction du composant.
      )
      .subscribe({
        next: (response: ApiResponseWithCount) => {
          // Traiter la réponse ici. Les résultats de la recherche sont assignés à la variable jobListings.
          this.users = response.data as Users[];
          this.usersCount = response.count;

          this.activeUsers = this.users;
        },
        error: (error) => {
          // Traitement de l'erreur et affichage d'un message si nécessaire.
          this.errorMessage = this.handleError(error);
        },
      });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour initialiser la recherche asynchrone par mot clé dans les comptes validés @@@@@@@@@
  initializeAsyncInfoInAppointSearch() {
    this.searchInfoInAppointementInterviewControl.valueChanges
      .pipe(
        map((term) => (term ? term.trim() : '')), // Supprime les espaces inutiles au début et à la fin.
        debounceTime(300), // Attend 300ms après la dernière frappe avant de considérer le terme.
        distinctUntilChanged(),
        tap((term) => {
          if (term === '') {
            // Si le champ de recherche est vidé.
            this.loadAllInterviewAppointments();
          }
        }),
        // Ignorer le nouveau terme s'il est identique au terme précédent.
        filter(
          (term) =>
            term.length > 2 && term.length <= 50 && /^[a-zA-Z0-9 ]+$/.test(term)
        ), // Vérifie la longueur et les caractères permis.
        map((term) => term.replace(/[^a-zA-Z0-9 ]/g, '')), // Nettoie la chaîne en supprimant tout ce qui n'est pas alphanumérique ou espace.
        switchMap((term) =>
          this.appointmentService.searchInfoInAppointmentByAdmin(term)
        ), // Effectue la recherche avec le terme nettoyé.
        takeUntil(this.unsubscribe$) // Assure la désinscription proprement lors de la destruction du composant.
      )
      .subscribe({
        next: (response: ApiResponseWithCount) => {
          // Traiter la réponse ici. Les résultats de la recherche sont assignés à la variable jobListings.
          this.AllAppointmentGrouped = response.data as Appointment[];
          this.AllAppointmentGroupedCount = response.count;
        },
        error: (error) => {
          // Traitement de l'erreur et affichage d'un message si nécessaire.
          this.errorMessage = this.handleError(error);
        },
      });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour initialiser la recherche asynchrone par mot clé dans les comptes validés @@@@@@@@@
  initializeAsyncInfoInMyInterviewAppointmentsSearch() {
    this.searchInfoInMyAppointementInterviewControl.valueChanges
      .pipe(
        map((term) => (term ? term.trim() : '')), // Supprime les espaces inutiles au début et à la fin.
        debounceTime(300), // Attend 300ms après la dernière frappe avant de considérer le terme.
        distinctUntilChanged(),
        tap((term) => {
          if (term === '') {
            // Si le champ de recherche est vidé.
            this.loadMyInterviewAppointmentsFilterByDate();
          }
        }),
        // Ignorer le nouveau terme s'il est identique au terme précédent.
        filter(
          (term) =>
            term.length > 2 && term.length <= 50 && /^[a-zA-Z0-9 ]+$/.test(term)
        ), // Vérifie la longueur et les caractères permis.
        map((term) => term.replace(/[^a-zA-Z0-9 ]/g, '')), // Nettoie la chaîne en supprimant tout ce qui n'est pas alphanumérique ou espace.
        switchMap((term) =>
          this.appointmentService.searchInfoInMyAppointmentByAdmin(term)
        ), // Effectue la recherche avec le terme nettoyé.
        takeUntil(this.unsubscribe$) // Assure la désinscription proprement lors de la destruction du composant.
      )
      .subscribe({
        next: (response: ApiResponseWithCount) => {
          // Traiter la réponse ici. Les résultats de la recherche sont assignés à la variable jobListings.
          this.myAppointmentGrouped = response.data as Appointment[];
          this.myAppointmentGroupedCount = response.count;
        },
        error: (error) => {
          // Traitement de l'erreur et affichage d'un message si nécessaire.
          this.errorMessage = this.handleError(error);
        },
      });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour initialiser la recherche asynchrone par mot clé dans la table JobListings @@@@@@@@@
  initializeAsyncJobListingSearch() {
    this.searchJoblistingsControl.valueChanges
      .pipe(
        map((term) => (term ? term.trim() : '')), // Supprime les espaces inutiles au début et à la fin.
        debounceTime(300), // Attend 300ms après la dernière frappe avant de considérer le terme.
        distinctUntilChanged(),
        tap((term) => {
          if (term === '') {
            // Si le champ de recherche est vidé, appeler fetchJobListing pour réafficher toutes les offres.
            this.fetchJobListing();
          }
        }),
        // Ignorer le nouveau terme s'il est identique au terme précédent.
        filter(
          (term) =>
            term.length > 2 && term.length <= 50 && /^[a-zA-Z0-9 ]+$/.test(term)
        ), // Vérifie la longueur et les caractères permis.
        map((term) => term.replace(/[^a-zA-Z0-9 ]/g, '')), // Nettoie la chaîne en supprimant tout ce qui n'est pas alphanumérique ou espace.
        switchMap((term) =>
          this.jobListingService.searchAllJobListingByWord(term)
        ), // Effectue la recherche avec le terme nettoyé.
        takeUntil(this.unsubscribe$) // Assure la désinscription proprement lors de la destruction du composant.
      )
      .subscribe({
        next: (response: ApiResponseWithCount) => {
          // Traiter la réponse ici. Les résultats de la recherche sont assignés à la variable jobListings.
          this.jobListings = response.data as JobListings[];

          console.log('RESULTAT DE LA RECHERCHE', this.jobListings);
        },
        error: (error) => {
          // Traitement de l'erreur et affichage d'un message si nécessaire.
          this.errorMessage = this.handleError(error);
        },
      });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour initialiser la recherche asynchrone d'une offre validée par mot clé @@@@@@@@@
  initializeAsyncJobListingValidateSearch() {
    this.searchJoblistingsValidateControl.valueChanges
      .pipe(
        map((term) => (term ? term.trim() : '')), // Supprime les espaces inutiles au début et à la fin.
        debounceTime(300), // Attend 300ms après la dernière frappe avant de considérer le terme.
        distinctUntilChanged(),
        tap((term) => {
          if (term === '') {
            // Si le champ de recherche est vidé, appeler fetchJobListing pour réafficher toutes les offres.
            this.fetchValidedJobListing();
          }
        }),
        // Ignorer le nouveau terme s'il est identique au terme précédent.
        filter(
          (term) =>
            term.length > 2 && term.length <= 50 && /^[a-zA-Z0-9 ]+$/.test(term)
        ), // Vérifie la longueur et les caractères permis.
        map((term) => term.replace(/[^a-zA-Z0-9 ]/g, '')), // Nettoie la chaîne en supprimant tout ce qui n'est pas alphanumérique ou espace.
        switchMap((term) =>
          this.jobListingService.searchJobListingValidateByWordAccessAdmin(term)
        ), // Effectue la recherche avec le terme nettoyé.
        takeUntil(this.unsubscribe$) // Assure la désinscription proprement lors de la destruction du composant.
      )
      .subscribe({
        next: (response: ApiResponseWithCount) => {
          // Traiter la réponse ici. Les résultats de la recherche sont assignés à la variable jobListings.
          this.jobListings = response.data as JobListings[];
          this.jobListingsCount = response.count; // Le nombre total de résultats correspondants est mis à jour.

          this.jobListingsValide = this.jobListings;
        },
        error: (error) => {
          // Traitement de l'erreur et affichage d'un message si nécessaire.
          this.errorMessage = this.handleError(error);
        },
      });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour initialiser la recherche asynchrone d'une offre non validée par mot clé @@@@@@@@@
  initializeAsyncJobListingInvalidateSearch() {
    this.searchJoblistingsInvalidateControl.valueChanges
      .pipe(
        map((term) => (term ? term.trim() : '')), // Supprime les espaces inutiles au début et à la fin.
        debounceTime(300), // Attend 300ms après la dernière frappe avant de considérer le terme.
        distinctUntilChanged(),
        tap((term) => {
          if (term === '') {
            // Si le champ de recherche est vidé, appeler fetchJobListing pour réafficher toutes les offres.
            this.fetchInvalidedJobListing();
          }
        }),
        // Ignorer le nouveau terme s'il est identique au terme précédent.
        filter(
          (term) =>
            term.length > 2 && term.length <= 50 && /^[a-zA-Z0-9 ]+$/.test(term)
        ), // Vérifie la longueur et les caractères permis.
        map((term) => term.replace(/[^a-zA-Z0-9 ]/g, '')), // Nettoie la chaîne en supprimant tout ce qui n'est pas alphanumérique ou espace.
        switchMap((term) =>
          this.jobListingService.searchJobListingInvalidateByWord(term)
        ), // Effectue la recherche avec le terme nettoyé.
        takeUntil(this.unsubscribe$) // Assure la désinscription proprement lors de la destruction du composant.
      )
      .subscribe({
        next: (response: ApiResponseWithCount) => {
          // Traiter la réponse ici. Les résultats de la recherche sont assignés à la variable jobListings.
          this.jobListings = response.data as JobListings[];
          this.jobListingsCount = response.count; // Le nombre total de résultats correspondants est mis à jour.

          this.jobListingsInvalide = this.jobListings;
        },
        error: (error) => {
          // Traitement de l'erreur et affichage d'un message si nécessaire.
          this.errorMessage = this.handleError(error);
        },
      });
  }

  askJobListingDetail(jobListingId: number) {
    if (jobListingId) {
      this.visibilityStateManagerService.saveState('dashboardState');

      this.router.navigate(['/joblistings', 'detail', jobListingId]);
    }
  }

  UserProfile(userId: number) {
    if (userId) {
      this.visibilityStateManagerService.saveState('dashboardState');

      this.router.navigate(['/users', 'profile', userId]);
    }
  }

  // Méthode pour basculer la visibilité et charger les utilisateurs actifs
  toggleBtnAccountValidedVisibility(): void {
    this.visibilityStateManagerService.displayPlanning = false;
    this.visibilityStateManagerService.displayCalendar = false;
    this.visibilityStateManagerService.managerUsersBloc = false;
    this.visibilityStateManagerService.isMySavedJobListing = false;
    this.visibilityStateManagerService.displayAllAppointment = false;
    this.visibilityStateManagerService.displayAppointment = false;
    this.visibilityStateManagerService.isApplicationBloc = false;
    this.visibilityStateManagerService.isBtnAppoint = false;
    this.visibilityStateManagerService.displayDivBadageJobsValidate = false;
    this.visibilityStateManagerService.displayDivBadageJobsInvalidate = false;
    this.visibilityStateManagerService.displayDivBadageUsersInvalidate = false;
    this.visibilityStateManagerService.isbtSortAllJobListingInvalidate = false;
    this.visibilityStateManagerService.isbtnAccountInvalided = false;
    this.visibilityStateManagerService.isbtnAccountValided =
      !this.visibilityStateManagerService.isbtnAccountValided;

    if (this.visibilityStateManagerService.isbtnAccountValided) {
      this.visibilityStateManagerService.displayDivBadageUsersValidate = true;
      //    this.fetchActiveUsersList();
    }
  }

  // Méthode pour basculer la visibilité et charger les utilisateurs inactifs
  toggleBtnAccountInvalidedVisibility(): void {
    this.visibilityStateManagerService.displayPlanning = false;
    this.visibilityStateManagerService.displayCalendar = false;

    this.visibilityStateManagerService.managerUsersBloc = false;
    this.visibilityStateManagerService.isMySavedJobListing = false;
    this.visibilityStateManagerService.displayAllAppointment = false;
    this.visibilityStateManagerService.displayAppointment = false;
    this.visibilityStateManagerService.isApplicationBloc = false;
    this.visibilityStateManagerService.isBtnAppoint = false;
    this.visibilityStateManagerService.displayDivBadageJobsValidate = false;
    this.visibilityStateManagerService.displayDivBadageJobsInvalidate = false;
    this.visibilityStateManagerService.isVisibleManageUserListDiv = true;
    this.visibilityStateManagerService.isbtSortAllJobListingInvalidate = false;
    this.visibilityStateManagerService.isbtnAccountInvalided =
      !this.visibilityStateManagerService.isbtnAccountInvalided;
    if (this.visibilityStateManagerService.isbtnAccountInvalided) {
      this.visibilityStateManagerService.displayDivBadageUsersValidate = false;

      this.visibilityStateManagerService.displayDivBadageUsersInvalidate = true;
      // this.fetchInactiveUsersList();

      this.visibilityStateManagerService.isbtnAccountValided = false;
    }
  }

  // Méthode pour basculer la visibilité et charger les utilisateurs inactifs
  toggleBtnMySavedJobVisibility(): void {
    this.visibilityStateManagerService.displayPlanning = false;
    this.visibilityStateManagerService.displayCalendar = false;
    this.visibilityStateManagerService.managerJoblistingsBloc = false;
    this.visibilityStateManagerService.displayDivBadageJobsValidate = false;
    this.visibilityStateManagerService.displayAllAppointment = false;
    this.visibilityStateManagerService.displayAppointment = false;
    this.visibilityStateManagerService.isApplicationBloc = false;
    this.visibilityStateManagerService.isBtnAppoint = false;
    this.visibilityStateManagerService.displayDivBadageJobsInvalidate = false;
    this.visibilityStateManagerService.displayDivBadageUsersInvalidate = false;
    this.visibilityStateManagerService.displayDivBadageUsersValidate = false;

    this.visibilityStateManagerService.isMySavedJobListing = true;

    if (this.visibilityStateManagerService.isMySavedJobListing) {
      this.visibilityStateManagerService.isbtSortValidedJobListing = false;
      this.visibilityStateManagerService.isbtSortAllJobListingInvalidate =
        false;
      this.loadMySavedJobListings();
    }
  }

  // Méthode pour basculer la visibilité et charger les utilisateurs inactifs
  toggleBtnInvalidedJobListingVisibility(): void {
    this.visibilityStateManagerService.displayPlanning = false;
    this.visibilityStateManagerService.displayCalendar = false;
    this.visibilityStateManagerService.managerJoblistingsBloc = false;
    this.visibilityStateManagerService.managerUsersBloc = false;
    this.visibilityStateManagerService.isMySavedJobListing = false;
    this.visibilityStateManagerService.displayAllAppointment = false;
    this.visibilityStateManagerService.displayAppointment = false;
    this.visibilityStateManagerService.isApplicationBloc = false;
    this.visibilityStateManagerService.isBtnAppoint = false;
    this.visibilityStateManagerService.displayDivBadageJobsValidate = false;
    this.visibilityStateManagerService.displayDivBadageJobsInvalidate = false;
    this.visibilityStateManagerService.displayDivBadageUsersValidate = false;
    this.visibilityStateManagerService.displayDivBadageUsersInvalidate = false;

    this.visibilityStateManagerService.isVisibleManageJobListDiv = true;

    this.visibilityStateManagerService.displayDivBadageJobsInvalidate = true;
    if (this.visibilityStateManagerService.displayDivBadageJobsInvalidate) {
      this.visibilityStateManagerService.isbtSortValidedJobListing = false;
      this.visibilityStateManagerService.isbtnAccountValided = false;

      this.fetchInvalidedJobListing();
      this.visibilityStateManagerService.isbtSortAllJobListingInvalidate =
        !this.visibilityStateManagerService.isbtSortAllJobListingInvalidate;
    }
  }

  // Méthode pour basculer la visibilité et charger les offres validées inactifs
  toggleBtnValidedJobListingVisibility(): void {
    this.visibilityStateManagerService.displayPlanning = false;
    this.visibilityStateManagerService.displayCalendar = false;
    this.visibilityStateManagerService.managerJoblistingsBloc = false;
    this.visibilityStateManagerService.managerUsersBloc = false;
    this.visibilityStateManagerService.displayDivBadageUsersValidate = false;
    this.visibilityStateManagerService.isMySavedJobListing = false;
    this.visibilityStateManagerService.displayAllAppointment = false;
    this.visibilityStateManagerService.displayAppointment = false;
    this.visibilityStateManagerService.isApplicationBloc = false;
    this.visibilityStateManagerService.isBtnAppoint = false;
    this.visibilityStateManagerService.displayDivBadageJobsValidate = true;
    this.visibilityStateManagerService.isVisibleManageJobListDiv = true;

    if (this.visibilityStateManagerService.displayDivBadageJobsValidate) {
      this.visibilityStateManagerService.isVisibleManageUserListDiv = false;

      this.visibilityStateManagerService.displayDivBadageJobsInvalidate = false;
      this.visibilityStateManagerService.isbtnAccountValided = false;
      this.visibilityStateManagerService.isbtSortAllJobListingInvalidate =
        false;

      this.fetchValidedJobListing();
      this.visibilityStateManagerService.isbtSortValidedJobListing =
        !this.visibilityStateManagerService.isbtSortValidedJobListing;
    }
  }

  // Méthode pour basculer la visibilité et charger toutes les offres emplois.
  toggleBtnAllJobListingsVisibility(): void {
    this.visibilityStateManagerService.displayPlanning = false;
    this.visibilityStateManagerService.displayCalendar = false;
    this.visibilityStateManagerService.isMySavedJobListing = false;
    this.visibilityStateManagerService.displayDivBadageJobsValidate = false;
    this.visibilityStateManagerService.displayDivBadageJobsInvalidate = false;
    this.visibilityStateManagerService.managerUsersBloc = false;
    this.visibilityStateManagerService.isApplicationBloc = false;
    this.visibilityStateManagerService.isBtnAppoint = false;
    this.visibilityStateManagerService.displayAllAppointment = false;
    this.visibilityStateManagerService.displayAppointment = false;
    this.visibilityStateManagerService.isVisibleManageJobListDiv = true;
    this.visibilityStateManagerService.managerJoblistingsBloc = true;
    this.visibilityStateManagerService.isbtSortValidedJobListing = false;
    this.visibilityStateManagerService.isbtnAccountValided = false;
    this.visibilityStateManagerService.isbtSortAllJobListingInvalidate = false;
    this.visibilityStateManagerService.displayDivBadageUsersValidate = false;
    if (this.visibilityStateManagerService.managerJoblistingsBloc) {
      this.fetchJobListing();
      this.visibilityStateManagerService.isbtSortAllJobListing =
        !this.visibilityStateManagerService.isbtSortAllJobListing;
    }
  }

  // Méthode pour basculer la visibilité
  toggleUsersMenuVisibility(): void {
    this.visibilityStateManagerService.displayPlanning = false;
    this.visibilityStateManagerService.displayCalendar = false;
    this.visibilityStateManagerService.managerJoblistingsBloc = false;
    this.visibilityStateManagerService.isMySavedJobListing = false;
    this.visibilityStateManagerService.displayAllAppointment = false;
    this.visibilityStateManagerService.displayAppointment = false;
    this.visibilityStateManagerService.isApplicationBloc = false;
    this.visibilityStateManagerService.isBtnAppoint = false;
    this.visibilityStateManagerService.displayDivBadageJobsValidate = false;
    this.visibilityStateManagerService.displayDivBadageJobsInvalidate = false;
    this.visibilityStateManagerService.displayDivBadageUsersInvalidate = false;
    this.visibilityStateManagerService.displayDivBadageUsersValidate = false;
    this.visibilityStateManagerService.isVisibleManageJobListDiv = false;
    this.visibilityStateManagerService.isbtnAccountValided = false;
    this.visibilityStateManagerService.isbtSortAllJobListingInvalidate = false;

    this.visibilityStateManagerService.managerUsersBloc = true;
    this.visibilityStateManagerService.isVisibleManageUserListDiv =
      !this.visibilityStateManagerService.isVisibleManageUserListDiv;
    if (this.visibilityStateManagerService.isVisibleManageUserListDiv) {
      this.fetchUsersList();
    }
  }

  // Méthode pour basculer la visibilité
  toggleUsersInactiveBadgeVisibility(): void {
    this.visibilityStateManagerService.displayPlanning = false;
    this.visibilityStateManagerService.displayCalendar = false;
    this.visibilityStateManagerService.managerJoblistingsBloc = false;
    this.visibilityStateManagerService.isMySavedJobListing = false;
    this.visibilityStateManagerService.displayDivBadageJobsValidate = false;
    this.visibilityStateManagerService.displayDivBadageJobsInvalidate = false;
    this.visibilityStateManagerService.displayDivBadageUsersValidate = false;
    this.visibilityStateManagerService.displayAllAppointment = false;
    this.visibilityStateManagerService.isApplicationBloc = false;
    this.visibilityStateManagerService.isBtnAppoint = false;
    this.visibilityStateManagerService.displayAppointment = false;
    this.visibilityStateManagerService.managerUsersBloc = false;
    this.visibilityStateManagerService.isVisibleManageUserListDiv = false;

    this.visibilityStateManagerService.displayDivBadageUsersInvalidate = true;
    if (this.visibilityStateManagerService.displayDivBadageUsersInvalidate) {
      this.visibilityStateManagerService.isVisibleManageJobListDiv = false;
      this.visibilityStateManagerService.isbtnAccountValided = false;
      this.visibilityStateManagerService.isbtSortAllJobListingInvalidate =
        false;
      this.fetchInactiveUsersList();
    }
  }

  // Méthode pour basculer la visibilité
  toggleUsersValiadeBadgeVisibility(): void {
    this.visibilityStateManagerService.displayPlanning = false;
    this.visibilityStateManagerService.displayCalendar = false;
    this.visibilityStateManagerService.managerJoblistingsBloc = false;
    this.visibilityStateManagerService.isMySavedJobListing = false;
    this.visibilityStateManagerService.displayAllAppointment = false;
    this.visibilityStateManagerService.displayAppointment = false;
    this.visibilityStateManagerService.isApplicationBloc = false;
    this.visibilityStateManagerService.isBtnAppoint = false;
    this.visibilityStateManagerService.displayDivBadageJobsValidate = false;
    this.visibilityStateManagerService.displayDivBadageJobsInvalidate = false;
    this.visibilityStateManagerService.displayDivBadageUsersInvalidate = false;
    this.visibilityStateManagerService.managerUsersBloc = false;
    this.visibilityStateManagerService.isVisibleManageUserListDiv = false;

    this.visibilityStateManagerService.displayDivBadageUsersValidate = true;

    if (this.visibilityStateManagerService.displayDivBadageUsersValidate) {
      this.visibilityStateManagerService.isVisibleManageJobListDiv = false;
      this.visibilityStateManagerService.isbtnAccountValided = false;
      this.visibilityStateManagerService.isVisibleManageJobListDiv = false;
      this.visibilityStateManagerService.isbtnAccountValided = false;
      this.visibilityStateManagerService.isbtSortAllJobListingInvalidate =
        false;
      this.fetchActiveUsersList();
    }
  }

  // Méthode pour basculer la visibilité
  toggleJoblistMenuVisibility(): void {
    this.visibilityStateManagerService.displayPlanning = false;
    this.visibilityStateManagerService.displayCalendar = false;
    this.visibilityStateManagerService.managerUsersBloc = false;
    this.visibilityStateManagerService.isMySavedJobListing = false;
    this.visibilityStateManagerService.managerJoblistingsBloc = true;
    this.visibilityStateManagerService.displayAllAppointment = false;
    this.visibilityStateManagerService.displayAppointment = false;
    this.visibilityStateManagerService.isApplicationBloc = false;
    this.visibilityStateManagerService.isBtnAppoint = false;
    this.visibilityStateManagerService.displayDivBadageJobsValidate = false;
    this.visibilityStateManagerService.displayDivBadageJobsInvalidate = false;
    this.visibilityStateManagerService.displayDivBadageUsersValidate = false;
    this.visibilityStateManagerService.displayDivBadageUsersInvalidate = false;
    this.visibilityStateManagerService.isVisibleManageJobListDiv =
      !this.visibilityStateManagerService.isVisibleManageJobListDiv;
    if (this.visibilityStateManagerService.isVisibleManageJobListDiv) {
      this.fetchJobListing();
      this.visibilityStateManagerService.isVisibleManageUserListDiv = false;
    }
  }

  // Méthode pour basculer la visibilité pour le badge nouvelles offres
  toggleJobListingsValiadeBadgeVisibility(): void {
    this.visibilityStateManagerService.displayPlanning = false;
    this.visibilityStateManagerService.displayCalendar = false;
    this.visibilityStateManagerService.managerJoblistingsBloc = false;
    this.visibilityStateManagerService.isMySavedJobListing = false;
    this.visibilityStateManagerService.managerUsersBloc = false;
    this.visibilityStateManagerService.displayAllAppointment = false;
    this.visibilityStateManagerService.displayAppointment = false;
    this.visibilityStateManagerService.isApplicationBloc = false;
    this.visibilityStateManagerService.isBtnAppoint = false;
    this.visibilityStateManagerService.isVisibleManageUserListDiv = false;
    this.visibilityStateManagerService.displayDivBadageJobsInvalidate = false;
    this.visibilityStateManagerService.displayDivBadageUsersInvalidate = false;
    this.visibilityStateManagerService.displayDivBadageUsersValidate = false;
    this.visibilityStateManagerService.displayDivBadageJobsValidate = true;

    if (this.visibilityStateManagerService.displayDivBadageJobsValidate) {
      this.visibilityStateManagerService.isVisibleManageJobListDiv = false;
      this.visibilityStateManagerService.isbtnAccountValided = false;
      this.fetchValidedJobListing();
    }
  }

  // Méthode pour basculer la visibilité pour le badge nouvelles offres
  toggleJobListingsInvaliadeBadgeVisibility(): void {
    this.visibilityStateManagerService.displayPlanning = false;
    this.visibilityStateManagerService.displayCalendar = false;
    this.visibilityStateManagerService.managerJoblistingsBloc = false;
    this.visibilityStateManagerService.isMySavedJobListing = false;
    this.visibilityStateManagerService.managerUsersBloc = false;
    this.visibilityStateManagerService.displayAllAppointment = false;
    this.visibilityStateManagerService.displayAppointment = false;
    this.visibilityStateManagerService.isApplicationBloc = false;
    this.visibilityStateManagerService.isBtnAppoint = false;
    this.visibilityStateManagerService.displayDivBadageUsersInvalidate = false;
    this.visibilityStateManagerService.displayDivBadageUsersValidate = false;
    this.visibilityStateManagerService.isVisibleManageUserListDiv = false;

    this.visibilityStateManagerService.displayDivBadageJobsValidate = false;
    this.visibilityStateManagerService.displayDivBadageJobsInvalidate = true;

    if (this.visibilityStateManagerService.displayDivBadageJobsInvalidate) {
      this.visibilityStateManagerService.isVisibleManageJobListDiv = false;
      this.visibilityStateManagerService.isbtnAccountValided = false;

      this.fetchInvalidedJobListing();
    }
  }

  // Méthode pour basculer la visibilité
  toggleJobListingMenuVisibility(): void {
    this.visibilityStateManagerService.displayPlanning = false;
    this.visibilityStateManagerService.displayCalendar = false;
    this.visibilityStateManagerService.managerJoblistingsBloc = true;
    this.visibilityStateManagerService.isMySavedJobListing = false;
    this.visibilityStateManagerService.managerUsersBloc = false;
    this.visibilityStateManagerService.displayAllAppointment = false;
    this.visibilityStateManagerService.isApplicationBloc = false;
    this.visibilityStateManagerService.displayAppointment = false;
    this.visibilityStateManagerService.isBtnAppoint = false;
    this.visibilityStateManagerService.displayDivBadageJobsValidate = false;
    this.visibilityStateManagerService.displayDivBadageJobsInvalidate = false;
    this.visibilityStateManagerService.displayDivBadageUsersInvalidate = false;
    this.visibilityStateManagerService.displayDivBadageUsersValidate = false;

    this.visibilityStateManagerService.isVisibleManageUserListDiv =
      !this.visibilityStateManagerService.isVisibleManageUserListDiv;
    if (this.visibilityStateManagerService.isVisibleManageUserListDiv) {
      this.fetchUsersList();
      this.visibilityStateManagerService.isVisibleManageJobListDiv = false;
      this.visibilityStateManagerService.isbtnAccountValided = false;
    }
  }

  // Méthode pour basculer la visibilité
  toggleAppointmentMenuVisibility(): void {
    this.visibilityStateManagerService.displayPlanning = false;
    this.visibilityStateManagerService.displayDivBadageUsersValidate = false;
    this.visibilityStateManagerService.isVisibleManageJobListDiv = false;
    this.visibilityStateManagerService.isVisibleManageUserListDiv = false;
    this.visibilityStateManagerService.displayDivBadageJobsValidate = false;
    this.visibilityStateManagerService.displayDivBadageJobsInvalidate = false;
    this.visibilityStateManagerService.managerJoblistingsBloc = false;
    this.visibilityStateManagerService.managerUsersBloc = false;

    this.visibilityStateManagerService.isbtnAccountValided = false;
    this.visibilityStateManagerService.isbtSortAllJobListingInvalidate = false;
    this.visibilityStateManagerService.isMySavedJobListing = false;
    this.visibilityStateManagerService.isApplicationBloc = false;
    this.visibilityStateManagerService.displayAppointment = true;

    this.visibilityStateManagerService.isbtSortAppoint =
      !this.visibilityStateManagerService.isbtSortAppoint;

    if (this.visibilityStateManagerService.displayAppointment) {
      this.loadMyInterviewAppointmentsFilterByDate();
    }
  }

  toggleBtnAppointmentMenuVisibility(): void {
    this.visibilityStateManagerService.displayPlanning = false;
    this.visibilityStateManagerService.displayCalendar = false;
    this.visibilityStateManagerService.isVisibleManageJobListDiv = false;
    this.visibilityStateManagerService.isVisibleManageUserListDiv = false;
    this.visibilityStateManagerService.displayDivBadageJobsValidate = false;
    this.visibilityStateManagerService.displayDivBadageJobsInvalidate = false;
    this.visibilityStateManagerService.managerJoblistingsBloc = false;
    this.visibilityStateManagerService.managerUsersBloc = false;
    this.visibilityStateManagerService.displayDivBadageUsersValidate = false;
    this.visibilityStateManagerService.isbtnAccountValided = false;
    this.visibilityStateManagerService.isbtSortAllJobListingInvalidate = false;
    this.visibilityStateManagerService.isMySavedJobListing = false;
    this.visibilityStateManagerService.isApplicationBloc = false;
    this.visibilityStateManagerService.displayAllAppointment = false;
    this.visibilityStateManagerService.displayAppointment = true;

    this.visibilityStateManagerService.isBtnAppoint =
      !this.visibilityStateManagerService.isBtnAppoint;

    if (this.visibilityStateManagerService.displayAppointment) {
      this.loadMyInterviewAppointmentsFilterByDate();
    }
  }

  

  myPlanning() {
    this.visibilityStateManagerService.isVisibleManageJobListDiv = false;
    this.visibilityStateManagerService.isVisibleManageUserListDiv = false;
    this.visibilityStateManagerService.displayDivBadageJobsValidate = false;
    this.visibilityStateManagerService.displayDivBadageJobsInvalidate = false;
    this.visibilityStateManagerService.managerJoblistingsBloc = false;
    this.visibilityStateManagerService.managerUsersBloc = false;
    this.visibilityStateManagerService.displayDivBadageUsersValidate = false;
    this.visibilityStateManagerService.isbtnAccountValided = false;
    this.visibilityStateManagerService.isbtSortAllJobListingInvalidate = false;
    this.visibilityStateManagerService.isMySavedJobListing = false;
    this.visibilityStateManagerService.isApplicationBloc = false;
    this.visibilityStateManagerService.displayAllAppointment = false;
    this.visibilityStateManagerService.displayAppointment = false;

    this.visibilityStateManagerService.isbtSortAppoint = false;

    this.visibilityStateManagerService.displayPlanning = true;
  }

  // Méthode pour basculer la visibilité et charger les offres validées inactifs
  toggleJobApplyMenuVisibility(): void {
    this.visibilityStateManagerService.displayPlanning = false;
    this.visibilityStateManagerService.restoreState('dashboardState');

    this.visibilityStateManagerService.displayCalendar = false;
    this.visibilityStateManagerService.managerJoblistingsBloc = false;
    this.visibilityStateManagerService.managerUsersBloc = false;
    this.visibilityStateManagerService.isBtnAppoint = false;
    this.visibilityStateManagerService.displayAllAppointment = false;
    this.visibilityStateManagerService.displayAppointment = false;
    this.visibilityStateManagerService.displayDivBadageJobsValidate = false;
    this.visibilityStateManagerService.isVisibleManageJobListDiv = false;
    this.visibilityStateManagerService.isVisibleManageUserListDiv = false;
    this.visibilityStateManagerService.displayDivBadageJobsInvalidate = false;
    this.visibilityStateManagerService.isbtnAccountValided = false;
    this.visibilityStateManagerService.isbtSortAllJobListingInvalidate = false;
    this.visibilityStateManagerService.isMySavedJobListing = false;
    this.visibilityStateManagerService.isApplicationBloc = true;
    this.visibilityStateManagerService.displayDivBadageUsersValidate = false;
    this.visibilityStateManagerService.isbtSortJobApply =
      !this.visibilityStateManagerService.isbtSortJobApply;

    if (this.visibilityStateManagerService.isbtSortJobApply) {
      this.findAllJobApplicationsFollowUpByConsultant();
    }
  }

  // Méthode pour basculer la visibilité et charger les offres validées inactifs
  toggleHistoriqueMenuVisibility(): void {
    this.visibilityStateManagerService.displayPlanning = false;
    this.visibilityStateManagerService.displayCalendar = false;
    this.visibilityStateManagerService.managerJoblistingsBloc = false;
    this.visibilityStateManagerService.managerUsersBloc = false;
    this.visibilityStateManagerService.isBtnAppoint = false;
    this.visibilityStateManagerService.displayAllAppointment = false;
    this.visibilityStateManagerService.displayAppointment = false;
    this.visibilityStateManagerService.displayDivBadageJobsValidate = false;
    this.visibilityStateManagerService.isVisibleManageJobListDiv = false;
    this.visibilityStateManagerService.isVisibleManageUserListDiv = false;
    this.visibilityStateManagerService.displayDivBadageJobsInvalidate = false;
    this.visibilityStateManagerService.isbtnAccountValided = false;
    this.visibilityStateManagerService.isbtSortAllJobListingInvalidate = false;
    this.visibilityStateManagerService.isMySavedJobListing = false;
    this.visibilityStateManagerService.isApplicationBloc = true;
    this.visibilityStateManagerService.displayDivBadageUsersValidate = false;
    this.visibilityStateManagerService.isbtSortHistorique =
      !this.visibilityStateManagerService.isbtSortHistorique;

    if (this.visibilityStateManagerService.isbtSortHistorique) {
      //  this.findAllJobApplicationsFollowUpByConsultant();
    }
  }

  // Méthode pour basculer la visibilité et charger les offres validées inactifs
  toggleAppointmentDetailVisibility(): void {
    this.visibilityStateManagerService.displayPlanning = false;
    this.visibilityStateManagerService.displayCalendar = false;
    this.visibilityStateManagerService.managerJoblistingsBloc = false;
    this.visibilityStateManagerService.managerUsersBloc = false;
    this.visibilityStateManagerService.isBtnAppoint = false;
    this.visibilityStateManagerService.displayAllAppointment = false;
    this.visibilityStateManagerService.displayAppointment = false;
    this.visibilityStateManagerService.displayDivBadageJobsValidate = false;
    this.visibilityStateManagerService.isVisibleManageJobListDiv = false;
    this.visibilityStateManagerService.isVisibleManageUserListDiv = false;
    this.visibilityStateManagerService.displayDivBadageJobsInvalidate = false;
    this.visibilityStateManagerService.isbtnAccountValided = false;
    this.visibilityStateManagerService.isbtSortAllJobListingInvalidate = false;
    this.visibilityStateManagerService.isMySavedJobListing = false;
    this.visibilityStateManagerService.isApplicationBloc = false;
    this.visibilityStateManagerService.isbtSortHistorique = false;
    this.visibilityStateManagerService.displayDivBadageUsersValidate = false;
    this.visibilityStateManagerService.displayMyAppointment = true;
  }

  registerNewAppointnment(jobApplicationId: number) {
    this.visibilityStateManagerService.saveState('dashboardState');

    this.visibilityStateManagerService.isApplicationBloc = false;

    this.visibilityStateManagerService.displayCalendar = true;

    this.router.navigate(['dashboard/appoint'], {
      queryParams: { jobApplicationId: jobApplicationId },
    });
  }

  updateThisAppointment(appointmentId: number) {
    this.visibilityStateManagerService.saveState('dashboardState');
    this.visibilityStateManagerService.displayDivBadageUsersValidate = false;
    this.visibilityStateManagerService.isVisibleManageJobListDiv = false;
    this.visibilityStateManagerService.isVisibleManageUserListDiv = false;
    this.visibilityStateManagerService.displayDivBadageJobsValidate = false;
    this.visibilityStateManagerService.displayDivBadageJobsInvalidate = false;
    this.visibilityStateManagerService.managerJoblistingsBloc = false;
    this.visibilityStateManagerService.managerUsersBloc = false;

    this.visibilityStateManagerService.isbtnAccountValided = false;
    this.visibilityStateManagerService.isbtSortAllJobListingInvalidate = false;
    this.visibilityStateManagerService.isMySavedJobListing = false;
    this.visibilityStateManagerService.isApplicationBloc = false;
    this.visibilityStateManagerService.displayAllAppointment = false;
    this.visibilityStateManagerService.displayAppointment = true;
    this.visibilityStateManagerService.displayPlanning = true;

    this.router.navigate(['dashboard/appoint'], {
      queryParams: { appointmentId: appointmentId },
    });
  }


  navigateToHistorique(){
    this.router.navigate(['external-profile']);
  }

  registerNewCollaborator() {
    this.openDialogRegistration(
      RegisterCollaboratorComponent,
      0,
      'Register Collaborator'
    );
  }

  closeAppointmentForm(){
    this.isCreate = false;
    this.isUpdate = false;
  }

  private openDialogAppointment(
    component: any,
    code: number,
    title: string
  ): void {
    this.dialog.open(component, {
      width: '60%',
      height: 'auto',
      enterAnimationDuration: '1000ms',
      exitAnimationDuration: '1000ms',
      disableClose: true,
    });
  }

  private openDialogRegistration(
    component: any,
    code: number,
    title: string
  ): void {
    this.dialog.open(component, {
      width: 'auto',
      height: 'auto',
      enterAnimationDuration: '1000ms',
      exitAnimationDuration: '1000ms',
      disableClose: true,
    });
  }

  // Méthode de réinitialisation des Select
  resetOtherSelections(changedSelect: string): void {
    if (changedSelect !== 'selectMyAppointmentGroupedDate') {
      //  this.selectMyAppointmentGroupedDate = null;
    }
    if (changedSelect !== 'selectDate') {
      this.selectDate = null;
    }
    if (changedSelect !== 'selectInvalidateDate') {
      this.selectInvalidateDate = null;
    }
    if (changedSelect !== 'selectValidateDate') {
      this.selectValidateDate = null;
    }
    if (changedSelect !== 'selectedJobTitle') {
      this.selectedJobTitle = null;
    }
    if (changedSelect !== 'selectedValidateJobTitle') {
      this.selectedValidateJobTitle = null;
    }

    if (changedSelect !== 'selectedInvalidateJobTitle') {
      this.selectedInvalidateJobTitle = null;
    }

    if (changedSelect !== 'selectedJobLocation') {
      this.selectedJobLocation = null;
    }
    if (changedSelect !== 'selectedValidateJobLocation') {
      this.selectedValidateJobLocation = null;
    }
    if (changedSelect !== 'selectedInvalidateJobLocation') {
      this.selectedInvalidateJobLocation = null;
    }

    if (changedSelect !== 'selectedCompany') {
      this.selectedCompany = null;
    }

    if (changedSelect !== 'selectedValidateCompany') {
      this.selectedValidateCompany = null;
    }

    if (changedSelect !== 'selectedInvalidateCompany') {
      this.selectedInvalidateCompany = null;
    }

    if (changedSelect !== 'selectedContractType') {
      this.selectedContractType = null;
    }
    if (changedSelect !== 'selectedInvalidateContractType') {
      this.selectedInvalidateContractType = null;
    }
    if (changedSelect !== 'selectedValidateContractType') {
      this.selectedValidateContractType = null;
    }
  }

  /**
   * Vérifie si une candidature n'a pas de rendez-vous programmé et si le statut est null.
   */
  hasAppointment(application: JobApplications): boolean {
    const condition =
      (application.status === null && !application.appointment) ||
      !application.appointment;
    return condition;
  }

  ngOnDestroy(): void {
    // Signale la désinscription
    this.unsubscribe$.next();
    this.subscriptions.unsubscribe();
    this.unsubscribe$.complete();
  }

  ngAfterViewInit() {
    this.observer
      .observe(['(max-width: 800px)'])
      .pipe(delay(1), untilDestroyed(this))
      .subscribe((res) => {
        if (res.matches) {
          this.sidenav.mode = 'over';
          this.sidenav.close();
        } else {
          this.sidenav.mode = 'side';
          this.sidenav.open();
        }
      });

    this.router.events
      .pipe(
        untilDestroyed(this),
        filter((e) => e instanceof NavigationEnd)
      )
      .subscribe(() => {
        if (this.sidenav.mode === 'over') {
          this.sidenav.close();
        }
      });
  }














  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Register Candidate @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  handleCandidateRegistration(): void {
    if (this.isUpdate && this.registrationForm.valid && this.myAppointmentId) {
      // Si le formulaire est valide, procède à la modification.
      this.updateAppointment(this.myAppointmentId);
    } else if (this.isCreate && this.registrationForm.valid) {
      this.registerAppointment();
    } else {
      // Marque tous les contrôles comme 'touched' pour afficher les messages d'erreur
      Object.values(this.registrationForm.controls).forEach((control) => {
        control.markAsTouched();
      });
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Create a Joblisting @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // Méthode pour la connexion de l'utilisateur.
  registerAppointment(): void {
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

    const payload = this.registrationForm.value;

    if (this.registrationForm.valid) {
      // Remplacement de payload par submissionData pour l'appel API
      this.appointmentService.createAppointment(payload).subscribe({
        next: (response: ApiResponse) => {
          // Gestion de la réponse réussie
          this.showRegisterAppointmentSuccessDialog();
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

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Create a Joblisting @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // Méthode pour la connexion de l'utilisateur.
  updateAppointment(appointmentId: number): void {
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

    const payload = this.registrationForm.value;

    if (this.registrationForm.valid && appointmentId) {
      // Remplacement de payload par submissionData pour l'appel API
      this.appointmentService
        .updateAppointment(appointmentId, payload)
        .subscribe({
          next: (response: ApiResponse) => {
            // Gestion de la réponse réussie
            this.showRegisterAppointmentSuccessDialog();
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


 
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  les créneaux horaire @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  fetchTimeSlot() {
    this.othersTablesService.timeSlotList().subscribe({
      // Si la réponse est reçue sans erreur.
      next: (response: ApiResponseWithCount) => {
        // on assigne les jobTitles obtenus à la propriété 'jobTitles'
        this.timeslots = response.data as TimeSlot[];
        console.log('LES TIMESLOTS : ', this.timeslots);

        // On met à jour le formulaire après avoir récupéré les créneaux horaires
        if (this.isUpdate) {
          this.initializeFormWithAppointmentForUpdatedData();
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

  


  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Souscription aux paramètres de la route pour récupérer l'ID du User.
  private subscribeToJobApplicationOrAppointmentId(): void {
    this.route.queryParamMap
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((params) => {
        const jobApplicationId = +params.get('jobApplicationId')!;
        const appointmentId = +params.get('appointmentId')!;

        this.jobApplyId = jobApplicationId;
        this.myAppointmentId = appointmentId;

        console.log(
          'jobApplicationId:',
          jobApplicationId,
          'appointmentId:',
          appointmentId
        );

        if (jobApplicationId > 0) {
          console.log('Initializing for jobApplicationId:', jobApplicationId);
          this.isUpdate = false;
          this.isCreate = true;
          this.fetchTheJobApplication(); // Récupère les détails du user si l'ID est valide
        } else if (appointmentId > 0) {
          console.log('Initializing for appointmentId:', appointmentId);
          this.isCreate = false;
          this.isUpdate = true;
          this.initializeFormWithAppointmentData(appointmentId);
        } 
      });
  }

 
   


  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Mes Rendez-Vous d'entretien @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Mes Rendez-Vous d'entretien @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
private loadMyInterviewAppointments() {
  this.appointmentService.getMyallAppointmentConsultant().subscribe({
    next: (response: ApiResponseWithCount) => {
      // Vérifiez si la réponse contient des données
      if (response.data) {
        this.myAllAppointmentGrouped = response.data as Appointment[];
        this.events = this.myAllAppointmentGrouped.map((appointment) => ({
          start: new Date(
            appointment.appHoursStart || appointment.appointmentDate
          ),
          end: new Date(appointment.appHoursEnd || appointment.appointmentDate),
          title:
            appointment.jobApplication.user.name +
            ' ' +
            appointment.jobApplication.user.firstname +
            '     ' +
            appointment.timeSlots.title,
          color: this.getEventColor(appointment),
          actions: this.actions(
            appointment.appointmentId,
            appointment.jobApplication.jobListing.jobListingId,
            appointment.jobApplication.user.userId
          ),
          meta: { appointment }, // Ajoute l'objet appointment aux métadonnées
        }));
      } else {
        this.myAllAppointmentGrouped = [];
        this.events = [];
      }
      this.refresh.next();
    },
    error: (errorResponse: ApiResponse) => {
      this.errorMessage = this.handleError(errorResponse);
      this.showRegisterAppointmentErrorDialog(
        this.errorMessage ?? 'Une erreur inconnue est survenue.'
      );
    },
  });
}

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Methode pour afficher le profile de l'Utilisateur connecté @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  private fetchTheJobApplication() {
    if (this.jobApplyId) {
      this.jobApplicationService
        .getJobApplicationDetail(this.jobApplyId)
        .subscribe({
          next: (response: ApiResponse) => {
            if (response.data && !Array.isArray(response.data)) {
              this.theJobApplication = response.data as JobApplications;
              this.initializeFormWithJobApplicationID(); // Initialise le formulaire après avoir reçu les données
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
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Methode pour afficher le profile de l'Utilisateur connecté @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  private initializeFormWithAppointmentData(appointmentId: number): void {
    this.appointmentService.getAppointmentDetail(appointmentId).subscribe({
      next: (response: ApiResponse) => {
        if (response.data && !Array.isArray(response.data)) {
          this.myAppointment = response.data as Appointment;
          this.appointmentJobApplyId = this.myAppointment.jobApplicationId;

          this.myAppointmentId = this.myAppointment.appointmentId;

          const appointmentDate = new Date(this.myAppointment.appointmentDate);
          const formattedDate = this.formatDate(appointmentDate);

          this.visibilityStateManagerService.saveState('dashboardState');

          this.registrationForm.patchValue({
            jobApplicationId: this.myAppointment.jobApplicationId,
            timeSlotId: this.myAppointment.timeSlotId,
            appointmentDate: formattedDate,
          });

          this.isUpdate = true;
          // Défilement vers le formulaire
          this.scrollToForm();
          this.cdr.detectChanges();
        }
      },
      error: (errorResponse: ApiResponse) => {
        this.errorMessage = this.handleError(errorResponse);
        this.showRegisterAppointmentErrorDialog(
          this.errorMessage ?? 'Une erreur inconnue est survenue.'
        );
      },
    });
  }

  //// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Souscription à l'état d'authentification de l'utilisateur. // @@@@@@@@@@@@@@@@
  private subscribeToAuthState(): void {
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isAuthenticated) => {
        this.isAuthenticated = isAuthenticated; // Met à jour l'état d'authentification
        this.cdr.detectChanges(); // Détecte les changements (utile si les mises à jour ne sont pas détectées automatiquement)

        if (!isAuthenticated) {
          this.router.navigate(['/signin']); // Redirige vers la page de connexion
        }
      });
  }
  // Initialise le formulaire basé sur l'état actuel du composant
  private initializeFormWithJobApplicationData() {
    this.registrationForm = this.formBuilder.group({
      jobApplicationId: [null, Validators.required],
      appointmentDate: ['', Validators.required],
      timeslot: ['', Validators.required],
    });
  }
  private initializeFormWithJobApplicationID() {
    this.registrationForm.patchValue({
      jobApplicationId: this.jobApplyId,
    });
  }

  initializeFormWithAppointmentForUpdatedData(): void {
    // Vérifie si l'objet myAppointment contient des données
    if (this.myAppointment) {
      // Convertit la chaîne de caractères appointmentDate en objet Date
      const appointmentDate = new Date(this.myAppointment.appointmentDate);

      // Formatte la date au format 'yyyy-MM-dd' requis par le champ <input type="date">
      const formattedDate = this.formatDate(appointmentDate);

      // Met à jour les valeurs du formulaire avec les données de l'objet myAppointment
      this.registrationForm.patchValue({
        jobApplicationId: this.appointmentJobApplyId, // ID de la candidature
        timeSlotId: this.myAppointment.timeSlotId, // ID du créneau horaire
        appointmentDate: formattedDate, // Date du rendez-vous formatée
      });
    }
  }

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

 

  askAppointmentDetail(appointmentId: number) {
    this.router.navigate(['dashboard'], {
      queryParams: { appointmentId: appointmentId },
    });
  }
  

  actions(appointmentId: number, jobListingId: number, userId: number): CalendarEventAction[] {
    return [
      {
        label: '<i class="fas fa-fw fa-pencil-alt"></i>',
        a11yLabel: 'Edit',
        onClick: (): void => {
          this.isCreate = false;
          this.isUpdate = true;
          this.initializeFormWithAppointmentData(appointmentId);
        },
      }, 
      {
        label: '<i class="fas fa-fw fa-trash-alt "></i>',
        a11yLabel: 'Delete',
        onClick: (): void => {
          this.deleteThisAppointment(appointmentId);
        },
      },
      {
        label: '<i class="fas fa-fw fa-briefcase "></i>',
        a11yLabel: 'Work',
        onClick: (): void => {
          this.askJobListingDetail(jobListingId);
        },
      },
      {
        label: '<i class="fas fa-fw fa-eye "></i>',
        a11yLabel: 'View',
        onClick: (): void => {
          this.UserProfile(userId);
        },
      },
    ];
  }

  private scrollToForm(): void {
    if (this.formSection) {
   
      this.formSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  handleEvent(action: string, event: CalendarEvent): void {
    const appointment = event.meta?.appointment;
    if (appointment && appointment.appointmentId) {
      this.askAppointmentDetail(appointment.appointmentId);
    }
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  getEventColor(appointment: Appointment): {
    primary: string;
    secondary: string;
  } {
    // Logique pour déterminer la couleur de l'événement
    return {
      primary: '#f1a311',
      secondary: '#D1E8FF',
    };
  }

  //  Appointment
  get appointmentDate() {
    return this.registrationForm.get('appointmentDate');
  }
  get jobApplicationId() {
    return this.registrationForm.get('jobApplicationId');
  }
  get timeSlotId() {
    return this.registrationForm.get('timeSlotId');
  }



















}

/* generateNoteText(): any {
    return {
      candidate: 'Le candidat',
      interviewDate: new Date().toLocaleDateString(),
      position: 'Développeur Fullstack Angular',
      technicalSkills: `Compétences techniques :

      - Solide expertise en Angular pour le développement front-end.
      - Bonne maîtrise de Node.js et Express pour le développement back-end.
      - Expérience significative avec les bases de données SQL et NoSQL.
      - Capacité à écrire du code propre, maintenable et bien documenté.

      professionalExperience: `Expérience professionnelle :


      - Plusieurs années d'expérience en tant que développeur fullstack.
      - A travaillé sur plusieurs projets de grande envergure chez des entreprises réputées.
      - A démontré une capacité à collaborer efficacement en équipe et à livrer des projets dans les délais.
      
      personalQualities: `Qualités personnelles :


      - Excellentes compétences en communication.
      - Proactif, motivé et doté d'une forte éthique de travail.
      - Capable de s'adapter rapidement à de nouveaux environnements et technologies.


      recommendation: `Recommandation :


      En conclusion, le candidat est un développeur fullstack Angular compétent et expérimenté. Je recommande fortement son embauche pour ce poste.


      signature: `[Votre Nom]
      Consultant en recrutement informatique
      [Votre Société]
      [Votre Email]
      [Votre Téléphone]`,
    };
  }*/