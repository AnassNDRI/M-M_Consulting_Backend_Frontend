export const ErrorMessages = {

  NO_HISTORIQUES: 'NoHistoriques', // Aucun historique présent dans la base de données,
  NO_HISTORIQUES_BY_KEYWORD: 'NoHistoriquesByKeyword', // Aucun historique correspondant à votre recherche dans la base de données,
  UNAUTHORIZED_CONSULTANT: 'UnauthorizedConsultant', // Seul un Consultant peut programmer un Rendez-Vous,
  NO_HISTORIQUES_BY_DATE_RANGE: 'NoHistoriquesByDateRange', // Aucun historique correspondant à votre intervalle de dates,
  JOB_CLOSED: 'JobClosed', // Impossible de donner un Rendez-Vous : Cette offre d'emploi est déjà clôturée,
  TIME_SLOT_CONFLICT: 'TimeSlotConflict', // Vous avez déjà un Rendez-vous pour ce créneau horaire,
  INVALID_FILTER: 'InvalidFilter', // Filtre non valide. Choisissez entre 'day', 'week', 'month', ou 'all',
  NOT_CONSULTANT: 'NotConsultant', // Cet utilisateur n'est pas un Consultant,
  NO_APPOINTMENTS: 'NoAppointments', // Vous n'avez aucun rendez-vous pour la période sélectionnée,
  NO_PAST_APPOINTMENTS: 'NoPastAppointments', // Aucun rendez-vous passé trouvé,
  NO_FUTURE_APPOINTMENTS: 'NoFutureAppointments', // Aucun rendez-vous futur trouvé,
  INVALID_CANDIDATE: 'InvalidCandidate', // Cet utilisateur n'est pas un Candidat,
  NOT_FOUND_APPOINTMENT: 'NotFoundAppointment', // Rendez-vous non trouvé,
  APPOINTMENT_EXISTS: 'AppointmentExists', // Impossible : Vous avez déjà Rendez-Vous le {appointment},
  UNIQUE_APPOINTMENT_EXISTS: 'UniqueAppointmentExists', // Vous avez déjà Rendez-Vous pour cette candidature le {appointment},
  APPOINTMENT_WITH_OTHER_CONSULTANT_EXISTS_1: 'AppointmentWithOtherConsultantExists_1', // Il existe un rendez-vous avec {consultantName} pour cette candidature le {appointmentDateTime},
  APPOINTMENT_WITH_OTHER_CONSULTANT_EXISTS_2: 'AppointmentWithOtherConsultantExists_2', // Il existe un rendez-vous avec {consultantName} pour cette candidature le {appointmentDateTime},
  NO_SLOTS_UNTIL_LAST_APPOINTMENT: 'NoSlotsUntilLastAppointment', // Vous n'avez aucun créneau horaire libre jusqu'à votre dernier RDV,
  INVALID_DATE: 'InvalidDate', // La date de début ne peut pas être une date passée,
  WEEKEND_DATE: 'WeekendDate', // La date choisie tombe un week-end et n'est pas disponible pour les rendez-vous,
  TIME_SLOT_NOT_FOUND: 'TimeSlotNotFound', // Ce créneau horaire n'existe pas,
  UNAUTHORIZED_CANCEL: 'UnauthorizedCancel', // Action Impossible : Seul le Consultant ou le Candidat associé au Rendez-vous peuvent l'annuler,
  CANDIDATE_NOT_FOUND: 'CandidateNotFound', // Votre Rendez-vous est introuvable, Il se peut que l'offre soit clôturée,
  NO_APPOINTMENTS_CANDIDATE: 'NoAppointmentsCandidate', // Vous n'avez aucun Rendez-vous prévu,
  CONFLICT_UPDATE: 'ConflictUpdate', // Vous avez déjà un Rendez-vous pour ce créneau horaire ou Vous avez soumis les mêmes informations,



  UNAUTHORIZED_CREATE_ADMIN_CONSULTANT: 'UnauthorizedCreateAdminConsultant', // Seuls les administrateurs peuvent créer des Administrateurs ou Consultants,
  USER_UNDERAGE: 'UserUnderage', // L'utilisateur doit avoir au moins 18 ans,
  INVALID_SEX: 'INVALID_SEX', // Le sexe doit être 'M' ou 'F',
  INVALID_PHONE_NUMBER: 'InvalidPhoneNumber', // Format de numéro de téléphone valide : (+32, +352, +39, +33, +41, +49, +31) suivi d'un espace et de 9 à 11 chiffres,
  INVALID_PASSWORD: 'InvalidPassword', // Doit contenir au moins : 1 lettre majuscule, 1 caractère spécial, 1 chiffre,
  INVALID_ROLE: 'InvalidRole', // Seuls les rôles Administrator ou Consultant, External peuvent être attribués,
  INVALID_FILE_FORMAT: 'InvalidFileFormat', // Le fichier doit être au format PDF,
  FILE_TOO_LARGE: 'FileTooLarge', // Le fichier doit être inférieur à 5MB,
  INVALID_COMPANY_DESCRIPTION_LENGTH: 'InvalidCompanyDescriptionLength', // La description de  votre entreprise doit être entre 10 et 2000 caractères,
  INVALID_LOGIN: 'InvalidLogin', // Le mot de passe ne correspond pas,
  USER_INACTIVE: 'UserInactive', // Compte utilisateur non activé,



  INVALID_REFRESH_TOKEN: 'InvalidRefreshToken', // Token de rafraîchissement invalide.
  LOGOUT_ERROR: 'LogoutError', // Une erreur est survenue lors de la déconnexion. Veuillez réessayer.
  EMAIL_NOT_FOUND: 'EmailNotFound', // Utilisateur avec cet email introuvable.
  INVALID_RESET_CODE: 'InvalidResetCode', // Votre code de validation a expiré ou est invalide.
  EMAIL_CONFIRMATION_EXPIRED: 'EmailConfirmationExpired', // Token expiré.
  EMAIL_CONFIRMATION_INVALID: 'EmailConfirmationInvalid',  //Le lien de confirmation d'email est invalide ou a expiré. Veuillez reprendre votre inscription.
  
 ADMIN_ROLE_FOUND: 'AdminFound', // "Rôle administrateur introuvable.",
  CONSULTANT_PERMISSION_DENIED: 'ConsultantPermissionDenied', // Seuls les Candidats et Recruteurs peuvent être modifiés par un Consultant.
  ACCOUNT_ALREADY_VERIFIED: 'AccountAlreadyVerified', // Enregistrement déjà vérifié et un email a été envoyé à l'utilisateur.
  INSUFFICIENT_PERMISSION: 'InsufficientPermission', // En tant que consultant, vous ne pouvez pas supprimer un administrateur ou un autre consultant.
  CANNOT_SELF_DELETE: 'CannotSelfDelete', // Vous ne pouvez pas vous supprimer vous-même, Passez par votre profil.

  ONLY_ADMIN_CAN_DELETE: 'onAdminCanDelete', // Seul un administrateur peut supprimer votre compte.
  NO_USER_FOUND: 'UserNotFound',//Aucun utilisateur trouvé.

  ADMIN_LIMIT_REACHED: 'AdminLimitReached', // Le nombre maximum d'administrateurs est atteint. Il ne peut y avoir que 3 administrateurs.
  ADMIN_OR_CONSULTANT_ONLY: 'AdminOrConsultantOnly', // Seuls les rôles Administrateur et Consultant peuvent être modifiés ici.
  ADMIN_OR_CONSULTANT_ROLE_ONLY: 'AdminOrConsultantRoleOnly', // Vous ne pouvez attribuer que les rôles 'Administrateur' ou 'Consultant'.
  UNVERIFIED_EMAIL: 'UnverifiedEmail', // Cet utilisateur n'a pas encore confirmé son adresse mail.
  SELF_MODIFICATION_NOT_ALLOWED: 'SelfModificationNotAllowed', // Vous ne pouvez pas modifier vos informations ici, passez par votre profil.
  CANDIDATE_ROLE_ONLY: 'CandidateRoleOnly', // Seuls les Candidats et Recruteurs peuvent être modifiés par un Consultant.
  INVALID_TVA_NUMBER: 'InvalidTvaNumber', // Format de numéro de TVA valide : Belgique (BE) suivi de 10 chiffres; France (FR) suivi de 2 lettres et 9 chiffres; Italie (IT) suivi de 11 chiffres; Luxembourg (LU) suivi de 8 chiffres; Pays-Bas (NL) suivi de 9 chiffres, B, et 2 chiffres; Allemagne (DE) suivi de 9 chiffres; Suisse (CHE) suivi de 3 blocs de 3 chiffres séparés par des points et suivi de ' TVA'.
  EMAIL_INVALID: 'EmailInvalid', // Votre email n'est pas valide.
  EMAIL_TOO_LONG: 'EmailTooLong', // Votre email est excessivement long, pas plus de 100 caractères.
  PHONE_INVALID: 'PhoneInvalid', // Format de numéro de téléphone valide : (+32, +352, +39, +33, +41, +49, +31) suivi d'un espace et de 9 à 11 chiffres.
  PASSWORD_TOO_LONG: 'PasswordTooLong', // Votre mot de passe est excessivement long, pas plus de 100 caractères.
 COMPANY_NAME_LONG: 'companyNameLong', // Veuillez entrer un texte de moins de 250 caractères.
 USER_NOT_CV: 'userNotCV', // Cet utilisateur n'a pas de CV..
 NO_CV: 'noCV', // Aucun fichier CV fourni.
 ONLY_ADMIN:'OnlyAdmin',  // "Vous êtes le seul Administrateur, Vous ne pouvez pas supprimer votre compte.",
 ALREADY_EXIST: 'AlreadyExist', //Cet utilisateur existe déjà


  UNAUTHORIZED_CANDIDATE: 'unauthorized-candidate', // Seuls les candidats peuvent postuler aux offres d'emploi.
  UNVALIDATED_JOB_LISTING: 'unvalidated-job-listing', // Erreur cette offre emploi n'est pas encore validée par l'équipe.
  DUPLICATE_APPLICATION: 'duplicate-application', // Vous avez déjà postulé à cette offre.
  NO_APPLICATIONS_FOUND: 'no-applications-found', // Aucune postulation dans la base de donnée.
  NO_POSITIVE_INTERVIEWS: 'no-positive-interviews', // Aucun entretien positif dans la base de donnée.
  NO_APPLICATIONS_FOR_USER: 'no-applications-for-user', // Aucune candidature trouvée pour ce Candidat.
  NO_APPLICATIONS_FOR_LISTING: 'no-applications-for-listing', // Aucune candidature trouvée pour cette offre d'emploi.
  UNAUTHORIZED_VIEW_APPLICATIONS: 'unauthorized-view-applications', // Vous n'êtes pas autorisé à voir les candidatures de cette offre d'emploi.
  UNAUTHORIZED_ACCESS: 'unauthorized-access', // Vous n'êtes pas autorisé.
  UNAUTHORIZED_DELETE: 'unauthorized-delete', // Seul un consultant, un administrateur ou l'utilisateur associé à la postulation peut la supprimer.
  UNAUTHORIZED_DELETE_CANDIDATE: 'unauthorized-delete-candidate', // Vous n'êtes pas autorisé à supprimer cette candidature.
  NOT_FOUND_APPLICATION: 'not-found-application', // Postulation introuvable.
  ALREADY_SCHEDULED_INTERVIEW: 'already-scheduled-interview', // Ce candidat est déjà prévu en entretien avec <strong>{consultantName}</strong> pour l'offre <strong>{jobTitle}</strong> de la société : <strong>{companyName}</strong>.<br> Veuillez attendre la clôture de l'offre.
  CANDIDATE_LIMIT_REACHED: 'candidate-limit-reached', // Le nombre <strong>({maxCandidates})</strong> de candidats à retenir, demandé par le client est atteint.<br> Veuillez clôturer cette offre !
  APPLICATION_STATUS_SAME: 'application-status-same', // Statut déjà modifié et un email a également été envoyé au candidat.
  NO_INTERVIEW_NOTIFICATION: 'no-interview-notification', // Ce candidat n'a pas encore reçu le mail de notification pour sa candidature.
  MISSING_INTERVIEW_NOTE: 'missing-interview-note', // Veuillez ajouter au profil du candidat une note d'information de cet entretien pour le recrutement.
  NOTE_ALREADY_EXISTS: 'note-already-exists', // Cet Utilisateur n'est pas candidat et/ou impossible d'ajouter une note.
  RECRUITMENT_LIMIT_REACHED: 'recruitment-limit-reached', // Le nombre de candidats à recruter est atteint. Veuillez clôturer l'offre.
  NO_JOB_LISTINGS_SAVED:   'no-job-listings-saved', // Vous n'avez aucune offre d'emploi sauvegardée.



  UNAUTHORIZED_RECRUITER: 'unauthorized-recruiter', // Seul le recruteur et avec son compte peut créer des annonces d'emploi.
  CONFLICT_JOB_LISTING: 'conflict-job-listing', // Vous avez déjà publié une offre pour ce poste. Veuillez modifier l'offre existante ou créer une nouvelle offre pour un autre poste.
  NOT_FOUND_USER_RECRUITER: 'not-found-user-recruiter', // Cet Utilisateur n'est pas un Recruteur.
  USER_NOT_RECRUITER: 'user-not-recruiter', // Cet utilisateur n'est pas un recruteur.
  COMPANY_NAME_NOT_FOUND: 'company-name-not-found', // Nom de la compagnie introuvable.
  JOB_LOCATION_NOT_FOUND: 'job-location-not-found', // La localisation spécifiée introuvable.
  UNAUTHORIZED_VIEW_DETAILS: 'unauthorized-view-details', // Seul un recruteur ou l'utilisateur propriétaire de l'offre peut voir les détails.
  NO_JOB_LISTINGS_FOUND: 'no-job-listings-found', // Aucun emploi correspondant trouvé.
  RECRUITER_HAS_NO_JOBS: 'recruiter-has-no-jobs', // Ce recruteur n'a aucune offre d'emploi publiée.
  NO_INACTIVE_JOBS: 'no-inactive-jobs', // Aucun emploi inactif présent dans la base de données.
  NO_JOBS_TO_VALIDATE: 'no-jobs-to-validate', // Aucun emploi à valider présent dans la base de données.
  NO_JOBS_WITH_DEADLINE_TODAY: 'no-jobs-with-deadline-today', // Aucun emploi dont la date limite de postulation est aujourd'hui présent dans la base de données.
  NO_JOBS_WITH_EXPIRED_DEADLINE: 'no-jobs-with-expired-deadline', // Aucun emploi dont la date limite de postulation est dépassée.
  UNAUTHORIZED_UPDATE_JOB: 'unauthorized-update-job', // Vous n'êtes pas autorisé à modifier cette annonce d'emploi.
  JOB_TITLE_ALREADY_EXISTS: 'job-title-already-exists', // Vous avez déjà publié une offre pour ce poste. Veuillez modifier l'offre existante ou créer une nouvelle offre pour un autre poste.
  JOB_LISTING_ALREADY_VALIDATED: 'job-listing-already-validated', // Cette offre d'emploi est déjà traitée et un email a été envoyé au Recruteur.
  INVALID_VALIDATION_NOTE_LENGTH: 'invalid-validation-note-length', // Donner une explication entre 20 et 1000 caractères sur le refus de valider cette publication d'emploi.
  JOB_LISTING_NOT_FOUND: 'job-listing-not-found', // Offre d'emploi introuvable.
  JOB_TITLE_NOT_FOUND: 'job-title-not-found', // La fonction spécifiée introuvable.
  CONTRACT_TYPE_NOT_FOUND: 'contract-type-not-found', // Le type de contrat spécifié introuvable.
  JOB_LISTING_ALREADY_TREATED: 'job-listing-already-treated', // Cette offre d'emploi est déjà traitée et un email a été envoyé au Recruteur.
  MAX_CANDIDATES_NOT_REACHED: 'max-candidates-not-reached', // Impossible de clôturer l'offre. Le nombre de candidats à recruter n'est pas encore atteint.
  FUTURE_APPOINTMENTS_EXIST: 'future-appointments-exist', // Veuillez annuler tous les rendez-vous prévus pour cette offre avant de continuer.
  START_DATE_IN_PAST: 'start-date-in-past', // La date de début de contrat ne peut pas être une date passée. Veuillez modifier avant de continuer.
  NOTE_MUST_2500_CHARS: 'note-must-be-less-than-1500-characters-long', // "La note doit contenir entre 10 et 2500 caractères.",
  DEADLINE_IN_PAST: 'deadline-in-past', // La date limite de candidature ne peut pas être une date passée. Veuillez modifier avant de continuer.
  UNAUTHORIZED_DELETE_JOB: 'unauthorized-delete-job', // Seul un recruteur ou l'utilisateur propriétaire de l'offre peut la supprimer.
  INVALID_JSON_FIELDS: 'invalid-json-fields', // Les champs 'responsibilities', 'requiredQualifications', et 'benefits' doivent être des tableaux JSON valides.
  INVALID_WORKING_HOURS: 'invalid-working-hours', // Heure de travail semaine doit être comprise entre 1 et 40. Veuillez modifier avant de continuer.
  INVALID_NUMBER_OF_CANDIDATES: 'invalid-number-of-candidates', // Le nombre de Candidat doit être compris entre 1 et 10. Veuillez modifier avant de continuer.
  INVALID_DESCRIPTION_LENGTH: 'invalid-description-length', // La description de l'offre d'emploi doit être entre 50 et 2000 caractères. Veuillez modifier avant de continuer.
  INVALID_TIME_FORMAT_START: 'invalid-time-format-start', // L'heure de début doit être au format «HH:MM». Veuillez modifier avant de continuer.
  INVALID_TIME_FORMAT_END: 'invalid-time-format-end', // L'heure de fin doit être au format «HH:MM». Veuillez modifier avant de continuer.
  NEGATIVE_SALARY: 'negative-salary', // Le salaire ne peut pas être négatif. Veuillez modifier avant de continuer.


  UNAUTHORIZED_ROLE: 'UnauthorizedRole', // Seul un Consultant ou un Candididat peuvent sauvegarder un emploi.
  JOB_NOT_VALIDATED: 'JobNotValidated', // Impossible de sauvegarder: Cette offre d'emploi n'est pas encore validée par l'équipe.
  NOT_SAVE_JOB_CLOSED: 'NotSaveJobClosed', // Impossible de sauvegarder: Cette offre d'emploi est déjà cloturée.
  JOB_ALREADY_SAVED: 'JobAlreadySaved', // Vous avez déjà sauvé cet emploi.
  SAVE_JOB_NOT_FOUND: 'SaveJobNotFound', // Sauvegarde non trouvée.
  JOB_ALREADY_ASSIGNED: 'JobAlreadyAssigned', // Impossible de sauvegarder: Le suivi de cette offre est déjà assuré par un consultant.
  UNAUTHORIZED_VIEW: 'UnauthorizedView', // Seul un Consultant ou un Administrateur peut voir cette liste.
  UNAUTHORIZED_USER: 'UnauthorizedUser', // Cet utilisateur n'est pas un Consultant.
  UNAUTHORIZED_DELETION: 'UnauthorizedDeletion', // Vous n'êtes pas autorisé à supprimer cette sauvegarde.


  UNAUTHORIZED_USER_OR_ROLE: 'UnauthorizedUser', // Utilisateur non autorisé ou rôle introuvable.
  ACCESS_DENIED: 'AccessDenied', // Accès refusé : Vous devez être un Administrateur.
  ACCESS_RECRUITER: 'AccessRecruiter', // Accès refusé : Vous devez être un recruteur.
  ADMIN_OR_CONSULTANT_OR_RECRUITER_REQUIRED: 'AdminOrConsultantOrRecruiterRequired', // Accès refusé : Vous devez être un Administrateur ou Consultant ou Recruteur
  ACCESS_DENIED_CANDIDATE: 'AccessDeniedCandidate', // 'Accès refusé : Vous devez être un Candidat'
  ADMIN_OR_CONSULTANT_OR_REQUIRED: 'AdminOrConsultantRequired', //'accès refusé : vous devez être un consultant ou administrator'
  ADMIN_OR_CONSULTANT_ORCANDIDATE_REQUIRED: 'AdminOrConsultantOrCandidateRequired',
  UNAUTHORIZED: 'Unauthorized', // Non autorisé - Vous n'êtes pas connecté
  INVALID_TOKEN: 'InvalidToken', // Non autorisé - Le jeton n'est plus valide
  TOKEN_VERSION_MISMATCH: 'TokenVersionMismatch' // Non autorisé - Version du jeton incompatible. Le jeton n'est plus valide
};


