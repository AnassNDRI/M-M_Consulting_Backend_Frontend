import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators, FormBuilder, AbstractControlOptions } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { RouterLink, RouterOutlet, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, Observable, Subject, map, takeUntil, debounceTime, distinctUntilChanged, tap, filter, switchMap, delay } from 'rxjs';
import { MaterialModule } from '../../../../module/Material.module';
import { Users, Historiques } from '../../../models';
import { ApiResponse } from '../../../shared/model';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { MenuheaderComponent } from '../../menuheader/menuheader.component';
import { AuthentificationService, ApiResponseWithCount } from '../../security/securityIndex';
import { JoblistingService, UserService } from '../../service';
import { VisibilityStateManagerService } from '../../service/visibilityStateManager.service';
import { HandleErrorBase } from '../../shared/HandleErrorBase';
import { HistoriqueService } from '../../service/historique.service';
import { dateRangeValidator } from '../../shared/form.validator';
import * as XLSX from 'xlsx';
import { CustomDateFormatter } from '../../../shared/calendar/custom-date-formatter';

@Component({
  selector: 'app-accounting-departement',
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
  ],
  templateUrl: './accounting-departement.component.html',
  styleUrls: ['./accounting-departement.component.css']
})
@UntilDestroy()
export class AccountingDepartementComponent extends HandleErrorBase implements OnInit, OnDestroy, AfterViewInit {

  private subscriptions = new Subscription();
  private queryParamSubscription!: Subscription;

  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  isHandset$: Observable<boolean>;
  private unsubscribe$ = new Subject<void>();
  errorMessage: string | null = null;
  registrationForm!: FormGroup;
  filtre = '';

  searchHistoriqueControl = new FormControl('');

  isAdmin: boolean = true;
  isConsultant: boolean = true;
  isExternal: boolean = true;
  isHistoriqueEmpty: boolean = false;

  historiques: Historiques[] = [];
  historiquesCount: number | null | undefined; 

  user?: Users;

  selectDate: string | null | undefined;

  isAuthenticated: boolean = false;

  constructor(
    private router: Router,
    private observer: BreakpointObserver,
    private mediaObserver: MediaObserver,
    public translateService: TranslateService,
    private dialog: MatDialog,
    public visibilityStateManagerService: VisibilityStateManagerService,
    private userService: UserService,
    private historiqueService: HistoriqueService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
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



// Méthode pour formater une date en "jj.MM.aaaa"
formatDate(date?: string | Date): string {
  if (!date) {
    return ''; // Retourner une chaîne vide si la date est undefined
  }
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(parsedDate);
}

// Méthode pour formater les historiques avant génération du fichier Excel
formatHistoriques(historiques: Historiques[]): any[] {
  return historiques.map(historique => ({
    ...historique,
    publicationDate: this.formatDate(historique.publicationDate),
    jobCloseDate: this.formatDate(historique.jobCloseDate)
  }));
}

// Méthode pour générer un fichier Excel
generateExcel(): void {
  const formattedHistoriques = this.formatHistoriques(this.historiques);
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedHistoriques);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Historiques');
  XLSX.writeFile(wb, 'historiques.xlsx');
}
  ngOnInit(): void {
    this.initializeForm();

    const authSubscription = this.authService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;
        this.isAdmin = this.authService.isAdmin;
        this.isConsultant = this.authService.isConsultant;
        this.isExternal = this.authService.isExternal;

        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      }
    );
    this.subscriptions.add(authSubscription);

    this.fetchMyProfile();
    this.fetchHistoriques();
    this.initializeAsyncJobListingSearch();
    this.searchByDateRange();
  }

  initializeForm(): void {
    const formOptions: AbstractControlOptions = {
      validators: dateRangeValidator()
    };

    this.registrationForm = this.formBuilder.group({
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]]
    }, formOptions);
  }

 // Récupération des historiques
fetchHistoriques() {
  // Appel au service pour récupérer la liste des historiques pour un administrateur
  this.historiqueService.HistoriqueListByAdmin().subscribe({
    // En cas de réponse réussie
    next: (response: ApiResponseWithCount) => {
      // Vérifie si la réponse contient des données et si ces données sont un tableau
      if (response.result && Array.isArray(response.data)) {
        // Cast la réponse en type Historiques[]
        this.historiques = response.data as Historiques[];
        // Met à jour le statut pour indiquer si la liste des historiques est vide
        this.isHistoriqueEmpty = this.historiques.length === 0;
      } else {
        // Si les données ne sont pas présentes ou ne sont pas un tableau, considère la liste comme vide
        this.historiques = [];
        this.isHistoriqueEmpty = true;
      }
    },
    // En cas d'erreur de l'API
    error: (error) => {
      // Gère l'erreur en utilisant la méthode handleError
      this.errorMessage = this.handleError(error);
      // Considère la liste comme vide en cas d'erreur
      this.historiques = [];
      this.isHistoriqueEmpty = true;
    },
  });
}

