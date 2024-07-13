import { Routes } from '@angular/router';
import { AccountConfirmComponent } from './component/account-confirm/account-confirm.component';
import { ContactComponent } from './component/contact/contact.component';
import { FaqsComponent } from './component/faqs/faqs.component';
import { HomePageComponent } from './component/home-page/home-page.component';

import { PageNotFoundComponent } from './component/page-not-found/page-not-found.component';
import { PasswordForgotComponent } from './component/password-forgot/password-forgot.component';
import { PasswordRessetComponent } from './component/password-resset/password-resset.component';
import { RegisterCandidateComponent } from './component/register-candidate/register-candidate.component';
import { RegisterRecruiterComponent } from './component/register-recruiter/register-recruiter.component';
import { RegisterComponent } from './component/register/register.component';
import { RoleComponent } from './component/role/role.component';
import { SigninComponent } from './component/security/component/signin/signin.component';
import { SecurityGuard } from './component/security/guard/security.guard';
import {
  CandidateGuard,
  ConsultantGuard,
  RecruiterGuard,
} from './component/security/securityIndex';
import { AppointmentComponent } from './component/administrator/appointment/appointment.component';
import { InterviewNoteComponent } from './component/administrator/interview-note/interview-note.component';
import { AccountingDepartementComponent } from './component/administrator/accounting-departement/accounting-departement.component';
import { ExternalGuard } from './component/security/guard/External.guard';
import { JoblistingListComponent } from './component/joblisting/joblisting-list/joblisting-list.component';

export const routes: Routes = [
  { path: 'home', component: HomePageComponent },

  {
    path: 'add-job',
    loadComponent: () =>
      import(
        './component/profile.recruiter/joblisting/addjoblisting/addjoblisting.component'
      ).then((m) => m.AddjoblistingComponent),
    canActivate: [RecruiterGuard],
  },

  {
    path: 'users/profile/:userId',
    loadComponent: () =>
      import('./component/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [SecurityGuard],
  },

  {
    path: 'candidate-profile',
    loadComponent: () =>
      import(
        './component/profile.candidate/profile-candidate/profile-candidate.component'
      ).then((m) => m.ProfileCandidateComponent),
    canActivate: [CandidateGuard],
  }, //CandidateCvViewer
  {
    path: 'candidate-cv-viewer/:userId',
    loadComponent: () =>
      import(
        './component/profile.candidate/candidate-cv-viewer-component/candidate-cv-viewer-component.component'
      ).then((m) => m.CandidateCvViewerComponentComponent),
    canActivate: [SecurityGuard],
  },
  {
    path: 'recruiter-profile',
    loadComponent: () =>
      import(
        './component/profile.recruiter/recruiter-profile/recruiter-profile.component'
      ).then((m) => m.RecruiterProfileComponent),
    canActivate: [RecruiterGuard],
  },
  {
    path: 'user-list',
    loadComponent: () =>
      import('./component/user/user-list/user-list.component').then(
        (m) => m.UserListComponent
      ),
    canActivate: [ConsultantGuard],
  },
  {
    path: 'add-user',
    loadComponent: () =>
      import('./component/user/adduser/adduser.component').then(
        (m) => m.AdduserComponent
      ),
    canActivate: [ConsultantGuard],
  },
  {
    path: 'joblisting-list',
    loadComponent: () =>
      import(
        './component/profile.recruiter/joblisting/joblisting-list/joblisting-list.component'
      ).then((m) => m.JoblistingListComponent),
  },

  {
    path: 'savejob-list',
    loadComponent: () =>
      import('./component/savejob/savejob-list/savejob-list.component').then(
        (m) => m.SavejobListComponent
      ),
  },
  {
    path: 'add-savejob',
    loadComponent: () =>
      import('./component/savejob/addsavejob/addsavejob.component').then(
        (m) => m.AddsavejobComponent
      ),
  },



  {
    path: 'dashboard',
    loadComponent: () =>
      import('./component/administrator/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [ConsultantGuard]
    ,
    children: [
      {
        path: 'appoint',
        loadComponent: () =>
          import('./component/administrator/appointment/appointment.component').then(
            (m) => m.AppointmentComponent
          ),
      }
    ]
  },
  {
    path: 'external-profile',
    loadComponent: () =>
      import('./component/administrator/accounting-departement/accounting-departement.component').then(
        (m) => m.AccountingDepartementComponent
      ),
    canActivate: [ExternalGuard],
  },
  
  {
    path: 'register-collaborator',
    loadComponent: () =>
      import(
        './component/administrator/register-collaborator/register-collaborator.component'
      ).then((m) => m.RegisterCollaboratorComponent),
    canActivate: [ConsultantGuard],
  },

  {
    path: 'joblistings/detail/:jobListingId',
    loadComponent: () =>
      import(
        './component/profile.recruiter/joblisting/detail-joblisting/detail-joblisting.component'
      ).then((m) => m.DetailJoblistingComponent),
  },

  /* { path: 'sidebar', component: SidebarComponent },
  { path: 'tel', component: RegisterComponent },
  { path: 'faqs', component: FaqsComponent },
 
  {
    path: 'joblistings/detail/:jobListingId',
    component: DetailJoblistingComponent,
  }, */

  { path: 'faqs', component: FaqsComponent },
  { path: 'compta', component: AccountingDepartementComponent },
  
  { path: 'list', component: JoblistingListComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register-recruiter', component: RegisterRecruiterComponent },
  { path: 'register-candidate', component: RegisterCandidateComponent },
  { path: 'role', component: RoleComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'forgot-pwd', component: PasswordForgotComponent },
  { path: 'reset-pwd', component: PasswordRessetComponent },
  { path: 'account-confirm', component: AccountConfirmComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },
];
