import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  Optional,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { MaterialModule } from '../../../../module/Material.module';
import { Users } from '../../../models';
import { ApiResponse } from '../../../shared/model';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { AuthentificationService } from '../../security/securityIndex';
import { UserService } from '../../service';
import { HandleErrorBase } from '../../shared/HandleErrorBase';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'app-interview-note',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MaterialModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './interview-note.component.html',
  styleUrl: './interview-note.component.css',
})
export class InterviewNoteComponent extends HandleErrorBase implements OnInit {
  handleJobListingCreating() {
    throw new Error('Method not implemented.');
  }

  private unsubscribe$ = new Subject<void>();
  errorMessage: string | null = null;
  registrationForm!: FormGroup;
  userToAddNote?: Users | null;
  userProfileId: number | null | undefined;
  currentUserId: number | null | undefined;
  currentUser?: Users | null;
  isAuthenticated: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthentificationService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router,
    public translateService: TranslateService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Optional() private dialogRef: MatDialogRef<DashboardComponent>
  ) {
    super(translateService);
    if (data && data.userToAddNoteData) {
      this.userProfileId = data.userId;
      this.userToAddNote = data.userToAddNoteData;
    }
    this.initializeForm();

    console.log('USER TO UPDATE : ', this.userToAddNote);
  }

  ngOnInit(): void {
    this.subscribeToAuthState();
    if (this.userProfileId) {
      this.fetchProfile();
    }
  }

  initializeForm(): void {
    this.registrationForm = this.formBuilder.group({
      candidate: ['', [Validators.required, Validators.maxLength(100)]],
      interviewDate: [
        new Date().toLocaleDateString(),
        [Validators.required, Validators.maxLength(15)],
      ],
      position: ['', [Validators.required, Validators.maxLength(100)]],
      technicalSkills: ['- ', [Validators.required, Validators.maxLength(700)]],
      professionalExperience: [
        '- ',
        [Validators.required, Validators.maxLength(500)],
      ],
      personalQualities: [
        '- ',
        [Validators.required, Validators.maxLength(500)],
      ],
      recommendation: ['', [Validators.required, Validators.maxLength(300)]],
      signature: ['', [Validators.required, Validators.maxLength(200)]],
    });
  }

  initializeFormWithData(): void {
    if (this.userToAddNote) {
      const interviewNote = JSON.parse(
        this.userToAddNote.interviewNote || '{}'
      );
      this.registrationForm.patchValue({
        candidate:
          interviewNote.candidate ||
          `${this.userToAddNote.firstname} ${this.userToAddNote.name}`,
        interviewDate:
          interviewNote.interviewDate || new Date().toLocaleDateString(),
        position: `${this.userToAddNote.jobTitle?.title}` || '',
        technicalSkills: interviewNote.technicalSkills || '- ',
        professionalExperience: interviewNote.professionalExperience || '- ',
        personalQualities: interviewNote.personalQualities || '- ',
        recommendation: interviewNote.recommendation || '',
        signature:
          interviewNote.signature ||
          `${this.currentUser?.firstname} ${this.currentUser?.name}\nConsultant en recrutement informatique\nM&M Consulting\n${this.currentUser?.email}\n${this.currentUser?.phoneNumber}`,
      });
    }
  }

  updateCandidateNoteInterview(): void {
    // On vérifie si l'utilisateur est authentifié.
    this.authService.getIsAuthenticated().subscribe((isAuthenticated) => {
      if (!isAuthenticated) {
        // Redirection vers la page de connexion si l'utilisateur n'est pas authentifié
        const currentUrl = this.router.url;
        this.router.navigate(['/signin'], {
          queryParams: { returnUrl: currentUrl },
        });
      } else if (this.registrationForm.valid && this.userProfileId) {
        const formValue = this.registrationForm.getRawValue();
        const interviewNote = {
          candidate: formValue.candidate,
          interviewDate: formValue.interviewDate,
          position: formValue.position,
          technicalSkills: formValue.technicalSkills,
          professionalExperience: formValue.professionalExperience,
          personalQualities: formValue.personalQualities,
          recommendation: formValue.recommendation,
          signature: formValue.signature,
        };
  
        if (JSON.stringify(interviewNote).length > 1500) {
          this.snackBar.open(
            "La note d'entretien dépasse la limite de 1500 caractères!",
            'Fermer',
            {
              duration: 3000,
            }
          );
          return;
        }
  
        const payload = { interviewNote: JSON.stringify(interviewNote) };
        const userId = this.userProfileId;
  
        this.userService
          .updateCandidateNoteInterview(userId, payload)
          .subscribe({
            next: (response: ApiResponse) => {
              this.translateService.get([
                'dialog.updateCandidateSuccessTitle',
                'dialog.updateInterviewNoteSuccessMessage',
                'dialog.closeButton'
              ]).subscribe(translations => {
                const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                  width: '300px',
                  data: {
                    title: translations['dialog.updateCandidateSuccessTitle'],
                    message: translations['dialog.updateInterviewNoteSuccessMessage'],
                    buttons: [{ text: translations['dialog.closeButton'], value: 'close', class: 'cancel-button' }],
                    messageClass: 'message-success',
                  },
                });
                dialogRef.afterClosed().subscribe((result) => {
                  if (result === 'close') {
                    this.initializeForm();
                    this.dialogRef?.close();
                    location.reload();
                  }
                });
              });
            },
            error: (errorResponse: ApiResponse) => {
              this.errorMessage = this.handleError(errorResponse);
              this.showBackendErrorDialog(
                this.errorMessage ?? 'Une erreur inconnue est survenue.'
              );
            },
          });
      } else {
        Object.values(this.registrationForm.controls).forEach((control) => {
          control.markAsTouched();
        });
      }
    });
  }
  

  private subscribeToAuthState(): void {
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;
        this.currentUserId = this.authService.getCurrentUserId();
        if (this.currentUserId) {
          this.fetchCurentUserProfile();
        }
        this.cdr.detectChanges();
      });
  }

  private fetchProfile() {
    if (this.userProfileId) {
      this.userService.profile(this.userProfileId).subscribe({
        next: (response: any) => {
          if (response.data && !Array.isArray(response.data)) {
            this.userToAddNote = response.data as Users;
            this.initializeFormWithData();
          }
        },
        error: (errorResponse: any) => {
          this.errorMessage = this.handleError(errorResponse);
          this.showBackendErrorDialog(
            this.errorMessage ?? 'Une erreur inconnue est survenue.'
          );
        },
      });
    }
  }

  private fetchCurentUserProfile() {
    if (this.currentUserId) {
      this.userService.profile(this.currentUserId).subscribe({
        next: (response: any) => {
          if (response.data && !Array.isArray(response.data)) {
            this.currentUser = response.data as Users;
          }
        },
        error: (errorResponse: any) => {
          this.errorMessage = this.handleError(errorResponse);
          this.showBackendErrorDialog(
            this.errorMessage ?? 'Une erreur inconnue est survenue.'
          );
        },
      });
    }
  }

      // Méthode pour afficher le dialogue d'erreur après une tentative d'enregistrement échouée
      private showBackendErrorDialog(errorMessage: string) {
        this.translateService.get([
          'dialog.errorTitle',
          'dialog.closeButton'
        ]).subscribe(translations => {
          const dialogRef =    this.dialog.open(ConfirmDialogComponent, {
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
            }
          });
        });
      }
    

  ngOnDestroy(): void {
    // Signale la désinscription
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
