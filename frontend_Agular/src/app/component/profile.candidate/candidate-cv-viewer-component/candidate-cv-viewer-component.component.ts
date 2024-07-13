import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
// import { PdfViewerModule } from 'ng2-pdf-viewer';

import { Subject, takeUntil } from 'rxjs';
import { MaterialModule } from '../../../../module/Material.module';
import { Users } from '../../../models';
import { DateWithSuffixPipe } from '../../../shared/pipe/date-with-suffix.pipe';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { MenuheaderComponent } from '../../menuheader/menuheader.component';
import {
  ApiResponseWithCv,
  AuthentificationService,
  CvDtoInterface,
} from '../../security/securityIndex';
import { UserService } from '../../service';
import { HandleErrorBase } from '../../shared/HandleErrorBase';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-candidate-cv-viewer-component',
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
    NgxExtendedPdfViewerModule,
   // PdfViewerModule,
  ],

  templateUrl: './candidate-cv-viewer-component.component.html',
  styleUrl: './candidate-cv-viewer-component.component.css',
})
export class CandidateCvViewerComponentComponent
  extends HandleErrorBase
  implements OnInit, OnDestroy
{
  private unsubscribe$ = new Subject<void>();

  user?: Users;
  cvUrl: string | null | undefined;
  errorMessage: string | null = null; // Pour stocker le message d'erreur
  isAuthenticated: boolean = false; // État d'authentification initial de l'utilisateur
  currentUserId: number | null | undefined;

  isAdmin: boolean = false; // Indique si l'utilisateur est un Admin
  isRecruiter: boolean = false; // Indique si l'utilisateur est recruteur
  isConsultant: boolean = false; // Indique si l'utilisateur est un consultant
  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthentificationService,
    private userService: UserService,
    translateService: TranslateService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    super(translateService);
  }

  // Méthode ngOnInit appelée à l'initialisation du composant.
  ngOnInit(): void {
    this.subscribeToAuthState(); // S'abonne aux changements de l'état d'authentification
    this.subscribeToUserId(); // S'abonne aux changements de l'ID de user dans l'URL
  }

  //// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Souscription à l'état d'authentification de l'utilisateur. // @@@@@@@@@@@@@@@@
  private subscribeToAuthState(): void {
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isAuthenticated) => {
        this.isAuthenticated = isAuthenticated; // Met à jour l'état d'authentification
        this.currentUserId = this.authService.getCurrentUserId();
        this.isAuthenticated = isAuthenticated; // Met à jour l'état d'authentification
        this.isAdmin = this.authService.isAdmin; // Met à jour si l'utilisateur est un admin
        this.isConsultant = this.authService.isConsultant; // Met à jour si l'utilisateur est un admin
        this.isRecruiter = this.authService.isRecruiter; // Met à jour si l'utilisateur est un recruteur
        this.currentUserId = this.authService.getCurrentUserId();

        this.cdr.detectChanges(); // Détecte les changements (utile si les mises à jour ne sont pas détectées automatiquement)
      });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Souscription aux paramètres de la route pour récupérer l'ID du User.
  private subscribeToUserId(): void {
    this.route.params.pipe(takeUntil(this.unsubscribe$)).subscribe((params) => {
      const userId = +params['userId']; // Convertit le paramètre en nombre
      this.currentUserId = userId;
      console.log(`Le user ID venant du Proffil:`, userId);
      if (userId) {
        console.log(`je rentre dans le if:`, userId);
        //  this.fetchCandidateCv(); // Récupère les détails du jobListing si l'ID est valide
        this.fetchMyCv();
      }
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Methode pour afficher le profile de l'Utilisateur connecté @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  private fetchMyCv() {
    console.log(`je rentre dans le fetchMyCv:`, this.currentUserId);
    if (this.currentUserId) {
      const userId = this.currentUserId;
      console.log(`Le ID a passer au fetchMyCv:`, userId);
      this.userService.getCvByUserId(userId).subscribe({
        next: (response: ApiResponseWithCv) => {
          if (response.data && !Array.isArray(response.data)) {
            const cvData = response.data as CvDtoInterface;
            if (cvData.cvUrl) {
              this.cvUrl = cvData.cvUrl;

              console.log(`Yes j'ai le lien du cv: `, this.cvUrl);
              /*  setTimeout(() => {
              this.cvUrl = cvData.cvUrl;
              console.log(`Yes j'ai le lien du cv: `, this.cvUrl);
            }, 500); // Délai de 1 seconde */
            } else {
              console.log(`je n'ai pas trouvé le lien du cv`);
              // Gérez le cas où cvUrl est undefined, par exemple, affichez un message à l'utilisateur
            }
          }
        },
        error: (error) => this.showErrorDialog(error),
      });
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Methode pour afficher le profile de l'Utilisateur connecté @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  /* private fetchCandidateCv() {
    if (this.user?.userId) {
      const userId = this.user.userId;
      this.userService.getCvByUserId(userId).subscribe({
        next: (response: ApiResponseWithUserCvUrl) => { // Utilisez ici le type qui inclut cvUrl
          this.userCvUrl = response.cvUrl;
          console.log('Le CV : ', this.userCvUrl);
        },
        error: (error) => this.showErrorDialog(error),
      });
      
    }
  }*/


  /*
  private fetchCandidateCv() {
    if (this.user?.userId) {
      const userId = this.user.userId;
      this.userService.getCvByUserId(userId).subscribe({
        next: (response) => {  // La réponse est traitée comme un `Blob` sans spécifier le type
          const objectUrl = URL.createObjectURL(response);
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
        },
        error: (error) => this.showErrorDialog(error)
      });
    }
  }*/

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

  askBack() {
    // On récupère returnUrl depuis les queryParams
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];

    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      if (this.isAdmin) {
        this.router.navigate(['/admin']);
      }
      if (this.isRecruiter) {
        this.router.navigate(['recruiter-profile']);
      }
      this.router.navigate(['/home']);
    }
  }

  // Désabonnement pour éviter les fuites de mémoire
  ngOnDestroy(): void {
    // Signale la désinscription
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }















  reRender = true;
  pdfSize = 90;
  leftSize = 10;

  leftStyle: any = {
    width: '10%',
    float: 'left'
  };

  rightStyle: any = {
    width: '90%',
    float: 'left'
  };

  renderAgain() {
    this.reRender = false;
    setTimeout(() => {
      this.reRender = true;
    }, 5);
  }

  updateLayout(num: any) {
    this.pdfSize = this.pdfSize + num;
    this.leftSize = this.leftSize - num;

    this.leftStyle = {
      width: `${this.leftSize}%`,
      float: 'left'
    };
    this.rightStyle = {
      width: `${this.pdfSize}%`,
      float: 'left'
    };
    this.renderAgain();
  }
}
