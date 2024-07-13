export enum ApiUriEnum {
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   USERS  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   CREATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // Création d'un utilisateur par un administrateur
  USER_REGISTER_BY_ADMIN = 'users/register-by-admin',
  // Inscription d'un candidat avec CV
  USER_REGISTER_CANDIDATE = 'users/register-candidate',
  // Inscription d'un recruteur
  USER_REGISTER_RECRUITER = 'users/register-recruiter',
  // Connexion d'un utilisateur
  USER_SIGNIN = 'users/signin',
  // Déconnexion d'un utilisateur
  USER_LOGOUT = 'users/logout',
  // Demande de réinitialisation du mot de passe
  USER_RESET_PASSWORD = 'users/reset-password',
  // Confirmation de réinitialisation du mot de passe
  USER_RESET_PASSWORD_CONFIRMATION = 'users/reset-password-confirmation',
  // Pour rafraîchissement du token
  REFRESH_TOKEN = 'users/refreshToken',

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   READ  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  COLLABORATORS_LIST = 'users/collaborators',
  // // All users with account inactive
  ALL_INACTIVE_USERS = 'users/all-inactive-users',

  // All users with account active
  ALL_ACTIVE_USERS = 'users/all-active-users',

  // Confirmation de l'adresse email
  ALL_USERS = 'users/all-users',

  // Confirmation de l'adresse email
  CONFIRM_EMAIL = 'users/confirm-email',
  // Détails du profil utilisateur
  USER_PROFILE_DETAILS = 'users/me',
  USER_PROFILE = 'users/user-profile/:userId',
  // Obtention du CV d'un candidat par admin, consultant, recruteur
  GET_CV = 'users/candidates-cv/:userId',
  // Obtention de son propre CV par un candidat
  GET_MY_CV = 'users/me/cv',

  // Liste des utilisateurs actifs
  USERS_ACTIVE_LIST_ROLE_ID = 'users/users-active-by-role/:roleId',
  // Liste des utilisateurs inactivés
  USERS_INACTIVATED_LIST_ROLE_ID = 'users/users-inactive-by-role/:roleId',

  // Détails de l'utilisateur par un administrateur
  USER_DETAILS_BY_ADMIN = 'users/user-details-by-admin/:userId',
  // Détails de l'utilisateur par un consultant
  USER_DETAILS_BY_CONSULTANT = 'users/user-details-by-consultant/:userId',
  // Liste des employés actifs
  EMPLOYEES_ACTIVE_LIST = 'users/emplyees-active-list',
  // Liste des employés inactivés
  EMPLOYEES_INACTIVATED_LIST = 'users/emplyees-inactivated',
  // Liste des comptes employés avec email non vérifié
  EMPLOYEE_MAIL_UNVERIFIED = 'users/employee-mail-unverifed',
  // Comptes avec token de confirmation d'email expiré
  ACCOUNT_CONFIRM_MAIL_TOKEN_EXPIRED = 'users/account-confirm-mail-token-expired',
  // Liste des utilisateurs recruteurs et candidats avec email non vérifié
  USERS_MAIL_UNVERIFIED = 'users/users-mail-unverified',

  // Recherche d'utilisateurs par mot-clé
  SEARCH_USERS = 'users/search',

  SEARCH_USERS_BY_ADMIN = 'users/search',
  SEARCH_USERS_VALIDATE_BY_ADMIN = 'users/search-users-validate',
  SEARCH_USERS_INVALIDATE_BY_ADMIN = 'users/search-users-invalidate',

  // Liste de tous les administrateurs
  ALL_ADMINISTRATORS = 'users/administrators',
  // Liste de tous les consultants
  ALL_CONSULTANTS = 'users/consultants',
  // Liste de tous les recruteurs
  ALL_RECRUITERS = 'users/recruiters',
  ALL_COMPANY = 'users/company',
  // Liste de tous les candidats
  ALL_CANDIDATES = 'users/candidates',


  ALL_TIME_SLOTS = 'time-slot/timeSlots',
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   UPDATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // Mise à jour des notifications par email
  UPDATE_NOTIFICATION = 'users/update-notification',
  // Mise à jour du profil candidat
  UPDATE_PROFILE_CANDIDATE = 'users/update-profile-candidate',
 // Update Interview note
  UPDATE_CANDIDATE_INTERVIEW_NOTE= 'users/update-interview-note/:userId',
  // Mise à jour du profil recruteur
  UPDATE_PROFILE_RECRUITER = 'users/update-profile-recruiter',
  // Mise à jour du profil consultant
  UPDATE_PROFILE_CONSULTANT = 'users/update-profile-consultant',
  // Mise à jour du profil administrateur
  UPDATE_PROFILE_EMPLOYEE = 'users/update-profile-employee',
  // Mise à jour de l'utilisateur par le consultant
  UPDATE_USER_BY_CONSULTANT = 'users/update-user-by-admin/:userId',
  // Mise à jour de l'employé par l'administrateur
  UPDATE_EMPLOYEE_BY_ADMIN = 'users/update-admin/:userId',
  // Mise à jour du CV de l'utilisateur
  UPDATE_USER_CV = 'users/update-cv',
  // Validation des utilisateurs après inscription
  VALIDATE_USER = 'users/validate/:userId',


  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   DELETE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // Suppression de l'utilisateur par l'administrateur
  DELETE_USER_BY_ADMIN = 'users/delete-account/:userId',
  // Suppression du profil
  DELETE_PROFILE = 'users/delete-profile',
  // Suppression de tous les comptes inactivés avec token de confirmation expiré
  DELETE_ACCOUNT_CONFIRM_MAIL_TOKEN_EXPIRED = 'users/delete-account-confirm-mail-token-expired',

  // Lists
  JOBTITLE_LIST = 'jobtitle/jobtitles',

  EXPERIENCES_LIST = 'experience/experiences',
  JOBLOCATION_LIST = 'joblocation/jobLocations',
  CONTRATTYPE_LIST = 'contracttype/contractTypes',
  ROLE_LIST = 'roles/roles',

  // My All Jobs Published by Recruiter

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$ JOBS LISTING  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   CREATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // Création d'une annonce
  JOBLIST_CREATE = 'joblistings/job-publishing',

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  READ    $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // Job Listings verified List, Access by All
  JOBLIST_VERIFIED = 'joblistings/joblists-verified',

  // Liste de mes annonces publiées par le recruteur
  MY_JOBLIST_LIST = 'joblistings/my-jobs-published',

  // Détail d'une annonce
  // Access By Consultant
  JOBLIST_DISABLE = 'joblistings/joblists-disable',
  // Where validate is null
  JOBLIST_DISABLE_TO_VALIDATE = 'joblistings/joblists-disable-to-validate',
  // Where deadline is Now
  JOBS_DEADLINE_NOW = 'joblistings/jobs-deadline-now',
  // Where deadline expired after two week
  JOBS_DEADLINE_EXPIRED_TWO_WEEKS = 'joblistings/jobs-deadline-expired-two-weeks',
  // To Update with deadline expired after two Days
  JOBS_DEADLINE_EXPIRED_TWO_DAYS = 'joblistings/jobs-deadline-expired-two-days',

  // Chercher un emploi par un mot acces par Admin    *********************************** OK
  SEARCH_JOBLISTING_BY_ADMIN = 'joblistings/search-job-by-admin',
  // Méthode pour initialiser la recherche asynchrone d'une offre validée par mot clé ************** OK
  SEARCH_JOB_VALIDATE_FOR_CANDIDATE = 'joblistings/search-job-validate-for-candidate',

  // Méthode pour initialiser la recherche asynchrone d'une offre validée par mot clé
  SEARCH_JOB_VALIDATE_ACCESS_ADMIN = 'joblistings/search-job-validate-admin',

  // Méthode pour initialiser la recherche asynchrone d'une offre non validée par mot clé
  SEARCH_JOBLISTING_INVALIDATE = 'joblistings/search-job-invalidate',

  // Détail d'une annonce
  JOBLIST_DETAIL = 'joblistings/detail-jobListing/:jobListingId',
  // Détail de son annonce publiée, accessible par le consultant
  MY_JOBLIST_DETAIL = 'joblistings/my-job-published-detail/:jobListingId',
  // All jobs of recruiter recruiterId Access By Consultant
  RECRUITER_JOBS_PUBLISHED = 'joblistings/recruiter-jobs-published/:userId',

  // Par un Type de Contrat
  SEARCH_JOB_BY_CONTRAT = 'joblistings/search-job-by-contrat/:contractTypeId',
  // Par un Type de Contrat
  SEARCH_JOB_BY_CONTRAT_CANDIDATE = 'joblistings/search-job-by-contrat-candidate/:contractTypeId',
  // Par un Type de Contrat
  SEARCH_JOB_BY_CONTRAT_INVALIDATE = 'joblistings/search-job-by-contrat-invalidate/:contractTypeId',
  // Par un Type de Contrat
  SEARCH_JOB_BY_CONTRAT_VALIDATE = 'joblistings/search-job-by-contrat-validate/:contractTypeId',

  // Liste de mes annonces publiées par le recruteur
  SEARCH_JOB_BY_COMPANY = 'joblistings/search-job-by-company/:userId',
  // Liste de mes annonces publiées par le recruteur
  SEARCH_JOB_BY_COMPANY_CANDIDATE = 'joblistings/search-job-by-company-candidate/:userId',
  // Liste de mes annonces publiées par le recruteur
  SEARCH_JOB_BY_COMPANY_INVALIDATE = 'joblistings/search-job-by-company-invalidate/:userId',
  // Liste de mes annonces publiées par le recruteur
  SEARCH_JOB_BY_COMPANY_VALIDATE = 'joblistings/search-job-by-company-validate/:userId',

  // Par le nom d'une localité
  SEARCH_JOB_BY_LOCATION = 'joblistings/search-job-by-location/:jobLocationId',
  // Par le nom d'une localité
  SEARCH_JOB_BY_LOCATION_CANDIDATE = 'joblistings/search-job-by-location-candidate/:jobLocationId', // joblistings
  // Par le nom d'une localité
  SEARCH_JOB_BY_LOCATION_VALIDATE = 'joblistings/search-job-by-location-validate/:jobLocationId',
  // Par le nom d'une localité
  SEARCH_JOB_BY_LOCATION_INVALIDATE = 'joblistings/search-job-by-location-invalidate/:jobLocationId',

  // Par le nom d'une fonction
  SEARCH_JOB_BY_FUNCTION = 'joblistings/search-job-by-function/:jobTitleId',
  // Par le nom d'une fonction Acces Candidate
  SEARCH_JOB_BY_FUNCTION_FOR_CANDIDATE = 'joblistings/search-job-by-function-candidate/:jobTitleId',
  // Par le nom d'une fonction
  SEARCH_JOB_BY_FUNCTION_INVALIDATE = 'joblistings/search-job-by-function-invalidate/:jobTitleId',
  // Par le nom d'une fonction
  SEARCH_JOB_BY_FUNCTION_VALIDATE = 'joblistings/search-job-by-function-validate/:jobTitleId',

  // All Job Listings grouped by day, Week, Month
  ALL_JOBS_GROUPED_BY_TIME = 'joblistings/all-jobs-grouped-by-day-week-month-all/:filter',
  // All Job Listings grouped by day, Week, Month
  JOBS_GROUPED_BY_TIME_FOR_CANDIDATE = 'joblistings/jobs-grouped-by-day-week-month-all-for-candidate/:filter',
  // All Job Listings grouped by day, Week, Month
  JOBS_GROUPED_BY_TIME_VALIDATE = 'joblistings/jobs-grouped-by-day-week-month-all-validate/:filter',
  // All Job Listings grouped by day, Week, Month
  JOBS_GROUPED_BY_TIME_INVALIDATE = 'joblistings/jobs-grouped-by-day-week-month-all-invalidate/:filter',

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  BY ADMIN  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // All Job Listings List, Access by All
  JOBLIST = 'joblistings/joblists',
  // All Job Listings verified List, Access by All
  ALL_ACTIVE_JOBLIST = 'joblistings/joblists-active',
  // All Job Listings inactive List, Access by All
  ALL_INACTIVE_JOBLIST = 'joblistings/joblists-inactive',
  // Chercher un emploi par un mot par Admin
  SEARCH_JOB_IN_DESCRIPTION_BY_ADMIN = 'joblistings/search-job-in-description-by-admin',
  // Par un nom de compagnie
  SEARCH_JOB_BY_COMPANY_BY_ADMIN = 'joblistings/search-job-by-company-by-admin/:companyName',

  // Par le nom d'une localité
  SEARCH_JOB_BY_LOCATION_BY_ADMIN = 'joblistings/search-job-by-location-by-admin/:jobLocationId',

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  UPDATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // Mise à jour d'une annonce par le recruteur avant publication
  UPDATE_JOB_BEFORE_PUBLISHED = 'joblistings/update-job-befor-published/:jobListingId',
  // Mise à jour de la date limite d'une annonce après expiration
  UPDATE_JOB_DEADLINE = 'joblistings/update-job-deadline/:jobListingId',
  // Validation d'une annonce publiée par le recruiter
  VALIDATE_JOB_PUBLISHED = 'joblistings/validate-job-published/:jobListingId',
   // Fermeture d'une annonce publiée par le recruiteur.
   CLOSE_JOB_PUBLISHED = 'joblistings/close-job/:jobListingId',
  // Invalidité et suppression d'une annonce publiée par le recruiter
  INVALIDATE_DELETE_JOB_PUBLISHED = 'joblistings/invalidate-delete-job-published/:jobListingId',

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  DELETE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // Suppression d'une annonce par le consultant
  DELETE_JOB_LISTING_BY_CONSULTANT = 'joblistings/delete-joblisting/:jobListingId',
  // Suppression de mon annonce publiée
  DELETE_MY_JOB_PUBLISHED = 'joblistings/delete-my-job-published/:jobListingId',
  // Suppression des annonces dont la date limite est expirée depuis 90 jours

  /// Cron Service
  DELETE_JOBS_DEADLINE_EXPIRED_90_DAYS = 'joblistings/delete-jobs-deadline-expired-90-days',
  // Suppression des annonces à mettre à jour dont la date limite est expirée depuis deux jours
  DELETE_JOBS_DEADLINE_EXPIRED_TWO_DAYS = 'joblistings/delete-jobs-deadline-expired-two-days',

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   JOB APPLICATION  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   CREATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // Création d'une nouvelle candidature par un candidat
  CREATE_JOB_APPLICATION = 'jobapplication/create',

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  READ    $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // Récupération de toutes les candidatures (Accès par le consultant)
  GET_ALL_JOB_APPLICATIONS = 'jobapplication/list',
  // Récupération de toutes les candidatures où l'entretien est validé (Accès par le consultant)
  GET_ALL_JOB_APPLICATIONS_INTERVIEW_OK = 'jobapplication/jobAppli-list-interview-ok',
  // Récupération des candidatures par ID utilisateur (Accès par le consultant)z
  GET_JOB_APPLICATIONS_BY_CANDIDATE = 'jobapplication/jobAppli-by-candidate/:userId',
  // Récupération de toutes les candidatures par ID du recruteur (Accès par le recruteur)
  GET_ALL_JOB_APPLICATIONS_BY_RECRUITER_ID = 'jobapplication/job-applications-by-recruiter',

  GET_ALL_JOB_APPLICATIONS_FOLLOW_UP_CONSULTANT_ID = 'jobapplication/all-job-applications-follow-up-consultant',

  // Récupération des candidatures par ID d'annonce (Accès par le consultant ou recruteur)
  GET_JOB_APPLICATIONS_BY_JOB_LISTING = 'jobapplication/jobAppli-by-joblisting/:jobListingId',
  // Récupération de toutes les candidatures d'un candidat (Accès par le candidat)
  GET_ALL_MY_JOB_APPLICATIONS = 'jobapplication/my-jobapplications',
  // Détail d'une candidature (Accès par admin, consultant, recruteur, candidat)
  JOB_APPLICATION_DETAIL = 'jobapplication/jobAppli-detail/:jobApplicationId',

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  UPDATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // Mise à jour du statut d'une candidature (Accès par le consultant)
  UPDATE_JOB_APPLICATION_STATUS = 'jobapplication/update-job-Appli-status/:jobApplicationId',
  // Résultat après l'entretien d'une candidature
  RESULT_JOB_APPLICATION_INTERVIEW = 'jobapplication/update-job-Appli-interview/:jobApplicationId',
  USER_NOTE_ADD = 'jobapplication/update-interview/:jobApplicationId',

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  DELETE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // Suppression d'une candidature (Accès par le consultant)
  DELETE_JOB_APPLICATION = 'jobapplication/delete/:jobApplicationId',
  // Suppression de ma candidature (Accès par le candidat)
  DELETE_MY_JOB_APPLICATION = 'jobapplication/delete-my-jobapplications/:jobApplicationId',
  // Suppression de toutes les candidatures dont la date limite est aujourd'hui
  DELETE_ALL_JOB_APPLICATION_DEADLINE_NOW = 'jobapplication/delete-job-Appli-deadline-now',

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$ APPOINTMENT  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  CREATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // Création d'un nouveau rendez-vous
  CREATE_APPOINTMENT = 'appointment/create',

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  READ    $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // My appointment detail, Access By Candidate
  GET_MY_ALL_APPOINTMENT_CANDIDATE = 'appointment/my-appointment-candidate',

  GET_MY_ALL_APPOINTMENT_CONSULTANT = 'appointment/my-appointment-consultant', 

  SEARCH_INFO_IN_APPOINTMENT = 'appointment/search-info-in-appointment',
  SEARCH_INFO_IN_MY_APPOINTMENT = 'appointment/search-in-my-appointment',

  // My appointment detail, Access By Candidate
  GET_MY_ALL_APPOINTMENT_CANDIDATE_GROUPED_BY_TIME = 'appointment/my-future-appointments-by-day-week-month-all/:filter',
  GET_ALL_APPOINTMENT_GROUPED_BY_TIME  = 'appointment/all-future-appointments',
  // Récupération de tous les rendez-vous passés
  GET_ALL_PAST_APPOINTMENTS = 'appointment/past-appointments',
  // Récupération de tous les rendez-vous futurs
  GET_ALL_FUTURE_APPOINTMENTS = 'appointment/future-appointments',
  // Détail du rendez-vous par ID
 // GET_APPOINTMENT_DETAIL = 'appointment/appointments-detail/:appointmentId',
  // Récupération de tous les rendez-vous par ID de consultant
  GET_APPOINTMENTS_BY_CONSULTANT_ID = 'appointment/appointments-by-consultant-id/:consultantId',
  // Détail de mon rendez-vous
  GET_MY_APPOINTMENT_DETAIL = 'appointment/my-appointment-detail/:appointmentId',
  // Mon dernier rendez-vous pour connaître ma prochaine disponibilité
  GET_MY_LAST_APPOINTMENT = 'appointment/my-last-appointments',
  // Mes plages horaires disponibles depuis maintenant jusqu'à mon dernier rendez-vous
  GET_MY_AVAILABLE_TIMESLOTS_NOW_UNTIL_LAST_APPOINTMENT = 'appointment/my-available-timeslots-now-until',
  // Tous mes rendez-vous passés groupés par jour, semaine, mois
  GET_MY_ALL_PAST_APPOINTMENTS_GROUPED = 'appointment/my-past-appointments-by-day-week-month-all/:filter',
  // Tous mes rendez-vous futurs groupés par jour, semaine, mois
  GET_MY_ALL_FUTURE_APPOINTMENTS_GROUPED = 'appointment/my-future-appointments-by-day-week-month-all/:filter',
  // Détail de mon rendez-vous, accès par le candidat
  GET_CANDIDATE_APPOINTMENT_DETAIL = 'appointment/candidate-appointment',

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  UPDATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // Mise à jour d'un rendez-vous
  UPDATE_APPOINTMENT = 'appointment/update-appointment/:appointmentId',

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  DELETE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // Annulation d'un rendez-vous, accès par consultants et candidats
  CANCEL_APPOINTMENT = 'appointment/delete-my-appointment/:appointmentId',

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$ SAVE JOBS  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  CREATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // Enregistrer une offre d'emploi
  SAVE_JOB_CREATE = 'savejob/create',

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  READ    $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // Lister toutes les offres enregistrées par un Consultant
  MY_SAVE_JOB_LIST_CONSULTANT = 'savejob/my-jobsaved-consultant',

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  READ    $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // Lister toutes les offres enregistrées par un candidat
  MY_SAVE_JOB_LIST_CANDIDATE = 'savejob/my-jobsaved',

  // Lister toutes les offres enregistrées par les consultants
  SAVE_JOB_LIST_CONSULTANTS = 'savejob/list-jobsaved-by-consultants',
  // Lister toutes les offres enregistrées par les candidats
  SAVE_JOB_LIST_CANDIDATES = 'savejob/list-jobsaved-by-candidates',
  // Détails des offres enregistrées d'un candidat
  SAVE_JOB_DETAILS_CANDIDATE = 'savejob/my-jobsaved-candidate',
  // Détails des offres enregistrées d'un consultant
  // SAVE_JOB_DETAILS_CONSULTANT = 'savejob/my-jobsaved-consultant',
  // Détail d'une offre enregistrée par son ID, accessible par consultant
  SAVE_JOB_DETAIL_CONSULTANT = 'savejob/detail-jobsaved/:saveJobId',
  // Détail d'une offre enregistrée par son ID, accessible par candidat
  SAVE_JOB_DETAIL_CANDIDATE = 'savejob/my-jobsaved-detail-candidate/:userId',
  // Lister toutes les offres enregistrées liées à une annonce spécifique
  SAVE_JOB_LIST_BY_JOB_LISTING = 'savejob/jobsaved-by-joblisting/:jobListingId',
  // Rechercher toutes les offres enregistrées par ID de consultant
  SAVE_JOB_SEARCH_BY_CONSULTANT = 'savejob/jobsaved-consultant/:userId',

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  UPDATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // Assignation de tâches (suivie d'offre) à un autre consultant 
  ASSIGN_SAVE_JOB_TO_CONSULTANT = 'savejob/assign-to-consultant/:jobListingId',

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$  DELETE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // Supprimer une offre enregistrée par son ID
  SAVE_JOB_DELETE = 'savejob/delete-my-jobsaved/:saveJobId',
  // Supprimer toutes les offres enregistrées où l'annonce associée est fermée
  SAVE_JOB_DELETE_CLOSED_LISTINGS = 'savejob/delete-jobsaved-joblisting-close',

   // All 
   HISTORIQUES = 'historique/historiques',
   SEARCH_HISTORIQUES_BY_ADMIN = 'historique/search-historiques-by-keyword',
   SEARCH_HISTORIQUES_BY_DATE_RANGE = 'historique/search-historiques-by-date-range',
}
