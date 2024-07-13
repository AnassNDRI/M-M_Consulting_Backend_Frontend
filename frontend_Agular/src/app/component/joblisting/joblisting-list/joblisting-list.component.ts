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
import { MatSidenav } from '@angular/material/sidenav';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, Subject, Subscription, delay, filter, map } from 'rxjs';
import { MaterialModule } from '../../../../module/Material.module';

import { MatDialog } from '@angular/material/dialog';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import {
  Company,
  ContractTypes,
  JobListings,
  JobLocation,
  JobTitle,
  Roles,
} from '../../../models';
import { ApiResponse } from '../../../shared/model';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { MenuheaderComponent } from '../../menuheader/menuheader.component';
import { ApiResponseWithCount } from '../../security/model/response/api.response.with.count';
import { SaveJobResponse } from '../../security/model/response/savejob.response/saveJob.response';
import { AuthentificationService } from '../../security/service/authServiceIndex';
import { DataService, SavejobService } from '../../service';
import { JoblistingService } from '../../service/joblisting.service';
import { HandleErrorBase } from '../../shared/HandleErrorBase';

@UntilDestroy()
@Component({
  selector: 'app-joblisting-list',
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
  templateUrl: './joblisting-list.component.html',
  styleUrl: './joblisting-list.component.css',
})
export class JoblistingListComponent
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
  searchControl = new FormControl('');

  jobListings: JobListings[] = [];
  jobTitles: JobTitle[] = [];
  jobLocations: JobLocation[] = [];
  contractTypes: ContractTypes[] = [];
  roles: Roles[] = [];
  company: Company[] = [];

  jobListingsCount: number | null | undefined; // Nombre d'emploi
  jobTitlesCount: number | null | undefined; // Nombre de province
  jobLocationsCount: number | null | undefined; // Nombre de localité
  contractTypesCount: number | null | undefined; // Nombre de poste
  rolesCount: number | null | undefined; // Nombre de contrat
  companyCount: number | null | undefined; //  Nombre d'entreprise

  // Variable pour stocker l'option sélectionnée
  selectDate: string | undefined;
  selectedContractType: number | null | undefined; // Nombre de poste
  selectedJobTitle: number | null | undefined;
  selectedJobLocation: number | null | undefined; // Nombre de poste
  selectedCompany: number | null | undefined; // Nombre de localité

  isRecruiter = false; // Indique si l'utilisateur est recruteur
  isAdmin = false; // Indique si l'utilisateur est recruteur
  isConsultant = false; // Indique si l'utilisateur est recruteur
  isAuthenticated = false; // État d'authentification initial de l'utilisateur

  constructor(
    private observer: BreakpointObserver,
    private router: Router,
    private mediaObserver: MediaObserver,
    private jobListingService: JoblistingService,
    translateService: TranslateService,
    private dialog: MatDialog,
    private dataService: DataService,
    private saveJobService: SavejobService,
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
        // Met à jour `isAuth` chaque fois que l'état d'authentification change
        this.isAuthenticated = isAuthenticated;
        this.cdr.detectChanges();
      }
    );
    this.subscriptions.add(authSubscription);
    // Qui retourne le rôle du recruiteur connecté
    this.isRecruiter = this.authService.isRecruiter;
    this.isAdmin = this.authService.isAdmin;
    this.isConsultant= this.authService.isConsultant;


    // On tente de récupérer l'userId de l'utilisateur connecté, si disponible
    const userId = this.authService.getDecodedToken()?.userId;

    this.fetchJobListing(userId); // Charge toutes les offres...
    this.subscribeToData(); // Charge les JobTitles, Localités, Contracts
    this.initializeAsyncSearch(); // l'écoute des changements sur le champ de recherche
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
          this.deleteSaveJob(job.jobListingId, event, job); // Appelle deleteSaveJob si l'offre est déjà sauvegardée
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
            width: 'auto',
            height: 'auto',
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
          width: 'auto',
          height: 'auto',
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
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  les job titles @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  fetchJobListing(userId?: number) {
    this.jobListingService.jobListingList().subscribe({
      next: (response: ApiResponseWithCount) => {
        if (response.result && Array.isArray(response.data)) {
          // Cast response.data to the JobListings[] type.
          this.jobListings = response.data as JobListings[];
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

  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour filtrer les annonces par type de contrat @@@@@@@@@
  filterByContractType() {
    // Vérifie si un type de contrat a été sélectionné
    if (
      this.selectedContractType !== null &&
      this.selectedContractType !== undefined
    ) {
      // Appel au service JoblistingService pour rechercher les annonces par type de contrat
      this.jobListingService
        .searchJobByContractTypeAccessCandidate(this.selectedContractType)
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
  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour filtrer les annonces par date de publication @@@@@@@@@
  filterByDate() {
    //console.log('quoi ?:', this.selectDate);

    if (this.selectDate) {
      console.log('je le recupere ici:', this.selectDate);
      this.jobListingService
        .getJobsGroupedByTimeForCandidate(this.selectDate)
        .subscribe({
          next: (response: ApiResponseWithCount) => {
            this.jobListings = response.data as JobListings[];
            this.jobListingsCount = response.count;

            /*    console.log('/////////////////////////////////////////////');
          console.log('date:', this.jobListings);
          console.log('date nbre:', this.jobListingsCount); */
          },
          error: (error) => {
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
        .searchJobByFunctionForCandidate(this.selectedJobTitle)
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
  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour filtrer les annonces par localisation @@@@@@@@@
  filterByJobLocation() {
    // Vérifie si une localisation a été sélectionnée
    if (
      this.selectedJobLocation !== null &&
      this.selectedJobLocation !== undefined
    ) {
      // Appel au service pour rechercher les annonces par localisation
      this.jobListingService
        .searchJobByLocationAccessCandidate(this.selectedJobLocation)
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

  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour filtrer les annonces par nom de compagnie @@@@@@@@@
  filterByCompany() {
    // Vérifie si une compagnie a été sélectionnée
    if (this.selectedCompany !== null && this.selectedCompany !== undefined) {
      // Recherche des annonces par nom de compagnie
      this.jobListingService
        .searchJobByCompanyNameAccessCandidate(this.selectedCompany)
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

  // @@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour initialiser la recherche asynchrone par nom de compagnie @@@@@@@@@
  initializeAsyncSearch() {
    this.searchControl.valueChanges
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
          this.jobListingService.searchJobListingValidateForCandidateByWord(
            term
          )
        ), // Effectue la recherche avec le terme nettoyé.
        takeUntil(this.unsubscribe$) // Assure la désinscription proprement lors de la destruction du composant.
      )
      .subscribe({
        next: (response: ApiResponseWithCount) => {
          // Traiter la réponse ici. Les résultats de la recherche sont assignés à la variable jobListings.
          this.jobListings = response.data as JobListings[];
          this.jobListingsCount = response.count; // Le nombre total de résultats correspondants est mis à jour.
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
