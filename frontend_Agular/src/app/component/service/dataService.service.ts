import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  Company,
  ContractTypes,
  JobLocation,
  JobTitle,
  Roles,
} from '../../models';
import {
  CompanyData,
  ContractTypesData,
  ExperiencesData,
  JobLocationsData,
  JobTitlesData,
  RolesData,
} from '../../models/response.data';
import { OthersTablesService } from './othersTables.service';
import { Experiences } from '../../models/experience.models';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  errorMessage: string | null = null; // Pour stocker le message d'erreur

  // BehaviorSubject pour chaque type de données, initialisé avec un tableau vide.
  private jobTitlesSubject = new BehaviorSubject<JobTitlesData>({
    count: 0,
    jobTitles: [],
  });
  // Observable public pour les titres de postes, exposé pour que les composants puissent s'y abonner.
  public jobTitles$ = this.jobTitlesSubject.asObservable();


   // BehaviorSubject pour chaque type de données, initialisé avec un tableau vide.
   private experiencesSubject = new BehaviorSubject<ExperiencesData>({
    count: 0,
    experiences: [],
  });
  // Observable public pour les titres d'experience, exposé pour que les composants puissent s'y abonner.
  public experiences$ = this.experiencesSubject.asObservable();




  // Idem pour les localisations de job.
  private jobLocationsSubject = new BehaviorSubject<JobLocationsData>({
    count: 0,
    jobLocations: [],
  });
  public jobLocations$ = this.jobLocationsSubject.asObservable();



  // Idem pour les types de contrat.
  private contractTypesSubject = new BehaviorSubject<ContractTypesData>({
    count: 0,
    contractTypes: [],
  });
  public contractTypes$ = this.contractTypesSubject.asObservable();



  // Idem pour les rôles.
  private rolesSubject = new BehaviorSubject<RolesData>({
    count: 0,
    roles: [],
  });
  public roles$ = this.rolesSubject.asObservable();



  // Idem pour les rôles.
  private companySubject = new BehaviorSubject<CompanyData>({
    count: 0,
    company: [],
  });
  public company$ = this.companySubject.asObservable();






  
  constructor(
    private othersTablesService: OthersTablesService // Injectez OthersTablesService pour appeler l'API.
  ) {
    this.loadInitialData(); // Chargez les données initiales lors de l'initialisation du service.
  }

  // Méthode privée pour charger les données initiales de toutes les tables.
  private loadInitialData() {
    // Appel des méthodes privées pour charger les données.
    this.refreshJobTitles();
    this.refreshLocation();
    this.refreshContractTypes();
    this.refreshRoles();
    this.refreshExperiences();
    this.refreshCompany();
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Méthode publique pour rafraîchir la liste des titres de postes. @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  public refreshJobTitles() {
    // On appelle le service OthersTablesService pour obtenir la liste des titres de postes.
    this.othersTablesService.jobTitlesList().subscribe({
      // En cas de succès de la requête.
      next: (response) => {
        // On vérifie si la réponse contient des données.
        if (response && response.data) {
          // Extraction correcte de 'jobTitles' et 'count' de 'response.data'.
          // Assurez-vous que le backend renvoie bien ces données dans ce format.
          const { jobTitles, count } = response.data as {
            jobTitles: JobTitle[];
            count: number;
          };
          // On met à jour le BehaviorSubject avec les nouvelles données des titres de postes et le nombre total.
          this.jobTitlesSubject.next({
            count: count, // Le nombre total de titres de postes.
            jobTitles: jobTitles, // La liste des titres de postes.
          });
        }
      },
      // En cas d'erreur lors de la requête.
      error: (errorResponse) => {
        // Affiche l'erreur dans la console ou réaliser une action spécifique.
        console.error(
          'Erreur lors de la récupération des titres de postes: ',
          errorResponse
        );
      },
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Méthode publique pour rafraîchir la liste des localisations de postes. @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  public refreshLocation() {
    // Appel au service pour obtenir la liste des localisations de postes.
    this.othersTablesService.jobLocationList().subscribe({
      next: (response) => {
        if (response && response.data) {
          // Extraction des localisations de postes et du nombre total.
          const { jobLocations, count } = response.data as {
            jobLocations: JobLocation[];
            count: number;
          };
          // Mise à jour du BehaviorSubject avec les nouvelles données.
          this.jobLocationsSubject.next({
            count: count,
            jobLocations: jobLocations,
          });
        }
      },
      error: (errorResponse) => {
        console.error(
          'Erreur lors de la récupération des localisations de postes: ',
          errorResponse
        );
      },
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Méthode publique pour rafraîchir la liste des types de contrat. @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  public refreshContractTypes() {
    // Appel au service pour obtenir la liste des types de contrat.
    this.othersTablesService.contractTypeList().subscribe({
      next: (response) => {
        if (response && response.data) {
          // Extraction des types de contrat et du nombre total.
          const { contractTypes, count } = response.data as {
            contractTypes: ContractTypes[];
            count: number;
          };
          // Mise à jour du BehaviorSubject avec les nouvelles données.
          this.contractTypesSubject.next({
            count: count,
            contractTypes: contractTypes,
          });
        }
      },
      error: (errorResponse) => {
        console.error(
          'Erreur lors de la récupération des types de contrat: ',
          errorResponse
        );
      },
    });
  }

  
   // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  les job titles @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  public refreshExperiences() {
    console.log(`je rentre dans le fecth:`);
    this.othersTablesService.experiencesList().subscribe({
      // Si la réponse est reçue sans erreur.
      next: (response) => {
        console.log(`je rentre dans le nex:`);
        // On vérifie que la réponse et son contenu 'data' existent.
        if (response && response.data) {
          // Extraction des types de contrat et du nombre total.
          const { experiences, count } = response.data as {
            experiences: Experiences[];
            count: number;
          };
          // Mise à jour du BehaviorSubject avec les nouvelles données.
          this.experiencesSubject.next({
            count: count,
            experiences: experiences,
          });
        }
      },
      error: (errorResponse) => {
        console.error(
          'Erreur lors de la récupération des rôles: ',
          errorResponse
        );
      },
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Méthode publique pour rafraîchir la liste des rôles. @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  public refreshRoles() {
    // Appel au service pour obtenir la liste des rôles.
    this.othersTablesService.roleList().subscribe({
      next: (response) => {
        if (response && response.data) {
          // Extraction des rôles et du nombre total.
          const { roles, count } = response.data as {
            roles: Roles[];
            count: number;
          };
          // Mise à jour du BehaviorSubject avec les nouvelles données.
          this.rolesSubject.next({
            count: count,
            roles: roles,
          });
        }
      },
      error: (errorResponse) => {
        console.error(
          'Erreur lors de la récupération des rôles: ',
          errorResponse
        );
      },
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Méthode publique pour rafraîchir la liste des entreprise. @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  public refreshCompany() {
    // Appel au service pour obtenir la liste des rôles.
    this.othersTablesService.companyList().subscribe({
      next: (response) => {
        if (response && response.data) {
          // Extraction des rôles et du nombre total.
          const { company, count } = response.data as {
            company: Company[];
            count: number;
          };
          // Mise à jour du BehaviorSubject avec les nouvelles données.
          this.companySubject.next({
            count: count,
            company: company,
          });
        }
      },
      error: (errorResponse) => {
        console.error(
          'Erreur lors de la récupération des nom des company: ',
          errorResponse
        );
      },
    });
  }
}
