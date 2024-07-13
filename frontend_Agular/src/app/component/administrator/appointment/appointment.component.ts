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
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarModule,
  CalendarView,
} from 'angular-calendar';
import { EventColor } from 'calendar-utils';
import { isSameDay, isSameMonth } from 'date-fns';
import { Subject, takeUntil } from 'rxjs';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MaterialModule } from '../../../../module/Material.module';
import { Appointment, JobApplications, TimeSlot } from '../../../models';
import { ApiResponse } from '../../../shared/model';
import { DateWithSuffixPipe } from '../../../shared/pipe/date-with-suffix.pipe';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import {
  ApiResponseWithCount,
  AuthentificationService,
} from '../../security/securityIndex';
import {
  AppointmentService,
  JobapplicationService,
  OthersTablesService,
} from '../../service';
import { VisibilityStateManagerService } from '../../service/visibilityStateManager.service';
import { HandleErrorBase } from '../../shared/HandleErrorBase';


@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    FormsModule,
    MaterialModule,
    RouterLink,
    RouterOutlet,
    TranslateModule,
    ReactiveFormsModule,
    AsyncPipe,
    DateWithSuffixPipe,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css',
})
export class AppointmentComponent
  extends HandleErrorBase
  implements OnInit, OnDestroy
{
  registrationForm!: FormGroup; //  Initialiser FormGroup avant son utilisation.

  @ViewChild('modalContent', { static: true }) modalContent!: TemplateRef<any>;
  @ViewChild('formSection') formSection!: ElementRef;

  private unsubscribe$ = new Subject<void>();

  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  modalData!: { action: string; event: CalendarEvent };
  refresh = new Subject<void>();
  events: CalendarEvent[] = [];
  activeDayIsOpen: boolean = true;

  errorMessage: string | null = null; // Pour stocker le message d'erreur

  isCreate: boolean = false;
  isUpdate: boolean = false;
  isUpdateFromTheCalendarboolean = false;

  isAuthenticated: boolean = false; // État d'authentification initial de l'utilisateur

  jobApplication: JobApplications[] = [];
  myAllAppointmentGrouped: Appointment[] = [];

  timeslots: TimeSlot[] = [];

  theJobApplication?: JobApplications;
  myAppointment?: Appointment;

  jobApplyId: number | null | undefined;
  appointmentJobApplyId: number | null | undefined;
  myAppointmentId: number | null | undefined;
  theCalendarAppointmentId: number | null | undefined;

  myAppointmentGroupedCount: number | null | undefined; // Nombre de RDV

  constructor(
    private modal: NgbModal,
    private authService: AuthentificationService,
    private formBuilder: FormBuilder, // Service Angular pour construire des formulaires réactifs.
    private router: Router, // Service Angular pour la navigation entre les routes.
    private route: ActivatedRoute,
    translateService: TranslateService,
    private dialog: MatDialog,
    private jobApplicationService: JobapplicationService,
    private appointmentService: AppointmentService,
    private othersTablesService: OthersTablesService,
    private cdr: ChangeDetectorRef,
    private visibilityStateManagerService: VisibilityStateManagerService
  ) {
    super(translateService);
  }

  ngOnInit(): void {
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

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Suppression d'une annonce par le consultant ou le proprietaire @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  deleteThisAppointment(appointmentId: number) {
    if (appointmentId) {
      // Demande de confirmation avant de procéder à la suppression.
      const confirmDialogRef =
        this.showConfirmDemandBeforDeleteAppointmentDialog();

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

  // Méthode pour afficher le dialogue de succès apres suppression
  private showDeleteSuccessDialog() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
      data: {
        title: 'Suppression réussie !',
        message: 'Le rendez-vous a été supprimée avec succès.',
        buttons: [{ text: 'Fermer', value: 'close', class: 'cancel-button' }],
        messageClass: 'message-success',
      },
    });
    // Après la fermeture du dialogue
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'close') {
        this.visibilityStateManagerService.restoreState('dashboardState');
        this.router.navigate(['/dashboard']);
        location.reload();
      }
    });
  }

  private showConfirmDemandBeforDeleteAppointmentDialog() {
    return this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true, // Empêche la fermeture en cliquant à l'extérieur du dialogue
      data: {
        title: 'Confirmation requise',
        message:
          'Êtes-vous sûr de vouloir supprimer ce rendez-vous ? Cette action est irréversible.',
        buttons: [
          { text: 'Oui', value: true, class: 'confirm-button' },
          { text: 'Non', value: false, class: 'cancel-button' },
        ],
        messageClass: 'message-warning',
      },
    });
  }
  // Méthode pour afficher le dialogue de succès apres Validation
  private showRegisterAppointmentSuccessDialog() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Modification réussi !',
        message: `Rendez-vous modifié avec succès et courriel de notification envoyé au candidat.`,
        buttons: [{ text: 'Fermer', value: 'close', class: 'cancel-button' }],
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
  private loadMyInterviewAppointments() {
    this.appointmentService.getMyallAppointmentConsultant().subscribe({
      next: (response: ApiResponseWithCount) => {
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
          actions: this.actions(appointment.appointmentId, appointment.jobApplication.jobListing.jobListingId, appointment.jobApplication.user.userId),
          meta: { appointment }, // Ajoute l'objet appointment aux métadonnées
        }));
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

  // Méthode pour afficher le dialogue d'erreur après une tentative d'enregistrement échouée
  private showRegisterAppointmentErrorDialog(errorMessage: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: 'Une erreur est survenue',
        message: errorMessage,
        buttons: [{ text: 'Fermer', value: 'close', class: 'cancel-button' }],
        messageClass: 'message-error',
      },
    });
    // Après la fermeture du dialogue
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'close') {
        this.visibilityStateManagerService.restoreState('dashboardState');
        this.router.navigate(['/dashboard']);
        location.reload();
       
      }
    });
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




  goBack() {
    this.visibilityStateManagerService.restoreState('dashboardState');
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