// Recherche d'historiques par plage de dates
searchByDateRange(): void {
  // Vérifie si le formulaire est valide
  if (this.registrationForm.valid) {
    // Récupère les valeurs des champs startDate et endDate du formulaire
    const { startDate, endDate } = this.registrationForm.value;
    // Appel au service pour rechercher des historiques par plage de dates
    this.historiqueService.searchHistoriquesByDateRange(startDate, endDate).subscribe({
      // En cas de réponse réussie
      next: (response: ApiResponseWithCount) => {
        // Vérifie si la réponse contient des données et si ces données sont un tableau
        if (response.result && Array.isArray(response.data)) {
          // Cast la réponse en type Historiques[]
          this.historiques = response.data as Historiques[];
          // Met à jour le statut pour indiquer si la liste des historiques est vide
          this.isHistoriqueEmpty = this.historiques.length === 0;
        } else {
          // Si les données ne sont pas présentes ou ne sont pas un tableau, considère la liste comme vide
          this.historiques = [];
          this.isHistoriqueEmpty = true;
        }
      },
      // En cas d'erreur de l'API
      error: (error) => {
        // Gère l'erreur en utilisant la méthode handleError
        this.errorMessage = this.handleError(error);
        // Considère la liste comme vide en cas d'erreur
        this.historiques = [];
        this.isHistoriqueEmpty = true;
      }
    });
  }
}

// Recherche asynchrone d'historiques par mot clé
initializeAsyncJobListingSearch() {
  // S'abonne aux changements de valeur du contrôle de recherche
  this.searchHistoriqueControl.valueChanges
    .pipe(
      // Supprime les espaces inutiles au début et à la fin de la chaîne
      map((term) => (term ? term.trim() : '')),
      // Attend 300ms après la dernière frappe avant de considérer le terme
      debounceTime(300),
      // Ignore le nouveau terme s'il est identique au terme précédent
      distinctUntilChanged(),
      // Exécute une action pour chaque terme de recherche
      tap((term) => {
        // Si le champ de recherche est vide, réinitialise les historiques
        if (term === '') {
          this.fetchHistoriques();
        }
      }),
      // Filtre les termes de recherche pour qu'ils soient de longueur appropriée et alphanumériques
      filter((term) => term.length > 2 && term.length <= 50 && /^[a-zA-Z0-9 ]+$/.test(term)),
      // Nettoie la chaîne en supprimant tout ce qui n'est pas alphanumérique ou espace
      map((term) => term.replace(/[^a-zA-Z0-9 ]/g, '')),
      // Effectue la recherche avec le terme nettoyé
      switchMap((term) =>
        this.historiqueService.searchAllHistoriquesByWord(term)
      ),
      // Assure la désinscription proprement lors de la destruction du composant
      takeUntil(this.unsubscribe$)
    )
    .subscribe({
      // En cas de réponse réussie
      next: (response: ApiResponseWithCount) => {
        // Vérifie si la réponse contient des données et si ces données sont un tableau
        if (response.data && Array.isArray(response.data)) {
          // Cast la réponse en type Historiques[]
          this.historiques = response.data as Historiques[];
          // Met à jour le statut pour indiquer si la liste des historiques est vide
          this.isHistoriqueEmpty = this.historiques.length === 0;
        } else {
          // Si les données ne sont pas présentes ou ne sont pas un tableau, considère la liste comme vide
          this.historiques = [];
          this.isHistoriqueEmpty = true;
        }
      },
      // En cas d'erreur de l'API
      error: (error) => {
        // Gère l'erreur en utilisant la méthode handleError
        this.errorMessage = this.handleError(error);
        // Considère la liste comme vide en cas d'erreur
        this.historiques = [];
        this.isHistoriqueEmpty = true;
      },
    });
}
  
  
  fetchMyProfile() {
    this.userService.me().subscribe({
      next: (response: ApiResponse) => {
        if (response.data && !Array.isArray(response.data)) {
          this.user = response.data as Users;
        }
      },
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
      });
    }

  UserProfile(userId: number) {
    if (userId) {
      this.visibilityStateManagerService.saveState('dashboardState');
      this.router.navigate(['/users', 'profile', userId]);
    }
  }

  get startDate() {
    return this.registrationForm.get('startDate');
  }
  get endDate() {
    return this.registrationForm.get('endDate');
  }


  goBack() {
    if (this.isAdmin || this.isConsultant) {
      this.visibilityStateManagerService.restoreState('dashboardState');
        this.router.navigate(['/dashboard']);
    } else {
        this.router.navigate(['/home']);
    }
}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.subscriptions.unsubscribe();
    this.unsubscribe$.complete();
  }

// Initialisation après la vue
ngAfterViewInit() {
  // Observe les changements de taille de l'écran
  this.observer
    .observe(['(max-width: 800px)'])
    .pipe(
      delay(1), // Ajoute un délai pour permettre aux changements de se stabiliser
      untilDestroyed(this) // Assure la désinscription propre lors de la destruction du composant
    )
    .subscribe((res) => {
      // Vérifie si la taille de l'écran correspond à une largeur de 800px ou moins
      if (res.matches) {
        // Si c'est le cas, configure le mode du sidenav en mode 'over' et ferme le sidenav
        this.sidenav.mode = 'over';
        this.sidenav.close();
      } else {
        // Sinon, configure le mode du sidenav en mode 'side' et ouvre le sidenav
        this.sidenav.mode = 'side';
        this.sidenav.open();
      }
    });

  // S'abonne aux événements de navigation du routeur
  this.router.events
    .pipe(
      untilDestroyed(this), // Assure la désinscription propre lors de la destruction du composant
      filter((e) => e instanceof NavigationEnd) // Filtre les événements pour ne traiter que les fins de navigation
    )
    .subscribe(() => {
      // Si le sidenav est en mode 'over', le ferme après la navigation
      if (this.sidenav.mode === 'over') {
        this.sidenav.close();
      }
    });

  // Utilise setTimeout pour forcer la détection des changements après un cycle
  setTimeout(() => {
    this.cdr.detectChanges();
  }, 0);
}

}
