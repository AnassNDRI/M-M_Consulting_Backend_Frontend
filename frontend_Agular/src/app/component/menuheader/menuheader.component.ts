import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  NavigationEnd,
  Router,
  Event as RouterEvent,
  RouterLink,
} from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, Subscription, filter } from 'rxjs';
import { MaterialModule } from '../../../module/Material.module';
import { NavigationService } from '../../shared/service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import {
  AuthentificationService,
  LayoutService,
} from '../security/service/authServiceIndex';

@Component({
  selector: 'app-menuheader',
  standalone: true,
  templateUrl: './menuheader.component.html',
  styleUrl: './menuheader.component.css',
  imports: [
    CommonModule,
    RouterLink,
    MaterialModule,
    FormsModule,
    TranslateModule,
    MatDialogModule,
  ],
})
export class MenuheaderComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  private destroy$ = new Subject<void>(); // Utilisé pour la désinscription propre à la destruction

  language: string = 'fr'; // Langue actuelle de l'interface utilisateur
  isAuthenticated = false; // État d'authentification initial de l'utilisateur
  headerVisible: boolean = true;
  isAdmin = false; // Indique si l'utilisateur est administrateur
  isConsultant = false; // Indique si l'utilisateur est consultant
  isRecruiter = false; // Indique si l'utilisateur est recruteur
  isCandidate = false; // Indique si l'utilisateur est candidat
  userRole: string | undefined | null;
  username: string | undefined | null;
  showLogo: boolean = true; // Ajout de la propriété pour la visibilité du logo

  constructor(
    private translateService: TranslateService, // Service de traduction pour i18n
    private dialog: MatDialog,
    public layoutService: LayoutService, // Service pour gérer la disposition de la page
    private router: Router, // Service de routage pour la navigation
    private cdr: ChangeDetectorRef, // Référence pour détecter les changements,
    public navigationService: NavigationService,
    private authService: AuthentificationService // Service d'authentification
  ) {
    this.translateService.setDefaultLang(this.language); // Définit la langue par défaut comme français
    this.translateService.use(this.language); // Applique la langue actuelle pour la traduction
  }

  // Initialisation du composant: configure et gère les souscriptions aux services nécessaires
  ngOnInit(): void {
    this.manageSubscriptions();
  }

  manageSubscriptions(): void {
    // Vérifie l'état d'authentification et met à jour les rôles dès l'initialisation

    // S'abonner à l'état d'authentification du service
    // Souscription à l'état d'authentification
    const authSubscription = this.authService.isAuthenticated$.subscribe(
      (isAuthenticated) => {
        // Met à jour `isAuth` chaque fois que l'état d'authentification change
        this.isAuthenticated = isAuthenticated;
        this.cdr.detectChanges();
      }
    );
    this.subscriptions.add(authSubscription);
    this.isAdmin = this.authService.isAdmin;
    this.isRecruiter = this.authService.isRecruiter;
    this.isConsultant = this.authService.isConsultant;
    this.isCandidate = this.authService.isCandidate;
    this.userRole = this.authService.getUserRole();

    // S'abonne au statut de visibilité de l'en-tête et met à jour la vue si nécessaire
    const layoutSubscription = this.layoutService.isHeaderVisible$.subscribe(
      (headerVisible) => {
        this.headerVisible = headerVisible;
        this.cdr.detectChanges(); // Détecte les changements pour éviter les erreurs d'expression
      }
    );
    this.subscriptions.add(layoutSubscription);

    // S'abonner au nom de l'utilisateur
    const userNameSubscription = this.authService.userName$.subscribe(
      (name) => {
        this.username = name;
        this.cdr.detectChanges();
      }
    );
    this.subscriptions.add(userNameSubscription);

    // S'abonner à `isOnAdminPageObservable` pour gérer la visibilité du logo
    const navSubscription = this.navigationService.isOnAdminPage$.subscribe(
      (isOnAdminPage) => {
        this.showLogo = !isOnAdminPage;
        this.cdr.detectChanges(); // Assurez-vous de détecter les changements si nécessaire
      }
    );
    this.subscriptions.add(navSubscription);

    const logoVisibilitySubscription =
      this.navigationService.isOnAdminPage$.subscribe((isOnAdminPage) => {
        this.showLogo = !isOnAdminPage;
      });

    this.subscriptions.add(logoVisibilitySubscription);

    const routerSubscription = this.router.events
      .pipe(
        filter(
          (event: RouterEvent): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe((event: NavigationEnd) => {
        // Vérifie si l'URL commence par '/candidate-cv-viewer'
        this.headerVisible = !event.url.startsWith('/candidate-cv-viewer');
        this.cdr.detectChanges(); // Force la détection de changement
      });

    this.subscriptions.add(routerSubscription);
  }

  // Appelée lors du changement de la langue via le menu déroulant
  changeLanguage(event: Event): void {
    const selectElement = event.target as HTMLSelectElement; // Cast de l'élément event.target
    this.setLanguage(selectElement.value); // Met à jour la langue avec la nouvelle valeur
  }

  // Met à jour la langue utilisée et la sauvegarde
  setLanguage(language: string): void {
    this.language = language; // Stocke la nouvelle langue
    this.translateService.use(language); // Applique la nouvelle langue pour les traductions
  }

  // Redirige vers la page de connexion
  goToLogin() {
    this.router.navigate(['/signin']);
  }

  // Redirige vers la page d'inscription
  goToRegister() {
    this.router.navigate(['/role']);
  }

  navigateToUserDashboard(): void {
    const role = this.userRole;
    if (role) {
      this.navigationService.navigateToSecure(role);
    }
  }

  // Gère la déconnexion de l'utilisateur
// Gère la déconnexion de l'utilisateur
logout(): void {
  this.translateService.get([
    'dialog.logoutTitle',
    'dialog.logoutMessage',
    'dialog.yesButton',
    'dialog.noButton'
  ]).subscribe(translations => {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: 'auto',
      height: 'auto',
      data: {
        title: translations['dialog.logoutTitle'],
        message: translations['dialog.logoutMessage'],
        buttons: [
          { text: translations['dialog.yesButton'], value: true, class: 'confirm-button' },
          { text: translations['dialog.noButton'], value: false, class: 'cancel-button' },
        ],
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.authService.logout(); // Appelle la méthode de déconnexion du service
        this.resetUserRole(); // Appelle de la méthode de réinitialisation des rôles
        this.router.navigate(['/home']); // Redirige vers la page d'accueil
      }
    });
  });
}


  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Désabonne de toutes les souscriptions actives
    this.destroy$.next(); // Signale que toutes les activités doivent être arrêtées
    this.destroy$.complete(); // Ferme le Subject
  }

  // Réinitialisation des rôles ou tout autre état lié à l'utilisateur
  resetUserRole(): void {
    this.isAdmin = false;
    this.isConsultant = false;
    this.isRecruiter = false;
    this.isCandidate = false;
  }
}
