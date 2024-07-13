import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe, CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { untilDestroyed } from '@ngneat/until-destroy';
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
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { MaterialModule } from '../../../../module/Material.module';
import {
  Company,
  ContractTypes,
  JobApplications,
  JobListings,
  JobLocation,
  JobTitle,
  Roles,
  SaveJobs,
  Users,
} from '../../../models';
import { ApiResponse } from '../../../shared/model';
import { RegisterCollaboratorComponent } from '../../administrator/register-collaborator/register-collaborator.component';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { MenuheaderComponent } from '../../menuheader/menuheader.component';
import { SaveJobResponse } from '../../security/model/response/savejob.response/saveJob.response';
import {
  ApiResponseWithCount,
  AuthentificationService,
} from '../../security/securityIndex';
import {
  DataService,
  JobapplicationService,
  JoblistingService,
  SavejobService,
  UserService,
} from '../../service';
import { HandleErrorBase } from '../../shared/HandleErrorBase';

@Component({
  selector: 'app-jobapplication-list',
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
  ],
  templateUrl: './jobapplication-list.component.html',
  styleUrl: './jobapplication-list.component.css',
})
export class JobapplicationListComponent
  extends HandleErrorBase
  implements OnInit, OnDestroy
{
  private subscriptions = new Subscription();

  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  isHandset$: Observable<boolean>;
  private unsubscribe$ = new Subject<void>();
  errorMessage: string | null = null; // Pour stocker le message d'erreur
  filtre = '';

  searchUsersControl = new FormControl('');
  searchUsersValidateControl = new FormControl('');
  searchUsersInvalidateControl = new FormControl('');

  searchJoblistingsControl = new FormControl('');
  searchJoblistingsValidateControl = new FormControl('');
  searchJoblistingsInvalidateControl = new FormControl('');

  isSearchJoblistingValidateControl = new FormControl('');

  isAdmin: boolean = true;

  jobListings: JobListings[] = [];
  jobListingsValide: JobListings[] = [];
  jobListingsInvalide: JobListings[] = [];
  jobTitles: JobTitle[] = [];
  users: Users[] = [];
  inactiveUsers: Users[] = [];
  activeUsers: Users[] = [];

  jobLocations: JobLocation[] = [];

  contractTypes: ContractTypes[] = [];
  roles: Roles[] = [];
  company: Company[] = [];

  @ViewChild(MatSidenav)
  islistVisible: boolean = true; // Pour rendre la liste des offres vidible
  isJobApplicationtableVisible: boolean = false; // Pour rendre les tableau visible

  // Propriété pour suivre les visibilité

  isVisibleManageJobListDiv: boolean = false;
  isVisibleManageUserListDiv: boolean = false;
  isVisibleManageAppointListDiv: boolean = false;
  isVisibleManageJobApllytDiv: boolean = false;

  isGeneralJoblistingBadgeTitle: boolean = true;

  isbtSortAllJobListing: boolean = false;
  isbtSortValidedJobListing: boolean = false;
  isbtSortAllJobListingInvalidate: boolean = false;
  isbtSortMySavedJob: boolean = false;

  isbtSortAppoint: boolean = false;
  isbtSortJobApply: boolean = false;

  isSaveJobListingIValidedTitle: boolean = false;
  isMySavedJobListing: boolean = false;

  managerUsersBloc: boolean = false;

  displayDivBadageUsersValidate: boolean = false;
  displayDivBadageUsersInvalidate: boolean = false;
  managerJoblistingsBloc: boolean = false;

  JoblistingsBadgeBloc: boolean = false;

  isSearchJoblistingInvalidateControl: boolean = true;

  displayDivBadageJobsValidate: boolean = false;
  displayDivBadageJobsInvalidate: boolean = false;

  forJobInvalidate: boolean = false;

  isbtnAccountValided: boolean = false;
  isbtnAccountInvalided: boolean = false;

  jobApplications: JobApplications[] = [];
  savedJobs: SaveJobs[] = [];

  user?: Users;

  testcountbloc = null; // Nombre d'emploi

  jobApplicationsCount: number | null | undefined; // Nombre d'emploi

  jobListingsCount: number | null | undefined; // Nombre d'emploi
  allJobListingsCount: number | null | undefined;
  jobTitlesCount: number | null | undefined; // Nombre de province
  inactiveUsersCount: number | null | undefined;

  tesCount: number = 1;
  activeUsersCount: number | null | undefined;
  savedJoibsCount: number | null | undefined;
  usersCount: number | null | undefined;

  invalidedJobListingCount: number | null | undefined;
  validedJobListingCount: number | null | undefined;
  myValidedJobListingCount: number | null | undefined;

  jobLocationsCount: number | null | undefined; // Nombre de localité
  contractTypesCount: number | null | undefined; // Nombre de poste
  rolesCount: number | null | undefined; // Nombre de contrat
  companyCount: number | null | undefined; //  Nombre d'entreprise

  collaboratorName: string | null | undefined;
  collaboratorID: number | null | undefined;
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

  constructor(
    private observer: BreakpointObserver,
    private router: Router,
    private mediaObserver: MediaObserver,
    private jobListingService: JoblistingService,
    translateService: TranslateService,
    private dialog: MatDialog,
    private dataService: DataService,
    private saveJobService: SavejobService,
    private jobApplicationService: JobapplicationService,
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

        this.cdr.detectChanges();
      }
    );
    this.subscriptions.add(authSubscription);

    // On tente de récupérer l'userId de l'utilisateur connecté, si disponible
    const userId = this.authService.getDecodedToken()?.userId;

    this.fetchJobListing(); // Charge toutes les offres...
    this.fetchUsersList(); // Charge toutes les utilisateur
    this.fetchInactiveUsersList();
    this.fetchValidedJobListing();
    this.fetchActiveUsersList();
    this.loadMySavedJobListings();
    this.fetchInvalidedJobListing();
    this.subscribeToData(); // Charge les JobTitles, Localités, Contracts
    this.initializeAsyncUsersSearch(); // l'écoute des changements sur le champ de recherche
    this.initializeAsyncUsersInvalideSearch();
    this.initializeAsyncUsersValidateSearch();

    this.initializeAsyncJobListingSearch();
    this.initializeAsyncJobListingValidateSearch();
    this.initializeAsyncJobListingInvalidateSearch();

    this.fetchMyProfile();
    this.findAllJobApplicationsFollowUpByConsultant();
    console.log('Mon Profile', this.fetchMyProfile());
  }

  //  Liste les candidatures suivies par le consultant avec infos sélectionnées.
  findAllJobApplicationsFollowUpByConsultant() {
    this.subscriptions.add(
      this.jobApplicationService
        .findAllJobApplicationsFollowUpByConsultant()
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            if (response.result && Array.isArray(response.data)) {
              // Cast response.data to the JobListings[] type.
              this.jobApplications = response.data as JobApplications[];
              this.jobApplicationsCount = response.count;

              console.log(
                'CONSULTANT JOBAPPLY FOLLOW UP',
                this.jobApplicationsCount
              );
              console.log(
                'CONSULTANT JOBAPPLY FOLLOW UP COUNT',
                this.jobApplications
              );
            }
          },
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
  /*
// Méthode pour supprimer la sauvegarde d'une offre d'emploi
deleteSaveJob(jobId: number, event: MouseEvent, job: JobListings): void {
  // Les commentaires originaux ont été préservés pour chaque étape
  event.stopPropagation();

  // Appel à l'API pour supprimer la sauvegarde
  this.saveJobService.saveJobDelete(jobId).subscribe({
    next: (response: ApiResponse) => {
      job.isSaved = false; // Met à jour l'indicateur de sauvegarde à non sauvegardé

      // Affichage de la confirmation de la suppression
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '360px',
        height: '180px',
        data: {
          message: 'Sauvegarde retirée de votre profil.',
          messageClass: '.error-message',
        },
        disableClose: true,
      });

      setTimeout(() => {
        dialogRef.close();
      }, 1000); // Fermeture automatique de la boîte de dialogue
    },
    error: (errorResponse: ApiResponse) => {
      console.error(`Erreur lors de la suppression:`, errorResponse);
      this.errorMessage = this.handleError(errorResponse);
    },
  });
} */

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
          console.log('inactive usres: ', this.inactiveUsersCount);
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
          console.log('active usres: ', this.activeUsersCount);
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

          console.log(this.jobListingsCount);

          console.log(this.jobListings);
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
    console.log(`je rentre dans loadMySavedJobListings() `);
    this.savedJobsService.myAllJobsSavedConsultant().subscribe({
      next: (response: ApiResponseWithCount) => {
        console.log(` jobsaved`, response.result);
        if (response.result && Array.isArray(response.data)) {
          console.log(` jobsaved`, response.result);

          // Cast response.data to the JobListings[] type.
          this.savedJobs = response.data as SaveJobs[];
          this.savedJoibsCount = response.count;

          console.log(this.savedJobs);

          console.log(this.savedJoibsCount);
        }
        console.log(` resultat je suis sorti`);
      },

      error: (error) => {
        console.error("Erreur lors de l'appel API", error);
        this.showErrorDialog(error); //
      },
    });
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
          console.log('Mon Profile', this.user); // Afficher ici
        }
      },
      error: (error) => this.showErrorDialog(error),
    });
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$    $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // Méthode pour afficher le dialogue d'erreur
  private showErrorDialog(error: any) {
    const errorMessage = this.handleError(error); // Utilise une méthode existante pour obtenir le message d'erreur
    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
      data: {
        title: 'Un problème est survenu',
        message: errorMessage, // Affiche le message d'erreur récupéré
        buttons: [{ text: 'Fermer', value: 'close', class: 'cancel-button' }],
        messageClass: 'message-error',
      },
    });
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
      console.log('je le recupere ici:', this.selectDate);
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
      console.log('je le recupere ici:', this.selectValidateDate);
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
      console.log('je le recupere ici:', this.selectInvalidateDate);
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
      console.log('je le recupere ici:', this.selectMyJobSavedDate);
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

            this.usersCount = response.count;

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
          this.users = response.data as Users[];
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
    //Récupère l'URL actuelle
    const currentUrl = this.router.url;
    // Navigue vers le détail de l'offre d'emploi avec l'URL actuelle comme paramètre de requête 'returnUrl'
    this.router.navigate(['/joblistings', 'detail', jobListingId], {
      queryParams: { returnUrl: currentUrl },
    });
  }

  profile() {
    if (this.collaboratorID !== null && this.collaboratorID !== undefined) {
      //Récupère l'URL actuelle
      const currentUrl = this.router.url;
      // Navigue vers le détail de le profile avec l'URL actuelle comme paramètre de requête 'returnUrl'
      this.router.navigate(['/users', 'profile', this.collaboratorID], {
        queryParams: { returnUrl: currentUrl },
      });
    }
  }

  UserProfile(userId: number) {
    if (userId) {
      //Récupère l'URL actuelle
      const currentUrl = this.router.url;
      // Navigue vers le détail de le profile avec l'URL actuelle comme paramètre de requête 'returnUrl'
      this.router.navigate(['/users', 'profile', userId], {
        queryParams: { returnUrl: currentUrl },
      });
    }
  }

  askUserDetail(userId: number) {
    //Récupère l'URL actuelle
    const currentUrl = this.router.url;
    // Navigue vers le détail de l'offre d'emploi avec l'URL actuelle comme paramètre de requête 'returnUrl'
    this.router.navigate(['/users', 'profile', userId], {
      queryParams: { returnUrl: currentUrl },
    });
  }

  /* // Méthode pour basculer la visibilité
toggleBtnAccountValidedVisibility(): void {                 
  this.isbtnAccountValided = !this.isbtnAccountValided;
 // this.fetchActiveUsersList();
  this.isbtnAccountInvalided = false;

} */

  // Méthode pour basculer la visibilité et charger les utilisateurs actifs
  toggleBtnAccountValidedVisibility(): void {
    this.managerUsersBloc = false;
    this.isMySavedJobListing = false;
    this.displayDivBadageJobsValidate = false;
    this.displayDivBadageJobsInvalidate = false;
    this.displayDivBadageUsersInvalidate = false;
    this.isbtSortAllJobListingInvalidate = false;
    this.isbtnAccountValided = !this.isbtnAccountValided;
    if (this.isbtnAccountValided) {
      this.displayDivBadageUsersValidate = true;
      this.fetchActiveUsersList();
      this.isbtnAccountInvalided = false;
    }
  }

  // Méthode pour basculer la visibilité et charger les utilisateurs inactifs
  toggleBtnAccountInvalidedVisibility(): void {
    this.managerUsersBloc = false;
    this.isMySavedJobListing = false;
    this.displayDivBadageJobsValidate = false;
    this.displayDivBadageJobsInvalidate = false;
    this.isVisibleManageUserListDiv = true;
    this.isbtSortAllJobListingInvalidate = false;
    this.isbtnAccountInvalided = !this.isbtnAccountInvalided;
    if (this.isbtnAccountInvalided) {
      this.displayDivBadageUsersValidate = false;

      this.displayDivBadageUsersInvalidate = true;
      this.fetchInactiveUsersList();

      this.isbtnAccountValided = false;
    }
  }

  // Méthode pour basculer la visibilité et charger les utilisateurs inactifs
  toggleBtnMySavedJobVisibility(): void {
    this.managerJoblistingsBloc = false;
    this.displayDivBadageJobsValidate = false;
    this.displayDivBadageJobsInvalidate = false;
    this.displayDivBadageUsersInvalidate = false;
    this.displayDivBadageUsersValidate = false;

    this.isMySavedJobListing = true;

    if (this.isMySavedJobListing) {
      this.isbtSortValidedJobListing = false;
      this.isbtSortAllJobListingInvalidate = false;
      this.loadMySavedJobListings();
      this.isbtSortMySavedJob = !this.isbtSortMySavedJob;
      this.isbtSortAllJobListing = false;

      /* this.isVisibleManageJobListDiv = false;
      this.isbtnAccountValided = false;
      this.isUsersGeneralTitle = false; */
    }
  }

  // Méthode pour basculer la visibilité et charger les utilisateurs inactifs
  toggleBtnInvalidedJobListingVisibility(): void {
    this.managerJoblistingsBloc = false;
    this.managerUsersBloc = false;
    this.isMySavedJobListing = false;
    this.displayDivBadageJobsValidate = false;
    this.displayDivBadageJobsInvalidate = false;
    this.displayDivBadageUsersValidate = false;
    this.displayDivBadageUsersInvalidate = false;
    this.isbtSortMySavedJob = false;
    this.isVisibleManageJobListDiv = true;

    this.displayDivBadageJobsInvalidate = true;
    if (this.displayDivBadageJobsInvalidate) {
      this.isbtSortAllJobListing = false;
      this.isbtSortValidedJobListing = false;
      this.isbtnAccountValided = false;

      this.fetchInvalidedJobListing();
      this.isbtSortAllJobListingInvalidate =
        !this.isbtSortAllJobListingInvalidate;
    }
  }

  // Méthode pour basculer la visibilité et charger les offres validées inactifs
  toggleBtnValidedJobListingVisibility(): void {
    this.managerJoblistingsBloc = false;
    this.managerUsersBloc = false;
    this.isMySavedJobListing = false;
    this.isbtSortAllJobListing = false;
    this.displayDivBadageJobsValidate = true;
    this.isVisibleManageJobListDiv = true;

    if (this.displayDivBadageJobsValidate) {
      this.isVisibleManageUserListDiv = false;

      this.displayDivBadageJobsInvalidate = false;

      this.isVisibleManageAppointListDiv = false;
      this.isVisibleManageJobApllytDiv = false;
      this.isbtnAccountValided = false;

      this.isbtSortMySavedJob = false;
      this.isbtSortAllJobListingInvalidate = false;

      this.fetchValidedJobListing();
      this.isbtSortValidedJobListing = !this.isbtSortValidedJobListing;
    }
  }

  // Méthode pour basculer la visibilité et charger toutes les offres emplois.
  toggleBtnAllJobListingsVisibility(): void {
    this.isMySavedJobListing = false;
    this.displayDivBadageJobsValidate = false;
    this.displayDivBadageJobsInvalidate = false;
    this.isbtSortMySavedJob = false;
    this.managerUsersBloc = false;

    this.isVisibleManageJobListDiv = true;
    this.managerJoblistingsBloc = true;
    this.isbtSortValidedJobListing = false;
    this.isbtnAccountValided = false;
    this.isbtSortAllJobListingInvalidate = false;

    if (this.managerJoblistingsBloc) {
      this.fetchJobListing();
      this.isbtSortAllJobListing = !this.isbtSortAllJobListing;
    }
  }

  // Méthode pour basculer la visibilité
  /*  toggleBtnAccountInvalidedVisibility(): void {
  this.fetchInactiveUsersList();
  this.isbtnAccountInvalided = !this.isbtnAccountInvalided;
  this.isbtnAccountValided = false;
}*/

  // Méthode pour basculer la visibilité
  toggleUsersMenuVisibility(): void {
    this.managerJoblistingsBloc = false;
    this.isMySavedJobListing = false;
    this.displayDivBadageJobsValidate = false;
    this.displayDivBadageJobsInvalidate = false;
    this.displayDivBadageUsersInvalidate = false;
    this.displayDivBadageUsersValidate = false;
    this.managerUsersBloc = true;
    this.isVisibleManageUserListDiv = !this.isVisibleManageUserListDiv;
    if (this.isVisibleManageUserListDiv) {
      this.fetchUsersList();
      this.isVisibleManageJobListDiv = false;
      this.isVisibleManageAppointListDiv = false;
      this.isVisibleManageJobApllytDiv = false;
      this.isbtnAccountValided = false;
      this.isbtSortAllJobListingInvalidate = false;
    }
  }

  // Méthode pour basculer la visibilité
  toggleUsersInactiveBadgeVisibility(): void {
    this.managerJoblistingsBloc = false;
    this.isMySavedJobListing = false;
    this.displayDivBadageJobsValidate = false;
    this.displayDivBadageJobsInvalidate = false;
    this.displayDivBadageUsersValidate = false;
    this.managerUsersBloc = false;
    this.isVisibleManageUserListDiv = false;

    this.displayDivBadageUsersInvalidate = true;
    if (this.displayDivBadageUsersInvalidate) {
      this.isVisibleManageJobListDiv = false;
      this.isVisibleManageAppointListDiv = false;
      this.isVisibleManageJobApllytDiv = false;
      this.isbtnAccountValided = false;
      this.isbtSortAllJobListingInvalidate = false;
      this.fetchInactiveUsersList();
    }
  }

  // Méthode pour basculer la visibilité
  toggleUsersValiadeBadgeVisibility(): void {
    this.managerJoblistingsBloc = false;
    this.isMySavedJobListing = false;
    this.displayDivBadageJobsValidate = false;
    this.displayDivBadageJobsInvalidate = false;
    this.displayDivBadageUsersInvalidate = false;
    this.managerUsersBloc = false;
    this.isVisibleManageUserListDiv = false;

    this.displayDivBadageUsersValidate = true;

    if (this.displayDivBadageUsersValidate) {
      this.isVisibleManageJobListDiv = false;
      this.isVisibleManageAppointListDiv = false;
      this.isVisibleManageJobApllytDiv = false;
      this.isbtnAccountValided = false;
      this.isVisibleManageJobListDiv = false;
      this.isVisibleManageAppointListDiv = false;
      this.isVisibleManageJobApllytDiv = false;
      this.isbtnAccountValided = false;
      this.isbtSortAllJobListingInvalidate = false;
      this.fetchActiveUsersList();
    }
  }

  // Méthode pour basculer la visibilité
  toggleJoblistMenuVisibility(): void {
    this.managerUsersBloc = false;
    this.isMySavedJobListing = false;
    this.managerJoblistingsBloc = true;
    this.displayDivBadageJobsValidate = false;
    this.displayDivBadageJobsInvalidate = false;
    this.displayDivBadageUsersValidate = false;
    this.displayDivBadageUsersInvalidate = false;
    this.isVisibleManageJobListDiv = !this.isVisibleManageJobListDiv;
    if (this.isVisibleManageJobListDiv) {
      this.fetchJobListing();
      this.isVisibleManageUserListDiv = false;
      this.isVisibleManageAppointListDiv = false;
      this.isVisibleManageJobApllytDiv = false;
    }
  }

  // Méthode pour basculer la visibilité pour le badge nouvelles offres
  toggleJobListingsValiadeBadgeVisibility(): void {
    this.managerJoblistingsBloc = false;
    this.isMySavedJobListing = false;
    this.managerUsersBloc = false;
    this.isVisibleManageUserListDiv = false;
    this.displayDivBadageJobsInvalidate = false;
    this.displayDivBadageUsersInvalidate = false;
    this.displayDivBadageUsersValidate = false;
    this.displayDivBadageJobsValidate = true;

    if (this.displayDivBadageJobsValidate) {
      this.isVisibleManageJobListDiv = false;
      this.isVisibleManageAppointListDiv = false;
      this.isVisibleManageJobApllytDiv = false;
      this.isbtnAccountValided = false;
      this.fetchValidedJobListing();
    }
  }

  // Méthode pour basculer la visibilité pour le badge nouvelles offres
  toggleJobListingsInvaliadeBadgeVisibility(): void {
    this.managerJoblistingsBloc = false;
    this.isMySavedJobListing = false;
    this.managerUsersBloc = false;
    this.displayDivBadageUsersInvalidate = false;
    this.displayDivBadageUsersValidate = false;
    this.isVisibleManageUserListDiv = false;

    this.displayDivBadageJobsValidate = false;
    this.displayDivBadageJobsInvalidate = true;

    if (this.displayDivBadageJobsInvalidate) {
      this.isVisibleManageJobListDiv = false;
      this.isVisibleManageAppointListDiv = false;
      this.isVisibleManageJobApllytDiv = false;
      this.isbtnAccountValided = false;

      this.fetchInvalidedJobListing();
    }
  }

  // Méthode pour basculer la visibilité
  toggleJobListingMenuVisibility(): void {
    this.managerJoblistingsBloc = true;
    this.isMySavedJobListing = false;
    this.managerUsersBloc = false;
    this.displayDivBadageJobsValidate = false;
    this.displayDivBadageJobsInvalidate = false;
    this.displayDivBadageUsersInvalidate = false;
    this.displayDivBadageUsersValidate = false;

    this.isVisibleManageUserListDiv = !this.isVisibleManageUserListDiv;
    if (this.isVisibleManageUserListDiv) {
      this.fetchUsersList();
      this.isVisibleManageJobListDiv = false;
      this.isVisibleManageAppointListDiv = false;
      this.isVisibleManageJobApllytDiv = false;
      this.isbtnAccountValided = false;
    }
  }
  /*
isBtnJobApplicationtableVisible(): void {
  this.isJobApplicationtableVisible = true;
  this.findAllJobApplicationsFollowUpByConsultant();
} */

  // Méthode pour basculer la visibilité
  toggleAppointmentMenuVisibility(): void {
    this.isVisibleManageAppointListDiv = !this.isVisibleManageAppointListDiv;
    this.isVisibleManageJobListDiv = false;
    this.isVisibleManageUserListDiv = false;
    this.isVisibleManageJobApllytDiv = false;
    this.displayDivBadageJobsValidate = false;
    this.displayDivBadageJobsInvalidate = false;
  }

  // Méthode pour basculer la visibilité
  toggleJobApplyMenuVisibility(): void {
    this.isVisibleManageJobApllytDiv = !this.isVisibleManageJobApllytDiv;
    this.isVisibleManageJobListDiv = false;
    this.isVisibleManageUserListDiv = false;
    this.isVisibleManageAppointListDiv = false;
    this.displayDivBadageJobsValidate = false;
    this.displayDivBadageJobsInvalidate = false;
  }

  registerNewCollaborator() {
    this.openDialogRegistration(
      RegisterCollaboratorComponent,
      0,
      'Register Collaborator'
    );
  }

  // Méthode de réinitialisation des Select
  resetOtherSelections(changedSelect: string): void {
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
}
