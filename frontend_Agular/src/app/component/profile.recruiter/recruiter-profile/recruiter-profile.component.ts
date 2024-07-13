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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  Observable,
  Subject,
  Subscription,
  delay,
  filter,
  map,
  takeUntil,
} from 'rxjs';
import { MaterialModule } from '../../../../module/Material.module';
import { JobApplications, JobListings, Users } from '../../../models';
import { MenuheaderComponent } from '../../menuheader/menuheader.component';
import { ApiResponseWithCount } from '../../security/model/response/api.response.with.count';
import { AuthentificationService } from '../../security/service/authServiceIndex';
import {
  JobapplicationService,
  JoblistingService,
  UserService,
} from '../../service';
import { HandleErrorBase } from '../../shared/HandleErrorBase';

import { ApiResponse } from '../../../shared/model';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { AddjoblistingComponent } from '../joblisting/addjoblisting/addjoblisting.component';

@UntilDestroy()
@Component({
  selector: 'app-recruiter-profile',
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
  ],
  templateUrl: './recruiter-profile.component.html',
  styleUrls: ['./recruiter-profile.component.css'],
})
export class RecruiterProfileComponent
  extends HandleErrorBase
  implements OnInit, OnDestroy
{
  private subscriptions = new Subscription();

  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  isHandset$: Observable<boolean>;
  private unsubscribe$ = new Subject<void>();
  errorMessage: string | null = null; // Pour stocker le message d'erreur

  islistVisible = true; // Pour rendre la liste des offres vidible
  isValidate = true; //vérifie l'état "validate" du jobListing

  istableVisible = false; // Pour rendre les tableau visible

  jobListings: JobListings[] = [];
  jobListingsWithApplication: JobListings[] = [];
  jobApplications: JobApplications[] = [];
  user?: Users;
  jobListingsCount: number | null | undefined; // Nombre d'emploi

  jobListingsWithApplicationCount: number | null | undefined; 
  applicationsCount: number | null | undefined; 
  jobApplicationsCount: number | null | undefined; // Nombre d'emploi
  recruiterName: string | null | undefined;
  recruiterID: number | null | undefined;
  recruiterFirstname: string | null | undefined;
  recruiterRole: string | null | undefined;

  isRecruiter = false; // Indique si l'utilisateur est recruteur
  isAuthenticated = false; // État d'authentification initial de l'utilisateur
  currentUserId: number | null | undefined;
  theRecruiter: number | null | undefined;
  isOwner = false; // Indique s'il est proprietaire de l'offre affichée

  constructor(
    private observer: BreakpointObserver,
    private router: Router,
    private mediaObserver: MediaObserver,
    private jobListingService: JoblistingService,
    private jobApplicationService: JobapplicationService,
    private userService: UserService,
    public translateService: TranslateService,
    private dialog: MatDialog,
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
    this.subscribeToAuthState(); // S'abonne aux changements de l'état d'authentification

    this.loadJobListings();
    this.fetchMyProfile();
    this.findAllJobApplications();
    console.log('Mon Job Application', this.findAllJobApplications());
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  les job applications @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  findAllJobApplications() {
    // Ajout l'abonnement pour gérer les souscriptions et éviter les fuites de mémoire
    this.subscriptions.add(
      // Appel du service pour obtenir toutes les candidatures pour le recruteur
      this.jobApplicationService
        .findAllJobApplicationsForRecruiter()
        .subscribe({
          // En cas de réponse réussie
          next: (response: ApiResponseWithCount) => {
            // On vérifie si la réponse contient des données et que c'est un tableau
            if (response.result && Array.isArray(response.data)) {
              // On caste les données de la réponse en type JobListings[]
              this.jobListingsWithApplication = response.data as JobListings[];


                // On calcule le nombre de candidatures pour chaque offre d'emploi
            this.jobListingsWithApplication.forEach(jobListing => {
              jobListing.applicationCount = jobListing.jobApplications ? jobListing.jobApplications.length : 0;
            }); 
  
              // On calcule le nombre total de candidatures
              this.jobListingsWithApplicationCount = this.jobListingsWithApplication.reduce((total, jobListing) => {
                // on ajoute le nombre de candidatures pour chaque offre d'emploi au total
                return total + (jobListing.jobApplications ? jobListing.jobApplications.length : 0);
              }, 0); // Initialiser le total à 0
               
              // Afficher le total des candidatures dans la console (pour le débogage)
              console.log('Total applications:', this.jobListingsWithApplicationCount);
              // Afficher les candidatures dans la console (pour le débogage)
              console.log('Job applications:', this.jobListingsWithApplication);
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
          })
    );
  }



  



  
  
  //users/profile/:userId//

  fetchMyProfile() {
    this.userService.me().subscribe({
      next: (response: ApiResponse) => {
        if (response.data && !Array.isArray(response.data)) {
          this.user = response.data as Users;
          this.recruiterID = this.user?.userId;
          this.recruiterName = this.user.name;
          this.recruiterFirstname = this.user.firstname;
          this.recruiterRole = this.user.role.title;
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
    })
   
  }

  fetchMyJobListing() {
    this.jobListingService.myJobListing().subscribe({
      next: (response: ApiResponseWithCount) => {
        if (response.result && Array.isArray(response.data)) {
          // Cast response.data to the JobListings[] type.
          this.jobListings = response.data as JobListings[];
          this.jobListingsCount = response.count;
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
    })
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$    $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  AddJoblisting() {
    this.openPopup({
      code: 0,
      title: 'Create JobListing',
      type: 'createJoblisting',
    });
  }

  private openPopup(data: {
    code: number;
    title: string;
    jobListingData?: JobListings;
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
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$  Les methodes Privées   $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  //// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Souscription à l'état d'authentification de l'utilisateur. // @@@@@@@@@@@@@@@@
  private subscribeToAuthState(): void {
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isAuthenticated) => {
        this.isAuthenticated = isAuthenticated; // Met à jour l'état d'authentification
        this.isRecruiter = this.authService.isRecruiter; // Met à jour si l'utilisateur est un recruteur
        this.currentUserId = this.authService.getCurrentUserId();
        this.theRecruiter = this.authService.getRecruiterId(); // par defaut pour checker le recruiter proprietaire de l'emploi
        this.cdr.detectChanges(); // Détecte les changements (utile si les mises à jour ne sont pas détectées automatiquement)
      });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  les job titles @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  private loadJobListings() {
    this.subscriptions.add(
      this.jobListingService.myJobListing().subscribe({
        next: (response: ApiResponseWithCount) => {
          if (response.result && Array.isArray(response.data)) {
            // Cast response.data to the JobListings[] type.
            this.jobListings = response.data as JobListings[];
            this.jobListingsCount = response.count;
            this.jobListingsWithApplication = this.jobListings;


            console.log('joblisting avec CANDIDATURES: ',  this.jobListings );
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
      })
    );
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

  askJobListingDetail(jobListingId: number) {
    //Récupère l'URL actuelle
   // const currentUrl = this.router.url;
    // Navigue vers le détail de l'offre d'emploi avec l'URL actuelle comme paramètre de requête 'returnUrl'
    this.router.navigate(['/joblistings', 'detail', jobListingId]);
  }

  profile() {
    if (this.recruiterID !== null && this.recruiterID !== undefined) {
      //Récupère l'URL actuelle
     // const currentUrl = this.router.url;
      // Navigue vers le détail de le profile avec l'URL actuelle comme paramètre de requête 'returnUrl'
      this.router.navigate(['/users', 'profile', this.recruiterID]);
    }
  }

  askUserDetail(userId: number) {
    //Récupère l'URL actuelle
    //const currentUrl = this.router.url;
    // Navigue vers le détail de l'offre d'emploi avec l'URL actuelle comme paramètre de requête 'returnUrl'
    this.router.navigate(['/users', 'profile', userId]);
  }

  UserProfile(userId: number) {
    if (userId) {
      this.router.navigate(['/users', 'profile', userId]);
    }
  }

  onIconClick(application: JobApplications): void {
    if (application.jobInterviewOK) {
      this.UserProfile(application.user.userId);
    }
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
