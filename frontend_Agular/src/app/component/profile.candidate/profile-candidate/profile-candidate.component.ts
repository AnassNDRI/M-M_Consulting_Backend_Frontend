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
import { MatPaginator } from '@angular/material/paginator';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
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
import {
  Appointment,
  JobApplications,
  JobListings,
  SaveJobs,
  Users,
} from '../../../models';
import { ApiResponse } from '../../../shared/model';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { MenuheaderComponent } from '../../menuheader/menuheader.component';
import { ApiResponseWithCount } from '../../security/model/response/api.response.with.count';
import { AuthentificationService } from '../../security/securityIndex';
import {
  AppointmentService,
  JobapplicationService,
  JoblistingService,
  SavejobService,
  UserService,
} from '../../service';
import { HandleErrorBase } from '../../shared/HandleErrorBase';

@UntilDestroy()
@Component({
  selector: 'app-profile-candidate',
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
  templateUrl: './profile-candidate.component.html',
  styleUrl: './profile-candidate.component.css',
})
export class ProfileCandidateComponent
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
  istableVisible = false; // Pour rendre les tableau visible
  isAppointVisible = false; // Pour rendre les tableau visible

  user?: Users;
  savedJobs: SaveJobs[] = [];
  jobListings: JobListings[] = [];
  jobApplications: JobApplications[] = [];
  appointments: Appointment[] = [];

  savedJoibsCount: number | null | undefined;
  appointmentCount: number | null | undefined;
  jobApplicationsCount: number | null | undefined; // Nombre d'emploi

  jobListingsCount: number | null | undefined; // Nombre d'emploi
  recruiterName: string | null | undefined;
  recruiterID: number | null | undefined;
  recruiterFirstname: string | null | undefined;
  recruiterRole: string | null | undefined;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private observer: BreakpointObserver,
    private router: Router,
    private mediaObserver: MediaObserver,
    private jobListingService: JoblistingService,
    private jobApplicationService: JobapplicationService,
    private appointementService: AppointmentService,
    private savedJobsService: SavejobService,
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
    // Rafraîchir les données du ProfileCandidateComponent
    this.fetchMyProfile();
    this.findMyAppointement();

    console.log('voici mes rdv', this.findMyAppointement());
    this.loadMySavedJobListings();
    this.findMyJobApplications();
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  les job titles @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  loadMySavedJobListings() {
    console.log(`je rentre dans loadMySavedJobListings() `);
    this.savedJobsService.myAllJobsSavedCandidate().subscribe({
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
        this.showJobListingBackendErrorDialog(error); //
      },
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  les job applications @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  findMyJobApplications() {
    console.log(`je rentre dans findMyJobApplications() `);
    this.jobApplicationService.getMyAllJobApplications().subscribe({
      next: (response: ApiResponseWithCount) => {
        console.log(`resultat  `, response);
        if (response.result && Array.isArray(response.data)) {
          console.log(`mes postulation:`, this.jobApplicationsCount);
          // Cast response.data to the JobListings[] type.
          this.jobApplications = response.data as JobApplications[];
          this.jobApplicationsCount = response.count;

          console.log(`mes postulation:`, this.jobApplicationsCount);

          console.log(this.jobApplications);
        }
      },
      error: (error) => {
        console.error("Erreur lors de l'appel API", error);
        this.showJobListingBackendErrorDialog(error); //
      },
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Mes RDV @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  findMyAppointement() {
    this.appointementService.getMyallAppointmentCandidate().subscribe({
      next: (response: ApiResponseWithCount) => {
        console.log(` jobsaved`, response.result);
        if (response.result && Array.isArray(response.data)) {
          console.log(`Appointement`, response.result);
          // Cast response.data to the JobListings[] type.
          this.appointments = response.data as Appointment[];
          this.appointmentCount = response.count;

          console.log('voici mes rdv', this.appointments);

          console.log('voici mes rdv', this.appointmentCount);
        }
      },
      error: (error) => {
        console.error("Erreur lors de l'appel API", error);
        this.showJobListingBackendErrorDialog(error); //
      },
    });
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
          console.log('Mon Profile', this.user); // Afficher ici
        }
      },

      error: (error) => this.showJobListingBackendErrorDialog(error),
    });
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$    $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  /*
AddJoblisting() {
  this.OpenPopup(0, 'Create JobListing');
}

OpenPopup(code: number, title: string) {
  this.dialog.open(AddjoblistingComponent, {
    width: '50%',
    enterAnimationDuration: '1000ms',
    exitAnimationDuration: '1000ms',
    disableClose: true, // Ajoutez cette ligne
    data: {
      code: code,
      title: title,
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

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$  Les methodes Privées   $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

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

  askJobListingDetail(jobListingId: number) {
    //Récupère l'URL actuelle
    const currentUrl = this.router.url;
    // Navigue vers le détail de l'offre d'emploi avec l'URL actuelle comme paramètre de requête 'returnUrl'
    this.router.navigate(['/joblistings', 'detail', jobListingId], {
      queryParams: { returnUrl: currentUrl },
    });
  }

  profile() {
    if (this.recruiterID !== null && this.recruiterID !== undefined) {
      //Récupère l'URL actuelle
      const currentUrl = this.router.url;
      // Navigue vers le détail de le profile avec l'URL actuelle comme paramètre de requête 'returnUrl'
      this.router.navigate(['/users', 'profile', this.recruiterID], {
        queryParams: { returnUrl: currentUrl },
      });
    }
  }

  askUserDetail(userId: number) {
    //Récupère l'URL actuelle
    const currentUrl = this.router.url;
    // Navigue vers le détail de l'offre d'emploi avec l'URL actuelle comme paramètre de requête 'returnUrl'
    this.router.navigate(['/users', 'detail', userId], {
      queryParams: { returnUrl: currentUrl },
    });
  }
  /*
viewProfil(jobListingId: number) {
  this.router.navigate(['/users', 'detail', this.jobApplications.], {
    queryParams: { isProfileView: true },
  });
}
*/

  showAppointment() {
    this.islistVisible = false;
    this.istableVisible = false;
    this.isAppointVisible = true;
  }

  showSavedJobList() {
    this.istableVisible = false;
    this.isAppointVisible = false;
    this.islistVisible = true;
  }

  showApplyTableList() {
    this.islistVisible = false;
    this.isAppointVisible = false;
    this.istableVisible = true;
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
