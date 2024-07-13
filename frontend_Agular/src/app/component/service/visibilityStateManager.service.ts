import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class VisibilityStateManagerService {
  constructor(private router: Router) {}

  private _states: any = {};

  private _managerUsersBloc = false;
  private _displayDivBadageUsersInvalidate = false;
  private _displayDivBadageUsersValidate = false;
  private _managerJoblistingsBloc = false;
  private _displayDivBadageJobsValidate = false;
  private _displayDivBadageJobsInvalidate = false;
  private _isVisibleManageUserListDiv = false;
  private _isbtnAccountValided = false;
  private _isbtnAccountInvalided = false;
  private _isVisibleManageJobListDiv = false;
  private _isbtSortAllJobListingInvalidate = false;
  private _isbtSortValidedJobListing = false;
  private _isbtSortAppoint = false;
  private _isbtSortAllJobListing = false;
  private _isbtSortJobApply = false;
  private _isMySavedJobListing = false;
  private _isJobApplicationtableVisible = false;
  private _isApplicationBloc = false;
  private _isBtnAppoint = false;
  private _displayAppointment = false;
  private _displayAllAppointment = false;
  private _displayCalendar = true;
  private _isbtSortHistorique = false;
  private _displayMyAppointment = false;
  private _displayPlanning = true;

 private _appointmentForm = false;



 get appointmentForm(): boolean {
  return this._appointmentForm;
}
set appointmentForm(value: boolean) {
  this._appointmentForm = value;
}

  get displayPlanning(): boolean {
    return this._displayPlanning;
  }
  set displayPlanning(value: boolean) {
    this._displayPlanning = value;
  }


  get displayMyAppointment(): boolean {
    return this._displayMyAppointment;
  }
  set displayMyAppointment(value: boolean) {
    this._displayMyAppointment = value;
  }

  get isbtSortHistorique(): boolean {
    return this._isbtSortHistorique;
  }
  set isbtSortHistorique(value: boolean) {
    this._isbtSortHistorique = value;
  }

  get displayCalendar(): boolean {
    return this._displayCalendar;
  }
  set displayCalendar(value: boolean) {
    this._displayCalendar = value;
  }

  get displayAllAppointment(): boolean {
    return this._displayAllAppointment;
  }
  set displayAllAppointment(value: boolean) {
    this._displayAllAppointment = value;
  }

  get displayAppointment(): boolean {
    return this._displayAppointment;
  }
  set displayAppointment(value: boolean) {
    this._displayAppointment = value;
  }

  get isBtnAppoint(): boolean {
    return this._isBtnAppoint;
  }
  set isBtnAppoint(value: boolean) {
    this._isBtnAppoint = value;
  }

  get isApplicationBloc(): boolean {
    return this._isApplicationBloc;
  }
  set isApplicationBloc(value: boolean) {
    this._isApplicationBloc = value;
  }

  get isJobApplicationtableVisible(): boolean {
    return this._isJobApplicationtableVisible;
  }
  set isJobApplicationtableVisible(value: boolean) {
    this._isJobApplicationtableVisible = value;
  }

  get isMySavedJobListing(): boolean {
    return this._isMySavedJobListing;
  }
  set isMySavedJobListing(value: boolean) {
    this._isMySavedJobListing = value;
  }
  get isbtSortJobApply(): boolean {
    return this._isbtSortJobApply;
  }
  set isbtSortJobApply(value: boolean) {
    this._isbtSortJobApply = value;
  }

  get isbtSortAllJobListing(): boolean {
    return this._isbtSortAllJobListing;
  }
  set isbtSortAllJobListing(value: boolean) {
    this._isbtSortAllJobListing = value;
  }

  get managerUsersBloc(): boolean {
    return this._managerUsersBloc;
  }
  set managerUsersBloc(value: boolean) {
    this._managerUsersBloc = value;
  }

  get displayDivBadageUsersInvalidate(): boolean {
    return this._displayDivBadageUsersInvalidate;
  }
  set displayDivBadageUsersInvalidate(value: boolean) {
    this._displayDivBadageUsersInvalidate = value;
  }

  get displayDivBadageUsersValidate(): boolean {
    return this._displayDivBadageUsersValidate;
  }
  set displayDivBadageUsersValidate(value: boolean) {
    this._displayDivBadageUsersValidate = value;
  }

  get managerJoblistingsBloc(): boolean {
    return this._managerJoblistingsBloc;
  }
  set managerJoblistingsBloc(value: boolean) {
    this._managerJoblistingsBloc = value;
  }

  get displayDivBadageJobsValidate(): boolean {
    return this._displayDivBadageJobsValidate;
  }
  set displayDivBadageJobsValidate(value: boolean) {
    this._displayDivBadageJobsValidate = value;
  }

  get displayDivBadageJobsInvalidate(): boolean {
    return this._displayDivBadageJobsInvalidate;
  }
  set displayDivBadageJobsInvalidate(value: boolean) {
    this._displayDivBadageJobsInvalidate = value;
  }

  get isVisibleManageUserListDiv(): boolean {
    return this._isVisibleManageUserListDiv;
  }
  set isVisibleManageUserListDiv(value: boolean) {
    this._isVisibleManageUserListDiv = value;
  }

  get isbtnAccountValided(): boolean {
    return this._isbtnAccountValided;
  }
  set isbtnAccountValided(value: boolean) {
    this._isbtnAccountValided = value;
  }

  get isbtnAccountInvalided(): boolean {
    return this._isbtnAccountInvalided;
  }
  set isbtnAccountInvalided(value: boolean) {
    this._isbtnAccountInvalided = value;
  }

  get isVisibleManageJobListDiv(): boolean {
    return this._isVisibleManageJobListDiv;
  }
  set isVisibleManageJobListDiv(value: boolean) {
    this._isVisibleManageJobListDiv = value;
  }

  get isbtSortAllJobListingInvalidate(): boolean {
    return this._isbtSortAllJobListingInvalidate;
  }
  set isbtSortAllJobListingInvalidate(value: boolean) {
    this._isbtSortAllJobListingInvalidate = value;
  }

  get isbtSortValidedJobListing(): boolean {
    return this._isbtSortValidedJobListing;
  }
  set isbtSortValidedJobListing(value: boolean) {
    this._isbtSortValidedJobListing = value;
  }

  get isbtSortAppoint(): boolean {
    return this._isbtSortAppoint;
  }
  set isbtSortAppoint(value: boolean) {
    this._isbtSortAppoint = value;
  }



 // Methodes pour mettre tous les états  à zéro.
 clearAllStates() {
  this.appointmentForm = false;
  this._managerUsersBloc = false;
  this._displayDivBadageUsersInvalidate = false;
  this._displayDivBadageUsersValidate = false;
  this._managerJoblistingsBloc = false;
  this._displayDivBadageJobsValidate = false;
  this._displayDivBadageJobsInvalidate = false;
  this._isVisibleManageUserListDiv = false;
  this._isbtnAccountValided = false;
  this._isbtnAccountInvalided = false;
  this._isVisibleManageJobListDiv = false;
  this._isbtSortAllJobListingInvalidate = false;
  this._isbtSortValidedJobListing = false;
  this._isbtSortAppoint = false;
  this._isbtSortAllJobListing = false;
  this._isbtSortJobApply = false;
  this._isMySavedJobListing = false;
  this._isJobApplicationtableVisible = false;
  this._isApplicationBloc = false;
  this._isBtnAppoint = false;
  this._displayAppointment = false;
  this._displayAllAppointment = false;
  this._displayCalendar = false;
  this._isbtSortHistorique = false;
  this._displayMyAppointment = false;
  this._displayPlanning = true;
  

  // Supprime les états stockés
  this._states = {};
  localStorage.removeItem('visibilityStates');
}


// Méthode pour sauvegarder l'état actuel dans le localStorage
saveState(key: string) {
  const state = {
    displayPlanning : this.displayPlanning,
    appointmentForm : this.appointmentForm,
    managerUsersBloc: this.managerUsersBloc,
    displayDivBadageUsersInvalidate: this.displayDivBadageUsersInvalidate,
    displayDivBadageUsersValidate: this.displayDivBadageUsersValidate,
    managerJoblistingsBloc: this.managerJoblistingsBloc,
    displayDivBadageJobsValidate: this.displayDivBadageJobsValidate,
    displayDivBadageJobsInvalidate: this.displayDivBadageJobsInvalidate,
    isVisibleManageUserListDiv: this.isVisibleManageUserListDiv,
    isbtnAccountValided: this.isbtnAccountValided,
    isbtnAccountInvalided: this.isbtnAccountInvalided,
    isVisibleManageJobListDiv: this.isVisibleManageJobListDiv,
    isbtSortAllJobListingInvalidate: this.isbtSortAllJobListingInvalidate,
    isbtSortValidedJobListing: this.isbtSortValidedJobListing,
    isbtSortAppoint: this.isbtSortAppoint,
    isbtSortAllJobListing: this.isbtSortAllJobListing,
    isbtSortJobApply: this.isbtSortJobApply,
    isMySavedJobListing: this.isMySavedJobListing,
    isJobApplicationtableVisible: this.isJobApplicationtableVisible,
    isApplicationBloc: this.isApplicationBloc,
    isBtnAppoint: this.isBtnAppoint,
    displayAppointment: this.displayAppointment,
    displayAllAppointment: this.displayAllAppointment,
    displayCalendar: this.displayCalendar,
    isbtSortHistorique: this.isbtSortHistorique,
    displayMyAppointment: this.displayMyAppointment,
  };
  this._states[key] = state;
  localStorage.setItem('visibilityStates', JSON.stringify(this._states));
}

// Méthode pour restaurer l'état depuis le localStorage
restoreState(key: string) {
  const storedStatesStr = localStorage.getItem('visibilityStates');
  if (storedStatesStr) {
    const storedStates = JSON.parse(storedStatesStr);
    const state = storedStates[key];
    if (state) {
      this.appointmentForm  = state.appointmentForm;
      this.displayPlanning = state.displayPlanning;
      this.managerUsersBloc = state.managerUsersBloc;
      this.displayDivBadageUsersInvalidate = state.displayDivBadageUsersInvalidate;
      this.displayDivBadageUsersValidate = state.displayDivBadageUsersValidate;
      this.managerJoblistingsBloc = state.managerJoblistingsBloc;
      this.displayDivBadageJobsValidate = state.displayDivBadageJobsValidate;
      this.displayDivBadageJobsInvalidate = state.displayDivBadageJobsInvalidate;
      this.isVisibleManageUserListDiv = state.isVisibleManageUserListDiv;
      this.isbtnAccountValided = state.isbtnAccountValided;
      this.isbtnAccountInvalided = state.isbtnAccountInvalided;
      this.isVisibleManageJobListDiv = state.isVisibleManageJobListDiv;
      this.isbtSortAllJobListingInvalidate = state.isbtSortAllJobListingInvalidate;
      this.isbtSortValidedJobListing = state.isbtSortValidedJobListing;
      this.isbtSortAppoint = state.isbtSortAppoint;
      this.isbtSortAllJobListing = state.isbtSortAllJobListing;
      this.isbtSortJobApply = state.isbtSortJobApply;
      this.isMySavedJobListing = state.isMySavedJobListing;
      this.isJobApplicationtableVisible = state.isJobApplicationtableVisible;
      this.isApplicationBloc = state.isApplicationBloc;
      this.isBtnAppoint = state.isBtnAppoint;
      this.displayAppointment = state.displayAppointment;
      this.displayAllAppointment = state.displayAllAppointment;
      this.displayCalendar = state.displayCalendar;
      this.isbtSortHistorique = state.isbtSortHistorique;
      this.displayMyAppointment = state.displayMyAppointment;
    }
  }
}


  getCleanUrl(): string {
    const urlTree = this.router.parseUrl(this.router.url);
    // Réinitialise les queryParams pour qu'ils soient vides
    urlTree.queryParams = {}; // Supprime tous les queryParams
    return urlTree.toString();
  }
}
