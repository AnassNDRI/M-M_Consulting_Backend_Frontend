import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  addDays,
  differenceInDays,
  endOfDay,
  format,
  isBefore,
  startOfDay,
  subDays,
} from 'date-fns';
import { MailerService } from '../mailer/mailer.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CloseJobListingDto } from './dto/closeJobListingDto';
import { CreateJobListingDto } from './dto/createJoblistingDto';
import { InvalidateToDeleteJobListingDto } from './dto/invalidateToDeleteJoblistingDto';
import { UpdateJobListingDto } from './dto/updateJoblistingDto';
import { ValidateJobListingDto } from './dto/validateJoblistingDto';
import { v4 as uuidv4 } from 'uuid';
import { ErrorMessages } from 'src/shared/error-management/errors-message';

@Injectable()
export class JoblistingService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailerService: MailerService,
    private readonly userService: UsersService,
  ) {}

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   CREATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Create Job Listing @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async createJobListing(
    createJobListingDto: CreateJobListingDto,
    recruiterId: number,
  ) {
    try {
      const recruiter =
        await this.userService.verifyUsersExistence(recruiterId);

      if (!recruiter.role || recruiter.role.title !== 'Recruiter') {
        throw new UnauthorizedException( ErrorMessages.UNAUTHORIZED_RECRUITER);
      }

      const {
        jobTitleId,
        experienceId,
        contractTypeId,
        jobLocationId,
        description,
        workingHours,
        numberOfCandidates,
        workingHoursStart,
        workingHoursEnd,
        startDate,
        salary,
        deadline,
      } = createJobListingDto;

      const {
        parsedResponsibilities,
        parsedRequiredQualifications,
        parsedBenefits,
      } = await this.validateJobListingData(createJobListingDto);

      const jobListingExists = await this.prismaService.jobListings.findFirst({
        where: {
          jobTitleId: jobTitleId,
          userId: recruiterId,
        },
      });
      if (jobListingExists) {
        throw new UnauthorizedException( ErrorMessages.CONFLICT_JOB_LISTING);
      }

      

      const deadlineExpires = addDays(new Date(deadline), 90);

      const jobListing = await this.prismaService.jobListings.create({
        data: {
          jobTitleId: jobTitleId,
          jobLocationId: jobLocationId,
          contractTypeId: contractTypeId,
          experienceId: experienceId,
          description: description,
          responsibilities: JSON.stringify(parsedResponsibilities),
          requiredQualifications: JSON.stringify(parsedRequiredQualifications),
          benefits: JSON.stringify(parsedBenefits),
          workingHours: workingHours,
          numberOfCandidates: numberOfCandidates,
          workingHoursStart: workingHoursStart,
          workingHoursEnd: workingHoursEnd,
          startDate: startDate,
          salary: salary,
          deadline: deadline,
          deadlineExpires: deadlineExpires,
          askUpdatingToRecruiter: false,
          userId: recruiterId,
        },
        select: {
          jobListingId: true,
          userId: true,
          jobTitle: {
            select: {
              title: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
/*
      await this.mailerService.sendJoblistingAwaitingConfirmation(
        jobListing.user.email,
        jobListing.user.name,
        jobListing.jobTitle.title,
      );
*/
      return {
        result: true,
        data: {
          jobListingId: jobListing.jobListingId,
          userId: jobListing.userId,
        },
        error_code: null,
        error: null,
      };
    } catch (error) {
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings verifed List @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getJobListingsActive(userId: number) {
    try {
      const now = new Date();
      // Récupération de toutes les annonces d'emploi validées dont la deadlineExpires (deadline + 15 jours) n'est pas dépassée
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          validate: true, // Filtre les annonces validées
        },
        orderBy: {
          publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          publicationDate: true,
          validate: true,
          jobClose: true,
          askUpdatingToRecruiter: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing et ajouter 'isSaved'
      const enhancedJobListings = await Promise.all(
        jobListings.map(async (jobListing) => {
          const dayAgo = differenceInDays(now, jobListing.publicationDate);

          // Vérifier si l'emploi est sauvegardé par l'utilisateur
          let isSaved = false;
          if (userId) {
            const savedJob = await this.prismaService.saveJobs.findFirst({
              where: {
                jobListingId: jobListing.jobListingId,
                userId: userId,
              },
            });
            isSaved = !!savedJob;
          }

          return { ...jobListing, dayAgo, isSaved };
        }),
      );

      // Ici on vérifie si la liste des emplois est vide
      if (enhancedJobListings.length === 0) {
        return {
          message: 'Aucun emploi actif présent dans la base de données',
        };
      }

      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings verifed List @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getJobListingsInactive() {
    try {
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          OR: [
            // validate peut etre false ou null
            { validate: false },
            { validate: null },
          ],
        },
        orderBy: {
          publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          publicationDate: true,
          validate: true,
          jobClose: true,
          askUpdatingToRecruiter: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });
      // Ici on vérifie si la liste des emplois est vide
      if (jobListings.length === 0) {
        return {
          message: 'Aucun emploi active présent dans la base de données',
        };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: jobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: jobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings verifed List @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getJobListings(userId?: number) {
    try {
      const now = new Date();
      const jobListings = await this.prismaService.jobListings.findMany({
        orderBy: {
          publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          checkJobListingByConsultant: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          publicationDate: true,
          validate: true,
          jobClose: true,
          askUpdatingToRecruiter: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });
      // Ici on vérifie si la liste des emplois est vide
      if (jobListings.length === 0) {
        return {
          message: 'Aucun emploi active présent dans la base de données',
        };
      }
      // Si un userId est fourni, on vérifie pour chaque emploi s'il a été sauvegardé par cet utilisateur
      if (userId) {
        for (const jobListing of jobListings) {
          const savedJob = await this.prismaService.saveJobs.findFirst({
            where: {
              jobListingId: jobListing.jobListingId,
              userId: userId,
            },
          });

          // Convertit l'existence d'un enregistrement en booléen
          // Enrichir les jobListings avec 'isSaved'
          jobListing['isSaved'] = !!savedJob;

          /* code explicite 
        if (savedJob !== null && savedJob !== undefined) {
          jobListing['isSaved'] = true; //nous définissons la propriété 'isSaved' de l'objet 'jobListing' à true.
        } else {
          jobListing['isSaved'] = false; //  nous définissons la propriété 'isSaved' de l'objet 'jobListing' à false.
        } */
        }
      }

      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par un nom clé  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async searchAllJoblistingsByKeyword(keyword: string) {
    try {
      const now = new Date();
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          OR: [
            { description: { contains: keyword } },
            { checkJobListingByConsultant:  { contains: keyword } },
            {
              jobTitle: {
                is: { title: { contains: keyword } },
              },
            },
            {
              experience: {
                is: { title: { contains: keyword } },
              },
            },
          ],
        },
        orderBy: {
          publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          checkJobListingByConsultant: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            select: {
              title: true,
            },
          },
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      // Ici on vérifie si la liste des emplois est vide
      if (jobListings.length === 0) {
        return {
          message: 'Aucun emploi active présent dans la base de données',
        };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher une offre valide par un nom clé  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async searchJoblistingValidateForCandidateByKeyword(keyword: string) {
    const today = new Date();
    try {
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          OR: [
            { description: { contains: keyword } },
            { checkJobListingByConsultant:  { contains: keyword } },
            { jobTitle: { title: { contains: keyword } } },
            { experience: { title: { contains: keyword } } },
         
            
          ],
          validate: true,
          jobClose: false,
        },
        orderBy: {
          publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          checkJobListingByConsultant: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          validate: true,
          jobClose: true,
          dayAgo: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            select: {
              title: true,
            },
          },
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(today, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      // Ici on vérifie si la liste des emplois est vide
      if (jobListings.length === 0) {
        return {
          message: 'Aucun emploi  présent dans la base de données',
        };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher une offre valide par un nom clé  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async searchJoblistingValidateByKeywordAdmin(keyword: string) {
    try {
      const now = new Date();
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          OR: [
            { description: { contains: keyword } },
            { jobTitle: { title: { contains: keyword } } },
            { experience: { title: { contains: keyword } } },
          ],
          validate: true,
        },
        orderBy: {
          publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          validate: true,
          jobClose: true,
          dayAgo: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            select: {
              title: true,
            },
          },
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      // Ici on vérifie si la liste des emplois est vide
      if (jobListings.length === 0) {
        return {
          message: 'Aucun emploi  présent dans la base de données',
        };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher une offre valide par un nom clé  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async searchJoblistingInvalidateByKeyword(keyword: string) {
    try {
      const now = new Date();
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          OR: [
            { description: { contains: keyword } },
            { jobTitle: { title: { contains: keyword } } },
            { experience: { title: { contains: keyword } } },
          ],
          AND: [
            {
              OR: [{ validate: null }, { validate: false }],
            },
          ],
        },
        orderBy: {
          publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            select: {
              title: true,
            },
          },
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      // Ici on vérifie si la liste des emplois est vide
      if (jobListings.length === 0) {
        return {
          message: 'Aucun emploi  présent dans la base de données',
        };
      }

      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par un nom de compagnie  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async findJobListingsByCompanyName(userId: number) {
    try {
      const now = new Date();
      const recruiterCompanyName = await this.prismaService.users.findFirst({
        where: {
          userId: userId,
        },
        include: {
          role: true,
        },
      });
      if (recruiterCompanyName.role.title !== 'Recruiter') {
     
        throw new UnauthorizedException( ErrorMessages.USER_NOT_RECRUITER);
      }
      if (!recruiterCompanyName) {
        throw new NotFoundException(ErrorMessages.COMPANY_NAME_NOT_FOUND);
      }

      // Récupération de toutes les annonces d'emploi publiées par l'utilisateur
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          userId: userId,
          user: {
            role: {
              title: 'Recruiter',
            },
          },
        },
        orderBy: {
          publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        data: enhancedJobListings, // Directement le tableau des jobListings
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par un nom de compagnie  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async findJobListingsByCompanyNameAccessCandidate(userId: number) {
    try {
      const now = new Date();
      const recruiterCompanyName = await this.prismaService.users.findFirst({
        where: {
          userId: userId,
        },

        include: {
          role: true,
        },
      });
      if (recruiterCompanyName.role.title !== 'Recruiter') {
     
        throw new UnauthorizedException( ErrorMessages.USER_NOT_RECRUITER);
      }
      if (!recruiterCompanyName) {
        throw new NotFoundException(ErrorMessages.COMPANY_NAME_NOT_FOUND);
      }

      // Récupération de toutes les annonces d'emploi publiées par l'utilisateur
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          userId: userId,
          user: {
            role: {
              title: 'Recruiter',
            },
          },
          validate: true,
          jobClose: false,
        },
        orderBy: {
          publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        data: enhancedJobListings, // Directement le tableau des jobListings
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par un nom de compagnie  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async findJobListingsByCompanyNameInvalidate(userId: number) {
    try {
      const now = new Date();
      const recruiterCompanyName = await this.prismaService.users.findFirst({
        where: {
          userId: userId,
        },

        include: {
          role: true,
        },
      });
      if (recruiterCompanyName.role.title !== 'Recruiter') {
        throw new UnauthorizedException( ErrorMessages.USER_NOT_RECRUITER);
      }
      if (!recruiterCompanyName) {
        throw new NotFoundException(ErrorMessages.COMPANY_NAME_NOT_FOUND);
      }

      // Récupération de toutes les annonces d'emploi publiées par l'utilisateur
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          userId: userId,
          user: {
            role: {
              title: 'Recruiter',
            },
          },
          jobClose: false,
          AND: [
            {
              OR: [{ validate: null }, { validate: false }],
            },
          ],
        },
        orderBy: {
          publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        data: enhancedJobListings, // Directement le tableau des jobListings
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par un nom de compagnie  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async findJobListingsByCompanyNameValidate(userId: number) {
    try {
      const now = new Date();
      const recruiterCompanyName = await this.prismaService.users.findFirst({
        where: {
          userId: userId,
        },

        include: {
          role: true,
        },
      });
      if (recruiterCompanyName.role.title !== 'Recruiter') {
        throw new UnauthorizedException( ErrorMessages.USER_NOT_RECRUITER);
      }
      if (!recruiterCompanyName) {
        throw new NotFoundException(ErrorMessages.COMPANY_NAME_NOT_FOUND);
      }

      // Récupération de toutes les annonces d'emploi publiées par l'utilisateur
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          userId: userId,
          user: {
            role: {
              title: 'Recruiter',
            },
          },
          validate: true,
        },
        orderBy: {
          publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });
      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        data: enhancedJobListings,
        count: enhancedJobListings.length,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par un Type de Contrat  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async findJobListingsByContractTypeByAdmin(contractTypeId: number) {
    try {
      const now = new Date();
      const theContrat = await this.verifyContractTypeExistence(contractTypeId);

      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          contractTypeId: theContrat.contractTypeId,
        },
        orderBy: {
          createdAt: 'desc', // Tri par date de création, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par un Type de Contrat  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async findJobListingsByContractTypeAccessCandidate(contractTypeId: number) {
    try {
      const now = new Date();
      const theContrat = await this.verifyContractTypeExistence(contractTypeId);

      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          contractTypeId: theContrat.contractTypeId,
          validate: true,
          jobClose: false,
        },
        orderBy: {
          publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par un Type de Contrat  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async findJobListingsByContractTypeValidate(contractTypeId: number) {
    try {
      const now = new Date();
      const theContrat = await this.verifyContractTypeExistence(contractTypeId);

      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          contractTypeId: theContrat.contractTypeId,
          validate: true,
        },
        orderBy: {
          createdAt: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par un Type de Contrat  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async findJobListingsByContractTypeInvalidate(contractTypeId: number) {
    try {
      const now = new Date();
      const theContrat = await this.verifyContractTypeExistence(contractTypeId);
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          contractTypeId: theContrat.contractTypeId,
          jobClose: false,
          AND: [
            {
              OR: [{ validate: null }, { validate: false }],
            },
          ],
        },
        orderBy: {
          publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par le nom d'une localité  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async findJobListingsByJobLocation(jobLocationId: number) {
    try {
      const now = new Date();
      const theLocation = await this.verifyjobLocationExistence(jobLocationId);

      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          jobLocationId: theLocation.jobLocationId,
        },
        orderBy: {
          publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par le nom d'une localité  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async findJobListingsByJobLocationAccessCandidate(jobLocationId: number) {
    try {
      const now = new Date();
      const theLocation = await this.verifyjobLocationExistence(jobLocationId);

      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          jobLocationId: theLocation.jobLocationId,
          validate: true,
          jobClose: false,
        },
        orderBy: {
          publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par le nom d'une localité  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async findJobListingsValidateByJobLocation(jobLocationId: number) {
    try {
      const now = new Date();
      const theLocation = await this.verifyjobLocationExistence(jobLocationId);

      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          jobLocationId: theLocation.jobLocationId,
          validate: true,
        },
        orderBy: {
          publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par le nom d'une localité  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async findJobListingsInvalidateByJobLocation(jobLocationId: number) {
    try {
      const now = new Date();
      const theLocation = await this.verifyjobLocationExistence(jobLocationId);

      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          jobLocationId: theLocation.jobLocationId,
          jobClose: false,
          AND: [
            {
              OR: [{ validate: null }, { validate: false }],
            },
          ],
        },
        orderBy: {
          publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par le nom d'une fonction   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async findJobListingsByJobTitle(jobTitleId: number) {
    try {
      const now = new Date();
      const thejobTitle = await this.verifyJobTitleExistence(jobTitleId);

      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          jobTitleId: thejobTitle.jobTitleId,
        },
        orderBy: {
          publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par le nom d'une fonction   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async findJobListingsByJobTitleAccessByCandidate(jobTitleId: number) {
    try {
      const now = new Date();
      const thejobTitle = await this.verifyJobTitleExistence(jobTitleId);

      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          jobTitleId: thejobTitle.jobTitleId,
          validate: true,
          jobClose: false,
        },
        orderBy: {
          publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par le nom d'une fonction   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async findJobListingsValidateByJobTitle(jobTitleId: number) {
    try {
      const now = new Date();
      const thejobTitle = await this.verifyJobTitleExistence(jobTitleId);

      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          jobTitleId: thejobTitle.jobTitleId,
          validate: true,
          jobClose: false,
        },
        orderBy: {
          publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par le nom d'une fonction   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async findJobListingsInvalidateByJobTitle(jobTitleId: number) {
    try {
      const now = new Date();
      const thejobTitle = await this.verifyJobTitleExistence(jobTitleId);

      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          jobTitleId: thejobTitle.jobTitleId,
          jobClose: false,
          AND: [
            {
              OR: [{ validate: null }, { validate: false }],
            },
          ],
        },
        orderBy: {
          publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings verifed Grouped day, week, 2weeks, month, all @@@@@@@@@@@@@@@@@
  async getAllJobListingsGroupedAccessByAdmin(
    filter: 'day' | 'week' | '2weeks' | 'month' | 'all' = 'all',
  ) {
    try {
      const now = new Date();

      let startDate;
      let endDate = endOfDay(now); // Fin de la journée actuelle pour tous les filtres sauf 'all'

      switch (filter) {
        case 'day':
          startDate = startOfDay(now); // Début de la journée actuelle
          endDate = endOfDay(now);
          break;
        case 'week':
          startDate = subDays(now, 7); // On soustrait 7 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case '2weeks':
          startDate = subDays(now, 14); // On soustrait 14 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case 'month':
          startDate = subDays(now, 30); // On soustrait 30 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case 'all':
          startDate = new Date(2022, 0, 1); // Date très ancienne pour inclure toutes les annonces depuis le début
          break;
        default:
          throw new BadRequestException(ErrorMessages.INVALID_FILTER );
      }
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          askUpdatingToRecruiter: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings verifed Grouped day, week, 2weeks, month, all @@@@@@@@@@@@@@@@@
  async getAllJobListingsValidateGroupedForCandidate(
    filter: 'day' | 'week' | '2weeks' | 'month' | 'all' = 'all',
  ) {
    try {
      const now = new Date();

      let startDate;
      let endDate = endOfDay(now); // Fin de la journée actuelle pour tous les filtres sauf 'all'

      switch (filter) {
        case 'day':
          startDate = startOfDay(now); // Début de la journée actuelle
          endDate = endOfDay(now);
          break;
        case 'week':
          startDate = subDays(now, 7); // On soustrait 7 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case '2weeks':
          startDate = subDays(now, 14); // On soustrait 14 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case 'month':
          startDate = subDays(now, 30); // On soustrait 30 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case 'all':
          startDate = new Date(2022, 0, 1); // Date très ancienne pour inclure toutes les annonces depuis le début
          break;
        default:
         
          throw new BadRequestException(ErrorMessages.INVALID_FILTER );
      }
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          validate: true, // Filtre les annonces validées
          jobClose: false,
          publicationDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          publicationDate: 'asc',
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          askUpdatingToRecruiter: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings verifed Grouped day, week, 2weeks, month, all @@@@@@@@@@@@@@@@@
  async getAllJobListingsValidateGroupedAccessByAdmin(
    filter: 'day' | 'week' | '2weeks' | 'month' | 'all' = 'all',
  ) {
    try {
      const now = new Date();

      let startDate;
      let endDate = endOfDay(now); // Fin de la journée actuelle pour tous les filtres sauf 'all'

      switch (filter) {
        case 'day':
          startDate = startOfDay(now); // Début de la journée actuelle
          endDate = endOfDay(now);
          break;
        case 'week':
          startDate = subDays(now, 7); // On soustrait 7 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case '2weeks':
          startDate = subDays(now, 14); // On soustrait 14 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case 'month':
          startDate = subDays(now, 30); // On soustrait 30 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case 'all':
          startDate = new Date(2022, 0, 1); // Date très ancienne pour inclure toutes les annonces depuis le début
          break;
        default:
          throw new BadRequestException(ErrorMessages.INVALID_FILTER );
      }
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          validate: true, // Filtre les annonces validées
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          publicationDate: 'asc',
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          askUpdatingToRecruiter: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }



  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings verifed Grouped day, week, 2weeks, month, all @@@@@@@@@@@@@@@@@
  async getAllJobListingsInvalidateGroupedAccessByAdmin(
    filter: 'day' | 'week' | '2weeks' | 'month' | 'all' = 'all',
  ) {
    try {
      const now = new Date();

      let startDate;
      let endDate = endOfDay(now); // Fin de la journée actuelle pour tous les filtres sauf 'all'

      switch (filter) {
        case 'day':
          startDate = startOfDay(now); // Début de la journée actuelle
          endDate = endOfDay(now);
          break;
        case 'week':
          startDate = subDays(now, 7); // On soustrait 7 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case '2weeks':
          startDate = subDays(now, 14); // On soustrait 14 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case 'month':
          startDate = subDays(now, 30); // On soustrait 30 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case 'all':
          startDate = new Date(2022, 0, 1); // Date très ancienne pour inclure toutes les annonces depuis le début
          break;
        default:
          throw new BadRequestException(ErrorMessages.INVALID_FILTER );
      }
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          jobClose: false,
          AND: [
            {
              OR: [{ validate: null }, { validate: false }],
            },
          ],
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          publicationDate: 'asc',
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          askUpdatingToRecruiter: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  /// °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°° STQRT BY ADMIN °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par un nom clé Par Un administrateur @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async searchByJobInDescriptionByAdmin(keyword: string) {
    try {
      const now = new Date();
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          OR: [
            { description: { contains: keyword } },
            { jobTitle: { title: { contains: keyword } } },
            { experience: { title: { contains: keyword } } },
          ],
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            select: {
              title: true,
            },
          },
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Filtrage manuel des résultats pour les tableaux
      const filteredJobListings = jobListings.filter(
        (listing) =>
          (listing.responsibilities as string[]).includes(keyword) ||
          (listing.requiredQualifications as string[]).includes(keyword) ||
          (listing.benefits as string[]).includes(keyword),
      );

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = filteredJobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par un nom de compagnie  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async findJobListingsByCompanyNameByAdmin(userId: number) {
    try {
      const now = new Date();
      const recruiterCompanyName = await this.prismaService.users.findFirst({
        where: {
          userId: userId,
        },
        include: {
          role: true,
        },
      });
      if (recruiterCompanyName.role.title !== 'Recruiter') {
        throw new UnauthorizedException( ErrorMessages.USER_NOT_RECRUITER);
      }
      if (!recruiterCompanyName) {
        throw new UnauthorizedException( ErrorMessages.COMPANY_NAME_NOT_FOUND);
      }

      // Récupération de toutes les annonces d'emploi publiées par l'utilisateur
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          userId: userId,
          user: {
            role: {
              title: 'Recruiter',
            },
          },
        },
        orderBy: {
          createdAt: 'desc', // Tri par date de création, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });
      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par le nom d'une localité  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async findJobListingsByJobLocationByAdmin(jobLocationId: number) {
    try {
      const now = new Date();
      const theLocation = await this.verifyjobLocationExistence(jobLocationId);

      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          jobLocationId: theLocation.jobLocationId,
        },
        orderBy: {
          createdAt: 'desc', // Tri par date de création, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par le nom d'une fonction   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async findJobListingsByJobTitleByAdmin(jobTitleId: number) {
    try {
      const now = new Date();
      const thejobTitle = await this.verifyJobTitleExistence(jobTitleId);

      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          jobTitleId: thejobTitle.jobTitleId,
        },
        orderBy: {
          createdAt: 'desc', // Tri par date de création, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings verifed Grouped day, week, 2weeks, month, all Acces by Candidate @@@@@@@@@@@@@@@@@
  async getAllJobListingsVerifiedGroupedByAccessByCandidate(
    filter: 'day' | 'week' | '2weeks' | 'month' | 'all' = 'all',
  ) {
    try {
      const now = new Date();

      let startDate;
      let endDate = endOfDay(now); // Fin de la journée actuelle pour tous les filtres sauf 'all'

      switch (filter) {
        case 'day':
          startDate = startOfDay(now); // Début de la journée actuelle
          endDate = endOfDay(now);
          break;
        case 'week':
          startDate = subDays(now, 7); // On soustrait 7 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case '2weeks':
          startDate = subDays(now, 14); // On soustrait 14 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case 'month':
          startDate = subDays(now, 30); // On soustrait 30 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case 'all':
          startDate = new Date(2022, 0, 1); // Date très ancienne pour inclure toutes les annonces depuis le début
          break;
        default:
          throw new BadRequestException(ErrorMessages.INVALID_FILTER );
      }
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          createdAt: 'desc', // Tri par date de création, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          askUpdatingToRecruiter: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings  Grouped day, week, 2weeks, month, all @@@@@@@@@@@@@@@@@
  async getAllJobListingsGroupedByAdmin(
    filter: 'day' | 'week' | '2weeks' | 'month' | 'all' = 'all',
  ) {
    try {
      const now = new Date();

      let startDate;
      let endDate = endOfDay(now); // Fin de la journée actuelle pour tous les filtres sauf 'all'

      switch (filter) {
        case 'day':
          startDate = startOfDay(now); // Début de la journée actuelle
          endDate = endOfDay(now);
          break;
        case 'week':
          startDate = subDays(now, 7); // On soustrait 7 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case '2weeks':
          startDate = subDays(now, 14); // On soustrait 14 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case 'month':
          startDate = subDays(now, 30); // On soustrait 30 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case 'all':
          startDate = new Date(2022, 0, 1); // Date très ancienne pour inclure toutes les annonces depuis le début
          break;
        default:
          throw new BadRequestException(ErrorMessages.INVALID_FILTER );
      }
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          createdAt: 'desc', // Tri par date de création, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          askUpdatingToRecruiter: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings validate Grouped day, week, 2weeks, month, all @@@@@@@@@@@@@@@@@
  async getAllJobListingsValidateGroupedByAdmin(
    filter: 'day' | 'week' | '2weeks' | 'month' | 'all' = 'all',
  ) {
    try {
      const now = new Date();

      let startDate;
      let endDate = endOfDay(now); // Fin de la journée actuelle pour tous les filtres sauf 'all'

      switch (filter) {
        case 'day':
          startDate = startOfDay(now); // Début de la journée actuelle
          endDate = endOfDay(now);
          break;
        case 'week':
          startDate = subDays(now, 7); // On soustrait 7 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case '2weeks':
          startDate = subDays(now, 14); // On soustrait 14 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case 'month':
          startDate = subDays(now, 30); // On soustrait 30 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case 'all':
          startDate = new Date(2022, 0, 1); // Date très ancienne pour inclure toutes les annonces depuis le début
          break;
        default:
          throw new BadRequestException(ErrorMessages.INVALID_FILTER );
      }
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          validate: true,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          createdAt: 'desc', // Tri par date de création, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          askUpdatingToRecruiter: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings Invvalidate Grouped day, week, 2weeks, month, all @@@@@@@@@@@@@@@@@
  async getAllJobListingsInvalidateGroupedByAdmin(
    filter: 'day' | 'week' | '2weeks' | 'month' | 'all' = 'all',
  ) {
    try {
      const now = new Date();

      let startDate;
      let endDate = endOfDay(now); // Fin de la journée actuelle pour tous les filtres sauf 'all'

      switch (filter) {
        case 'day':
          startDate = startOfDay(now); // Début de la journée actuelle
          endDate = endOfDay(now);
          break;
        case 'week':
          startDate = subDays(now, 7); // On soustrait 7 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case '2weeks':
          startDate = subDays(now, 14); // On soustrait 14 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case 'month':
          startDate = subDays(now, 30); // On soustrait 30 jours de la date actuelle
          endDate = now; //On  utilise la date et l'heure actuelles
          break;
        case 'all':
          startDate = new Date(2022, 0, 1); // Date très ancienne pour inclure toutes les annonces depuis le début
          break;
        default:
          throw new BadRequestException(ErrorMessages.INVALID_FILTER );
      }
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          validate: false,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          createdAt: 'desc', // Tri par date de création, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          askUpdatingToRecruiter: true,
          publicationDate: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });
      // Calculer 'dayAgo' pour chaque jobListing
      const enhancedJobListings = jobListings.map((jobListing) => {
        const dayAgo = differenceInDays(now, jobListing.publicationDate);
        return { ...jobListing, dayAgo };
      });

      if (jobListings.length === 0) {
        return { message: 'Aucun emploi correspondant trouvé' };
      }
      // On retourne la liste complète des fonctions
      return {
        result: true,
        count: enhancedJobListings.length, // Ajoutez count ici, au même niveau que 'data'
        data: enhancedJobListings, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  /// °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°° END BY ADMIN °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Job Listing Detail  By ALL Users Connected or No  @@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async jobListingDetailByAll(jobListingId: number, requestingUserId: number) {
    try {
      // On vérifie si l'offre d'emploi existe
      const checkJobListing =
        await this.verifyJobListingExistence(jobListingId);

      if (!checkJobListing.validate) {
        if (requestingUserId) {
          // On vérifie l'utilisateur demandeur
          const userResquesting =
            await this.userService.verifyUsersExistence(requestingUserId);

          // On recupère le rôle de l'utilisateur demandeur
          const userRole = await this.prismaService.roles.findUnique({
            where: { roleId: userResquesting.roleId },
          });

          // On vérifie si l'utilisateur est un consultant ou si c'est l'utilisateur qui a créé l'emploi
          if (
            userRole.title !== 'Administrator' &&
            userRole.title !== 'Consultant' &&
            checkJobListing.userId !== requestingUserId
          ) {
            throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_VIEW_DETAILS );
          }
        }
      }
      // Récupérer et retourner les détails de l'offre d'emploi
      const jobListing = await this.prismaService.jobListings.findUnique({
        where: { jobListingId: checkJobListing.jobListingId },
        select: {
          jobListingId: true,
          jobLocationId: true,
          jobTitleId: true,
          experienceId: true,
          contractTypeId: true,
          userId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          deadlineExpires: true,
          noteJoblisting: true,
          validate: true,
          askUpdatingToRecruiter: true,
          dayAgo: true,
          jobClose: true,
          publicationDate: true,
          checkJobListingByConsultant: true,
          user: {
            select: {
              userId: true,
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
              email: true,
              phoneNumber: true,
            },
          },
          jobTitle: true,
          jobLocation: true,
          contractType: true,
          experience: true,
          jobApplications: {
            // Inclure toutes les postulations liées à cette offre d'emploi
            select: {
              jobApplicationId: true,
              jobListingId: true,
              appointmentId: true,
              applicationHours: true,
              status: true,
              jobInterviewOK: true,
              interviewNote: true,
              userId: true,
              checkJobAppliByConsultant: true,
              deadlineToDelete: true,

              user: {
                select: {
                  userId: true,
                  name: true,
                  firstname: true,
                  phoneNumber: true,
                },
              }, // Inclure les détails de l'utilisateur pour chaque postulation
            },
          },
          savedJob: {
            // Inclure toutes les sauvegardes liées à cette offre d'emploi
            include: {
              user: {
                select: {
                  name: true,
                  firstname: true,
                  phoneNumber: true,
                },
              }, // Inclure les détails de l'utilisateur qui sauvé cet emploi
            },
          },
        },
      });

      // Vérifiez que jobListing n'est pas nul et a des propriétés à parser
      if (jobListing) {
        // On Parse les propriétés JSON si elles sont présentes et sont des chaînes
        if (
          jobListing.responsibilities &&
          typeof jobListing.responsibilities === 'string'
        ) {
          jobListing.responsibilities = JSON.parse(jobListing.responsibilities);
        }
        if (
          jobListing.requiredQualifications &&
          typeof jobListing.requiredQualifications === 'string'
        ) {
          jobListing.requiredQualifications = JSON.parse(
            jobListing.requiredQualifications,
          );
        }
        if (jobListing.benefits && typeof jobListing.benefits === 'string') {
          jobListing.benefits = JSON.parse(jobListing.benefits);
        }
      }

      // On retourne la liste complète des fonctions
      return {
        result: true,
        data: jobListing,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ All Job Published by Recruiter    @@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async AlljobListingOfRecruiter(recruiterId: number) {
    try {
      // On vérifie l'existence du demandeur dans la base de donnée
      await this.userService.verifyUsersExistence(recruiterId);

      // On récupére et retourne la liste de toutes les offres d'emploi du recruiter
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          userId: recruiterId,
        },
        orderBy: {
          createdAt: 'desc', // Tri par date de création, du plus récent au plus ancien
        },
        select: {
          jobListingId: true,
          jobLocationId: true,
          jobTitleId: true,
          contractTypeId: true,
          userId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          publicationDate: true,
          deadline: true,
          dayAgo: true,
          validate: true,
          jobClose: true,
          askUpdatingToRecruiter: true,
          user: {
            select: {
              userId: true,
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
            },
          },
          jobTitle: true,
          jobLocation: true,
          contractType: true,
          experience: true,
          jobApplications: {
            where: {
              actif: true, // Uniquement les candidatures actives
            },
            select: {
              jobApplicationId: true,
              appointmentId: true,
              applicationHours: true,
              status: true,
              jobInterviewOK: true,
              interviewNote: true,
              userId: true,
              checkJobAppliByConsultant: true,
              deadlineToDelete: true,
              actif: true,
              createdAt: true,
              user: {
                select: {
                  userId: true,
                  name: true,
                  firstname: true,
                  dateBirth: true,
                  email: true,
                  sex: true,
                  phoneNumber: true, // Assurez-vous d'inclure le numéro de téléphone
                  jobTitle: {
                    select: {
                      title: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      /* 
       "change-responsibilitie": "Responsabilité","
        "change-qualification": "Qualification",
         "change-benefit": "Avantage :",
         */

      // Ici on vérifie si la liste des emplois est vide
      if (jobListings.length === 0) {
        return {
          message: `Aucune offre d'emploi présente dans la base de données.`,
        };
      }

      // Enrichissement de chaque offre d'emploi avec le nombre de sauvegardes
      for (const jobListing of jobListings) {
        const savedJobCount = await this.prismaService.saveJobs.count({
          where: {
            jobListingId: jobListing.jobListingId,
            user: {
              role: {
                title: 'Candidate', // Montrer uniquement les sauvegardes des candidats
              },
            },
          },
        });

        // Ajout du compteur de sauvegardes à chaque offre
        jobListing['savedJobNumber'] = savedJobCount;
      }

      // On retourne la liste complète des fonctions
      return {
        result: true,
        data: jobListings, // Directement le tableau des jobListings
        count: jobListings.length, // Ajoutez count ici, au même niveau que 'data'
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings List validate false @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllJobListingsDisable() {
    try {
      // Récupération de toutes les annonces d'emploi de la base de données
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          OR: [{ validate: false }, { validate: null }],
        }, // On filtre les annonces validées
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          validate: true,
          jobClose: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });
      // Ici on vérifie si la liste des emplois est vide
      if (jobListings.length === 0) {
        return {
          message: 'Aucun emploi inactive présent dans la base de données',
        };
      }

      // On retourne la liste complète des fonctions
      // On retourne la liste complète des fonctions
      return {
        result: true,
        data: jobListings, // Directement le tableau des jobListings
        count: jobListings.length, // Ajoutez count ici, au même niveau que 'data'
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings List to validate validate null @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllJobListingsToValidate() {
    try {
      // Récupération de toutes les annonces d'emploi de la base de données
      const jobListings = await this.prismaService.jobListings.findMany({
        where: { validate: null }, // Filtrer les annonces validées
        select: {
          jobListingId: true,
          description: true,
          responsibilities: true,
          requiredQualifications: true,
          benefits: true,
          workingHours: true,
          numberOfCandidates: true,
          workingHoursStart: true,
          workingHoursEnd: true,
          startDate: true,
          salary: true,
          deadline: true,
          validate: true,
          jobClose: true,
          user: {
            select: {
              name: true,
              firstname: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          contractType: {
            // Inclure tous les types de contrat
            select: {
              title: true,
            },
          }, // Inclure les localité
          jobLocation: {
            select: {
              location: true,
            },
          },
        },
      });
      // Ici on vérifie si la liste des emplois est vide
      if (jobListings.length === 0) {
        return {
          message: 'Aucun emploi inactive présent dans la base de données',
        };
      }

      // On retourne la liste complète des fonctions
      // On retourne la liste complète des fonctions
      return {
        result: true,
        data: jobListings, // Directement le tableau des jobListings
        count: jobListings.length, // Ajoutez count ici, au même niveau que 'data'
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings List where deadline is Now @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllJobListingsWithDeadlineIsNowAndSendMail() {
    try {
      // On défini le début de la journée d'hier
      const toDay = new Date();

      // Récupération de toutes les annonces d'emploi validées dont la deadlineExpires (deadline + 15 jours) n'est pas dépassée
      const joblistings = await this.prismaService.jobListings.findMany({
        where: {
          validate: true, // Filtre les annonces validées
          deadline: {
            lte: toDay, // La deadline doit être inférieure ou égale à aujourd'hui
          },
        },
        include: {
          // Récupération de certaines informations du publicateur de l'emploi
          user: {
            select: {
              name: true,
              firstname: true,
              email: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
        },
      });
      // Ici on vérifie si la liste des emplois est vide
      if (joblistings.length === 0) {
        return {
          message: `Aucun emploi dont la date limite de postulation est aujourd'hui présent dans la base de données`,
        };
      }
      for (const joblisting of joblistings) {
        // Formatage de la date
        const deadline = joblisting.deadline;
        const deadlineToDelete = joblisting.deadlineExpires;
        // Utilisation de Moment.js pour formater la date et l'heure
        const formattedDeadline = format(
          new Date(deadline),
          'dd/MM/yyyy HH:mm',
        );
        const formattedDeadlineToDelete = format(
          new Date(deadlineToDelete),
          'dd/MM/yyyy HH:mm',
        );

        // Envoie de mail pour chaque emploi au recruiteur pour demander de ralonger sinon la publication sera supprimer dans 15 jours
        await this.mailerService.sendMailToExtendApplicationDeadline(
          joblisting.user.email,
          joblisting.jobTitle.title,
          joblisting.user.name,
          formattedDeadline,
          joblisting.jobListingId,
          formattedDeadlineToDelete,
        );
      }

      // On retourne la liste complète des fonctions
      return {
        result: true,
        data: joblistings,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Job Listings by recruiterId Access By  Consultant @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async jobListingsByRecruiterId(recruiterId: number) {
    try {
      // On vérifie l'existence de l'utilisateur
      await this.userService.verifyUsersExistence(recruiterId);

      // On vérifie le rôle pour s'assurer que le publicateur est bien un un recruteur
      const role = await this.userService.verifyRoleExistence(recruiterId);

      if (!role || role.title !== 'Recruiter') {
        throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_RECRUITER );
      }

      // Récupération de toutes les annonces d'emploi publiées par l'utilisateur
      const jobListings = await this.prismaService.jobListings.findMany({
        where: { userId: recruiterId },
      });

      // Ici on vérifie si la liste des emplois est vide
      if (jobListings.length === 0) {
        return { message: `Cet recruteur n'a aucune offfre d'emploi publiée.` };
      }

      // On retourne la liste complète des fonctions
      // On retourne la liste complète des fonctions
      return {
        result: true,
        data: jobListings, // Directement le tableau des jobListings
        count: jobListings.length, // Ajoutez count ici, au même niveau que 'data'
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings with deadline expired by two week @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllJobListingsWithDeadlineExpiredAfterTwoWeek() {
    try {
      // On défini le début de la journée d'hier
      const toDay = new Date();

      // Récupération de toutes les annonces d'emploi validées dont la date limite de postulation est dépassée
      const joblistings = await this.prismaService.jobListings.findMany({
        where: {
          validate: true,
          deadline: {
            lte: toDay, // La deadline doit être inférieure ou égale à aujourd'hui
          },
        },
        include: {
          // Récupération de certaines informations du publicateur de l'emploi
          user: {
            select: {
              name: true,
              firstname: true,
              email: true,
              nameCompany: true,
              addressCompany: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
        },
      });
      // Ici on vérifie si la liste des emplois est vide
      if (joblistings.length === 0) {
        return {
          message: `Aucun emploi dont la date limite de postulation est aujourd'hui présent dans la base de données`,
        };
      }

      // On retourne la liste complète des fonctions
      // On retourne la liste complète des fonctions
      return {
        result: true,
        data: joblistings, // Directement le tableau des jobListings
        count: joblistings.length, // Ajoutez count ici, au même niveau que 'data'
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings To Update with deadline expired by two Days @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllJobListingsWithDeadlineExpiredAfterTwoDays() {
    try {
      // On défini l'heure actuellement
      const toDay = new Date();

      // Récupération de toutes les annonces d'emploi validées dont la date limite de postulation est dépassée
      const joblistings = await this.prismaService.jobListings.findMany({
        where: {
          deadlineToDeleteNotConfirm: {
            gte: toDay, // La deadline doit être superieure ou égale à aujourd'hui
          },
        },
        include: {
          // Récupération de certaines informations du publicateur de l'emploi
          user: {
            select: {
              name: true,
              firstname: true,
              email: true,
              nameCompany: true,
              addressCompany: true,
              descriptionCompany: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
        },
      });
      // Ici on vérifie si la liste des emplois est vide
      if (joblistings.length === 0) {
        return {
          message: `Aucun emploi dont la date limite de postulation est aujourd'hui présent dans la base de données`,
        };
      }
      // On retourne la liste complète des fonctions
      // On retourne la liste complète des fonctions
      return {
        result: true,
        data: joblistings, // Directement le tableau des jobListings
        count: joblistings.length, // Ajoutez count ici, au même niveau que 'data'
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   UPDATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$


// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listing Update @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
async updateJobListingBeforPublished(
  jobListingId: number,
  recruiterId: number,
  updateJobListingDto: UpdateJobListingDto,
) {
  try {
    await this.userService.verifyUsersExistence(recruiterId);

    const jobListing = await this.prismaService.jobListings.findUnique({
      where: {
        jobListingId: jobListingId,
        userId: recruiterId,
      },
    });

    if (!jobListing) {
      throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_UPDATE_JOB );
    }

    await this.verifyJobListingExistence(jobListingId);

    const {
      parsedResponsibilities,
      parsedRequiredQualifications,
      parsedBenefits,
    } = await this.validateJobListingData(updateJobListingDto);

    const updateData = {
      ...updateJobListingDto,
      responsibilities: JSON.stringify(parsedResponsibilities),
      requiredQualifications: JSON.stringify(parsedRequiredQualifications),
      benefits: JSON.stringify(parsedBenefits),
    };

    if (updateJobListingDto.deadline) {
      const deadlineExpires = addDays(
        new Date(updateJobListingDto.deadline),
        90,
      );
      updateData['deadlineExpires'] = deadlineExpires;
    }

    // Vérifier si le jobTitleId a été modifié
    if (updateJobListingDto.jobTitleId && updateJobListingDto.jobTitleId !== jobListing.jobTitleId) {
      const jobListingExists = await this.prismaService.jobListings.findFirst({
        where: {
          jobTitleId: updateJobListingDto.jobTitleId,
          userId: recruiterId,
          NOT: {
            jobListingId: jobListingId,
          },
        },
        select: {
          jobListingId: true,
        }
      });
      if (jobListingExists) {
        throw new ConflictException(ErrorMessages.CONFLICT_JOB_LISTING );
      }
      
    }

    const updatedJobListing = await this.prismaService.jobListings.update({
      where: { jobListingId },
      data: updateData,
    });

    return {
      result: true,
      data: updatedJobListing,
      error_code: null,
      error: null,
    };
  } catch (error) {
    throw error;
  }
}











  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listing validate @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async validateJobListing(
    jobListingId: number,
    consultantId: number,
    validateJobListingDto: ValidateJobListingDto,
  ) {
    try {
      const { validate, noteJoblisting } = validateJobListingDto;

      // Vérification de l'existence du Consultant et de l'offre d'emploi
      const requestingConsultant =
        await this.userService.verifyUsersExistence(consultantId);
      const consultantName =
        requestingConsultant.name + ' ' + requestingConsultant.firstname;

      // Vérification de l'existence  de l'offre d'emploi
      const jobListing = await this.verifyJobListingExistence(jobListingId);

      // Utilisez des logs pour déboguer
      console.log(
        `JobListing validate: ${jobListing.validate}, Requested validate: ${validate}`,
      );

      // On vérifie si joblisting a déjà été validé ou non
      if (jobListing.validate === validate) {
       
        throw new ConflictException(ErrorMessages.JOB_LISTING_ALREADY_VALIDATED );
      }

      if (validate) {
        // l'emploi est validé: mettre a jour envoyé mail de notifcation au Recruteur et aux candidats
        // Mettre à jour l'emploi comme validé et retourner les détails de l'emploi mis à jour

        const publicationDate = new Date();

        // La date actuelle.
        const now = new Date();
        // Calcule de la différence en jours.
        const dayAgo = differenceInDays(now, publicationDate);

        const updatedJobListing = await this.prismaService.jobListings.update({
          where: { jobListingId },
          data: {
            validate,
            checkJobListingByConsultant: consultantName,
            publicationDate: publicationDate,
            dayAgo: dayAgo,
            noteJoblisting: null,
            invalidatyToDelete: null,
            deadlineToDeleteNotConfirm: null,
          },
          select: {
            jobListingId: true,
            jobTitle: {
              select: {
                title: true,
              },
            },
            user: {
              select: {
                name: true,
                firstname: true,
                nameCompany: true,
                addressCompany: true,
                descriptionCompany: true,
                email: true,
              },
            }, // Sélectionner uniquement le jobTitle de l'emploi mis à jour
            checkJobListingByConsultant: true,
          },
        });

        // On va recupérer le Id du jobListing pour attribuer le suivi et gestion de l'offre au consultant (sauver dans son Dashbord)
        const jobListingValidedId = updatedJobListing.jobListingId;

        // On recupere  egalement le Id du consultant
        const consultantId = requestingConsultant.userId;

        // On verifie si la gestion a déjà été attribué à cet consultant, Si oui annuler chez lui et l'attribuer à ce nouveau
        await this.handleJobListingAssignmentToConsultant(
          jobListingValidedId,
          consultantId,
        );

        // Envoi un email de confirmation
        await this.mailerService.sendJobListingConfirmation(
          updatedJobListing.user.email,
          updatedJobListing.user.name,
          updatedJobListing.jobTitle.title,
        );

        // On rechercher des candidats avec un jobTitle similaire et notification d'emploi active
        const candidatesWithSimilarJobTitle =
          await this.prismaService.users.findMany({
            where: {
              jobTitle: {
                title: {
                  contains: updatedJobListing.jobTitle.title, // J'utiliser 'contains' pour une correspondance partielle
                },
              },
              role: {
                title: 'Candidate',
              },
              notification: true,
              actif: true,
            },
            select: {
              name: true,
              firstname: true,
              email: true,
            },
          });

        // Envoyoi d'un email à chaque candidate correspondant de la liste trouvée
        for (const candidate of candidatesWithSimilarJobTitle) {
          await this.mailerService.sendJobOpportunityEmail(
            candidate.email,
            candidate.name,
            updatedJobListing.jobTitle.title,
            updatedJobListing.jobListingId,
          );
        }

        return {
          result: true,
          data: `Job listing validé et emails envoyés aux candidats correspondants.`,
          error_code: null,
          error: null,
        };
      } else {
        const deadlineToDeleteNotConfirmation = addDays(new Date(), 3); // Ajoute 3 jours à deadlineToDeleteNotConfirmation
        if (
          !noteJoblisting ||
          noteJoblisting.length < 20 ||
          noteJoblisting.length > 1000
        ) {
            throw new BadRequestException(ErrorMessages.INVALID_VALIDATION_NOTE_LENGTH );
        }
        // Mettre à jour la  publication d'emploi avec la note explicative fournie et une deadline de modification de 2 jours
        const jobListingToUpdate = await this.prismaService.jobListings.update({
          where: { jobListingId: jobListingId },
          data: {
            validate,
            checkJobListingByConsultant: consultantName,
            noteJoblisting,
            deadlineToDeleteNotConfirm: deadlineToDeleteNotConfirmation,
            askUpdatingToRecruiter: true,
          },
          select: {
            noteJoblisting: true,
            deadlineToDeleteNotConfirm: true,
            jobListingId: true,
            jobTitle: {
              select: {
                title: true,
              },
            },
            user: {
              select: {
                name: true,
                firstname: true,
                nameCompany: true,
                addressCompany: true,
                descriptionCompany: true,
                email: true,
              },
            }, // Sélectionner uniquement le jobTitle de l'emploi mis à jour
            checkJobListingByConsultant: true,
          },
        });
        // On verifie si la gestion a déjà été attribué à cet consultant, Si oui annuler chez lui et l'attribuer à ce nouveau
        await this.handleJobListingAssignmentToConsultant(
          jobListingToUpdate.jobListingId,
          consultantId,
        );

        // Formatage de la date
        const deadlineToDelete = jobListingToUpdate.deadlineToDeleteNotConfirm;
        // Utilisation de Moment.js pour formater la date et l'heure
        const formattedDeadlineToDelete = format(
          new Date(deadlineToDelete),
          'dd/MM/yyyy HH:mm',
        );

        // Envoi d'un email de non-confirmation en cas de non validation avec la note explicative et une deadline de modification de 2 jours
        await this.mailerService.sendJobListingNotConfirmedWithDemandToUpdate(
          jobListingToUpdate.user.name,
          jobListingToUpdate.user.email,
          jobListingToUpdate.jobTitle.title,
          jobListingToUpdate.noteJoblisting,
          formattedDeadlineToDelete,
        );
        // On retourne la liste complète des fonctions
        return {
          result: true,
          data: 'Job listing non validé mais demande de modification et note explicative envoyée au publicateur',
          error_code: null,
          error: null,
        };
      }
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listing invalidate and Delete immediatly @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async invalidateToDeleteJobListing(
    jobListingId: number,
    consultantId: number,
    invalidateToDeleteJobListingDto: InvalidateToDeleteJobListingDto,
  ) {
    try {
      const { invalidatyToDelete } = invalidateToDeleteJobListingDto;
      // Vérification de l'existence du Consultant et de l'offre d'emploi
      await this.userService.verifyUsersExistence(consultantId);

      // Vérification de l'existence  de l'offre d'emploi
      const jobListing = await this.verifyJobListingExistence(jobListingId);

      const name = jobListing.user.name;
      const email = jobListing.user.email;
      const JobTitle = jobListing.jobTitle.title;

      // On vérifie si joblisting a déjà été  ou non invalidatyToDelete
      if (jobListing.askUpdatingToRecruiter) {
        throw new ConflictException(ErrorMessages.JOB_LISTING_ALREADY_VALIDATED );
      }
      if (invalidatyToDelete) {
        /// Supprimer categorigment l'emploi
        /* await this.prismaService.jobListings.delete({
          where: { jobListingId },
          select: {
            jobTitle: {
              select: {
                title: true,
              },
            },
            user: {
              select: {
                name: true,
                email: true,
                jobTitle: true,
              },
            },
          },
        }); */
        // Envoi d'un email de non confirmation
        await this.mailerService.sendJobListingNotConfirmed(
          name,
          email,
          JobTitle,
        );

        return {
          result: true,
          data: {
            message:
              'Job listing non validé, Supprimée et notification envoyé au publicateur',
          },
          error_code: null,
          error: null,
        };
      }
      // On retourne la liste complète des fonctions
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listing Closing @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
async closingJobListing(
  jobListingId: number,
  consultantId: number,
  closeJobListingDto: CloseJobListingDto,
) {
  try {
    const { jobClose } = closeJobListingDto;

    // Vérification de l'existence du Consultant et de l'offre d'emploi
    await this.userService.verifyUsersExistence(consultantId);

    // Vérification de l'existence de l'offre d'emploi
    const jobListing = await this.verifyJobListingExistence(jobListingId);

    // On vérifie si joblisting a déjà été ou non invalidatyToDelete
    /* if (jobListing.askUpdatingToRecruiter) {
      throw new ConflictException(
        `Cette offre d'emploi est déjà traitée et un email a été envoyé au Recruteur.`,
      );
    }*/
    if (jobClose) {
      const now = new Date();
      // Compter le nombre de candidatures liées à l'offre
      await this.verifiyNumberOfCandidateBeforClosing(
        jobListing.jobListingId,
        jobListing.numberOfCandidates,
      );

      // On vérifie s'il y a des futurs RDV d'entretien liés à cette offre
      await this.checkFutureAppointments(jobListing.jobListingId);


      const uniqueIdentifier =  await this.generateUniqueIdentifier();

      // On va archiver l'offre
      const historique =  await this.prismaService.historiques.create({
        data: {
         histNumber: uniqueIdentifier ,
          publicationDate: jobListing.publicationDate,
           jobCloseDate: now,
          nameRecruiter: jobListing.user.name,
           firstnameRecruiter: jobListing.user.firstname,
          nameCompany: jobListing.user.nameCompany,
           tvaNumber: jobListing.user.tvaNumber,
           addressCompany: jobListing.user.addressCompany,
           email: jobListing.user.email,
           phoneNumber: jobListing.user.phoneNumber,
          jobtitle: jobListing.jobTitle.title,
          contractTypetitle: jobListing.contractType.title,
          JobLocation: jobListing.jobLocation.location,
          numberOfCandidates: jobListing.numberOfCandidates,
          checkUserConsultant: jobListing.checkJobListingByConsultant,
        },
      });

        // Envoyer un email au service de comptabilité avec les informations archivées
     await this.mailerService.sendAccountingEmailWithArchivedJobInfo(historique);

      // On va envoyer un e-mail de refus à toutes les postulations liées à cette offre
      await this.sendInvalidateJobApplicationMail(jobListing.jobListingId);

      // On mène un certain nombre d'actions en cascade pour supprimer : (les RDV, postulations, les sauvegardes)
      await this.closeJobListingAndActionOnCascade(jobListing.jobListingId);

      return {
        result: true,
        data: {
          message: 'job Closed',
        },
        error_code: null,
        error: null,
      };
    } else {
     
    // On s'assure que les dates ne sont pas des dates passées
    const currentDate = new Date();
    if (isBefore(new Date(jobListing.startDate), currentDate)) {
    
      throw new BadRequestException(ErrorMessages.START_DATE_IN_PAST);
    }
    if (isBefore(new Date(jobListing.deadline), currentDate)) {
    
      throw new BadRequestException(ErrorMessages.DEADLINE_IN_PAST);
    }
      // On mène un certain nombre d'actions en cascade pour supprimer : (les RDV, postulations, les sauvegardes)
      await this.activationJobListingAndActionOnCascade(jobListing.jobListingId);

      // On met à jour le statut (réouverture) de l'emploi dans la base de données
      const updatedJobListing = await this.prismaService.jobListings.update({
        where: { jobListingId: jobListingId },
        data: {
          jobClose: false,
          validate: null,
          invalidatyToDelete: null,
          askUpdatingToRecruiter: null,
          checkJobListingByConsultant: null,
          deadlineToDeleteNotConfirm: null,
          dayAgo: null,
          publicationDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return {
        result: true,
        data: updatedJobListing,
        error_code: null,
        error: null,
      };
    }
  } catch (error) {
    // Relance l'erreur pour qu'elle soit gérée ailleurs
    throw error;
  }
}


  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Delete  My Job Listing Or Delete By Consultant @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   DELETE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Delete Job Listing by Consultant @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async deleteMyJobListingOrDeleteByConsultant(
    jobListingId: number,
    requestingUserId: number,
  ) {
    try {
      // On vérifie l'utilisateur demandeur
      const userResquesting =
        await this.userService.verifyUsersExistence(requestingUserId);
      // On récupére l'emploi
      const jobListing = await this.verifyJobListingExistence(jobListingId);

      // On recupère le rôle de l'utilisateur demandeur
      const userRole = await this.prismaService.roles.findUnique({
        where: { roleId: userResquesting.roleId },
      });

      // On vérifie si l'utilisateur est un consultant ou si c'est l'utilisateur qui a créé l'emploi
      if (
        userRole.title !== 'Administrator' &&
        userRole.title !== 'Consultant' &&
        jobListing.userId !== requestingUserId
      ) {
        throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_DELETE_JOB);
      }

      // On supprime l'emploi de la base de données
      await this.deleteJobListingOnCascade(jobListing.jobListingId);

       // On supprime l'emploi de la base de données
       await this.prismaService.jobListings.delete({
        where: { jobListingId: jobListingId },
      });

      // On supprime une réponse de succès
      return {
        result: true,
        data: {
          message: 'Job listing successfully deleted',
        },
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings with deadline expire in 90 days @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async DeleteAllJobListingsWithDeadlineExpiredIn90Days() {
    try {
      // // 90 jours ont été ajoutés à deadline
      // Date d'aujourd'hui à minuit,
      const startOfToday = startOfDay(new Date()); // Obtient le début de la journée actuelle

      // Début d'une transaction
      await this.prismaService.$transaction(async (prisma) => {
        // On trouve tous les jobListings expirés
        const jobListingsExpiredby90days = await prisma.jobListings.findMany({
          where: {
            deadlineExpires: {
              lte: startOfToday, // 'lte' pour 'less than or equal', inclut les annonces expirant aujourd'hui
            },
          },
        });

        // Pour chaque jobListing expiré, supprimer les enregistrements liés
        for (const jobListing of jobListingsExpiredby90days) {
          const jobListingId = jobListing.jobListingId;

          // On supprime tous les RDV liés à l'offre d'emploi
          await prisma.appointment.deleteMany({
            where: { jobApplication: { jobListingId: jobListingId } },
          });

          // On supprime toutes les candidatures liées à l'offre d'emploi
          await prisma.jobApplications.deleteMany({
            where: { jobListingId: jobListingId },
          });

          // On supprime toutes les sauvegardes liées à l'offre d'emploi
          await prisma.saveJobs.deleteMany({
            where: { jobListingId: jobListingId },
          });

          // Supprimer l'emploi de la base de données
          await prisma.jobListings.delete({
            where: {
              jobListingId: jobListingId,
            },
          });
        }
        // On supprime une réponse de succès
        return {
          result: true,
          data: {
            message: `Nombre de publications expirées supprimées: ${jobListingsExpiredby90days.length}.`,
          },
          error_code: null,
          error: null,
        };
      });
      // On supprime une réponse de succès
      return {
        result: true,
        data: {
          message: `Il n'y a aucune puplication expirée.`,
        },
        error_code: null,
        error: null,
      };

      // On retourne la liste complète des fonctions
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@@@@@
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings To Update with deadline expired by two Days @@@@@@@@@@@@@@@@@@@@@@
  async DeleteAllJobListingsWithDeadlineExpiredInTwoDays() {
    // Date (deadline + 2) de suppression de l'ofrre si l'utilisateur ne le modifie pas a temps
    // Date d'aujourd'hui à minuit,
    const startOfToday = startOfDay(new Date()); // Obtient le début de la journée actuelle

    const jobListingsDeleted = await this.prismaService.jobListings.deleteMany({
      where: {
        deadlineToDeleteNotConfirm: {
          lte: startOfToday, // 'lte' pour 'less than or equal', inclut les annonces expirant aujourd'hui
        },
      },
      // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    }); // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@
    // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@
    if (jobListingsDeleted.count > 0) {
      // result.count contiendra le nombre de comptes supprimés// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@
      return {
        message: `Nombre de comptes non verifiés supprimés est: ${jobListingsDeleted.count}`,
      }; // @@@@@@@@@@@@@@@@@@@@@@@@@
    } // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@
    return { message: `Il n'y a aucun emploi` }; // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@
  } // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@@@@
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@// @@@@@@@@@@@@@@@@@@@@@@@@@@@

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   Fonctions Privée  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // Définition d'une méthode privée pour valider les champs JSON d'un objet.
  private validateJsonFields(
    responsibilities: string,
    requiredQualifications: string,
    benefits: string,
  ) {
    // Initialisation des variables pour stocker les valeurs analysées.
    let parsedResponsibilities = [];
    let parsedRequiredQualifications = [];
    let parsedBenefits = [];

    try {
      // Tentative de parse (analyse) des chaînes de caractères JSON en objets JavaScript.
      // Si 'responsibilities' est non vide, on le convertit de JSON en objet JavaScript.
      if (responsibilities)
        parsedResponsibilities = JSON.parse(responsibilities);

      // Idem pour 'requiredQualifications'.
      if (requiredQualifications)
        parsedRequiredQualifications = JSON.parse(requiredQualifications);

      // Et idem pour 'benefits'.
      if (benefits) parsedBenefits = JSON.parse(benefits);

      // Vérification que les objets analysés sont bien des tableaux.
      // Si l'une des conditions échoue, une erreur est levée pour interrompre l'exécution.
      if (
        !Array.isArray(parsedResponsibilities) ||
        !Array.isArray(parsedRequiredQualifications) ||
        !Array.isArray(parsedBenefits)
      ) {
        throw new Error();
      }
    } catch {
      // En cas d'erreur dans le bloc try (par exemple, si le JSON est invalide ou si ce n'est pas un tableau),
      // on lève une exception spécifique indiquant le problème.
      throw new BadRequestException(ErrorMessages.INVALID_JSON_FIELDS);
    
      
    }

    // Si tout est valide, on retourne un objet contenant les tableaux analysés.
    return {
      parsedResponsibilities,
      parsedRequiredQualifications,
      parsedBenefits,
    };
  }
  /////////////////// fonctions
  private isValidTimeFormat(time: string): boolean {
    return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }
  /////////////////// Fonction pour vérifier l'existance du JobLinsting
  async verifyJobListingExistence(jobListingId: number) {
    const jobListing = await this.prismaService.jobListings.findUnique({
      where: { jobListingId },
      include: {
        user: {
          select: {
            name: true,
            firstname: true,
            email: true,
            nameCompany: true,
            addressCompany: true,
            tvaNumber: true,
            descriptionCompany: true,
            phoneNumber: true,
            checkUserConsultant: true,
            role: {
              select: {
                title: true,
              },
            },
          },
        },
        jobTitle: {
          select: {
            title: true,
          },
        },
        jobApplications: {
          // Inclure toutes les postulations liées à cette offre d'emploi
          include: {
            user: {
              select: {
                name: true,
                firstname: true,
                phoneNumber: true,
              },
            }, // Inclure les détails de l'utilisateur pour chaque postulation
          },
        },
        savedJob: {
          // Inclure toutes les sauvegardes liées à cette offre d'emploi
          include: {
            user: {
              select: {
                name: true,
                firstname: true,
                phoneNumber: true,
              },
            }, // Inclure les détails de l'utilisateur qui sauvé cet emploi
          },
        },
        contractType: {
          // Inclure tous les types de contrat
          select: {
            title: true,
          },
        }, // Inclure les localité
        jobLocation: {
          select: {
            location: true,
          },
        },
      },
    });
    if (!jobListing) {

      throw new NotFoundException(ErrorMessages.JOB_LISTING_NOT_FOUND);
    }
    return jobListing;
  }

  /////////////////// On vérifie si la fonction existe
  async verifyJobTitleExistence(jobTitleId: number) {
    const jobTitle = await this.prismaService.jobTitle.findUnique({
      where: { jobTitleId: jobTitleId },
    });
    if (!jobTitle){
      throw new NotFoundException(ErrorMessages.JOB_TITLE_NOT_FOUND);
    }
   
    return jobTitle;
  }
  /////////////////// On verifie si la fonction existe
  async verifyjobTitle(jobTitleId: number) {
    const jobTitle = await this.prismaService.jobTitle.findUnique({
      where: { jobTitleId },
    });
    if (!jobTitle) {
      throw new NotFoundException(ErrorMessages.JOB_TITLE_NOT_FOUND);
    }
  }
  /////////////////// On vérifie si le contrat spécifié existe
  async verifyContractTypeExistence(contractTypeId: number) {
    const contractType = await this.prismaService.contractTypes.findUnique({
      where: {
        contractTypeId: contractTypeId,
      },
    });
    if (!contractType)
     
    throw new NotFoundException(ErrorMessages.CONTRACT_TYPE_NOT_FOUND);
    return contractType;
  }
  /////////////////// On vérifie si la localisation spécifiée existe
  async verifyjobLocationExistence(jobLocationId: number) {
    const jobLocation = await this.prismaService.jobLocation.findUnique({
      where: { jobLocationId: jobLocationId },
    });
    if (!jobLocation)
    throw new NotFoundException(ErrorMessages.JOB_LOCATION_NOT_FOUND);
    return jobLocation;
  }
 
  // Méthode pour vérifier le nombre de candidatures et contrôler la limite des candidats
  async verifiyNumberOfCandidateBeforClosing(
    jobListingId: number,
    maxCandidatesRequestedByRecruiter: number,
  ): Promise<void> {
    const numberOfCandidatesValided =
      await this.prismaService.jobApplications.count({
        where: {
          jobListingId: jobListingId,
          status: true,
          jobInterviewOK: true,
        },
      });

    // Vérifier si le nombre de candidats à recruter est atteint
    if (numberOfCandidatesValided < maxCandidatesRequestedByRecruiter) {

      throw new BadRequestException(ErrorMessages.MAX_CANDIDATES_NOT_REACHED);
    }
  }

  // On verifie s'il ya des futures RDV d'entretîen liés a cette offre

  async checkFutureAppointments(jobListingId: number) {
    const now = new Date();

    const appointment = await this.prismaService.appointment.findFirst({
      where: {
        appointmentDate: { gte: now },
        jobApplication: {
          jobListingId: jobListingId,
        },
      },
    });

    if (appointment) {
      throw new BadRequestException(ErrorMessages.FUTURE_APPOINTMENTS_EXIST);
    }
  }

  // On va envoyer un e-mail de refus a toutes les postulation liées cette offre
  async sendInvalidateJobApplicationMail(jobListingId: number) {
    // On cherche toutes les postulations liées à l'offre
    const candidatesApplicants =
      await this.prismaService.jobApplications.findMany({
        where: {
          jobListingId: jobListingId,
          jobInterviewOK: null,
          //  hasReceivedRefsuMail: false,
        },
        select: {
          user: {
            select: {
              name: true,
              firstname: true,
              email: true,
            },
          },
          jobListing: {
            select: {
              jobTitle: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      });

    // Envoi d'un email à chaque candidat correspondant de la liste trouvée
    for (const candidat of candidatesApplicants) {
      await this.mailerService.sendJobApplicationNotAccepted(
        candidat.user.name,
        candidat.user.firstname,
        candidat.user.email,
        candidat.jobListing.jobTitle.title,
      );
    }
  }

  // Méthode de validation
  private async validateJobListingData(
    jobListingDto: CreateJobListingDto | UpdateJobListingDto,
  ) {
    const {
      jobTitleId,
      experienceId,
      contractTypeId,
      jobLocationId,
      description,
      responsibilities,
      requiredQualifications,
      benefits,
      workingHours,
      numberOfCandidates,
      workingHoursStart,
      workingHoursEnd,
      startDate,
      salary,
      deadline,
    } = jobListingDto;

    // On vérifie si la localisation spécifiée existe
    if (jobLocationId) {
      await this.verifyjobLocationExistence(jobLocationId);
    }

    // On vérifie si le contrat spécifié existe
    if (contractTypeId) {
      await this.verifyContractTypeExistence(contractTypeId);
    }

    // On vérifie si l'experience spécifiée existe
    if (experienceId) {
      // await this.verifyExperienceExistence(experienceId);
    }

    // On vérifie si la fonction existe
    if (jobTitleId) {
      await this.verifyJobTitleExistence(jobTitleId);
    }

    // On s'assure que les dates ne sont pas des dates passées
    const currentDate = new Date();
    if (startDate && isBefore(new Date(startDate), currentDate)) {
      
      throw new BadRequestException(ErrorMessages.START_DATE_IN_PAST);
    }
    if (deadline && isBefore(new Date(deadline), currentDate)) {
      throw new BadRequestException(ErrorMessages.DEADLINE_IN_PAST);
    }

    // On vérifie les heures de travail
    if (workingHours < 1 || workingHours > 40) {
     
      throw new BadRequestException(ErrorMessages.INVALID_WORKING_HOURS);
    }

    // On vérifie le nombre de candidats recherchés
    if (numberOfCandidates < 1 || numberOfCandidates > 10) {
      throw new BadRequestException(ErrorMessages.INVALID_NUMBER_OF_CANDIDATES);
    }

    // On verifie la longueur de la description
    if (!description || description.length < 50 || description.length > 2000) {
  
      throw new BadRequestException(ErrorMessages.INVALID_DESCRIPTION_LENGTH);
    }

    // Validation des champs JSON ajoutés
    const {
      parsedResponsibilities,
      parsedRequiredQualifications,
      parsedBenefits,
    } = this.validateJsonFields(
      responsibilities,
      requiredQualifications,
      benefits,
    );

    // On vérifie le format  des heures de début et de fin
    if (
      workingHoursStart.length !== 5 ||
      !this.isValidTimeFormat(workingHoursStart)
    ) {
      
      throw new BadRequestException(ErrorMessages.INVALID_TIME_FORMAT_START);
    }
    if (
      workingHoursEnd.length !== 5 ||
      !this.isValidTimeFormat(workingHoursEnd)
    ) {
      throw new BadRequestException(ErrorMessages.INVALID_TIME_FORMAT_END);
    }

    // On s'assure que le salaire est positif
    if (salary !== undefined && salary < 0) {
      throw new BadRequestException(ErrorMessages.NEGATIVE_SALARY);
    }

    return {
      parsedResponsibilities,
      parsedRequiredQualifications,
      parsedBenefits,
    };
  }

  /////////////////// Gère l'attribution d'offres d'emploi aux consultants, réattribue si déjà pris et évite les doublons
  private async handleJobListingAssignmentToConsultant(
    jobListingValidedId: number,
    consultantId: number,
  ) {
    // On vérifie si l'emploi est déjà attribué à un consultant
    const isAlreadySaveByConsultant =
      await this.prismaService.saveJobs.findFirst({
        where: {
          jobListingId: jobListingValidedId,
          user: {
            role: {
              title: 'Consultant',
            },
          },
        },
        select: {
          saveJobId: true,
          jobListing: {
            select: {
              jobListingId: true,
            },
          },
          user: {
            select: {
              userId: true,
            },
          },
        },
      });

    // Si l'emploi est déjà attribué à un consultant
    if (isAlreadySaveByConsultant) {
      // On reverifie si l'emploi est attribué à un autre consultant, supprimer cette attribution
      if (isAlreadySaveByConsultant.user.userId !== consultantId) {
        await this.prismaService.saveJobs.delete({
          where: { saveJobId: isAlreadySaveByConsultant.saveJobId },
        });
      }
    }
    // On vérifie l'unicité pour éviter les doublons
    const isUnique = await this.checkSaveJobUniqueness(
      jobListingValidedId,
      consultantId,
    );

    // Si l'emploi n'est pas déjà sauvegardé par ce consultant, créer une nouvelle sauvegarde
    if (!isUnique) {
      await this.prismaService.saveJobs.create({
        data: {
          userId: consultantId,
          jobListingId: jobListingValidedId,
        },
      });
    }
    // Ne rien faire si l'emploi est déjà sauvegardé par ce consultant
  }
  /////////////////// On vérifie l'unicité de le sauvegarde
  private async checkSaveJobUniqueness(
    jobListingId: number,
    requestingUserId: number,
  ) {
    const saveJobExists = await this.prismaService.saveJobs.findFirst({
      where: {
        jobListingId: jobListingId,
        userId: requestingUserId,
      },
    });
    if (!saveJobExists) {
      return false;
    }
    return true;
  }
  /////////////////// On vérifie si l'emploi a été sauvegardé par cet utilisateur //////////////////////////////////

  private async checkIfJobIsSavedByUser(
    jobListingId: number,
    userId: number,
  ): Promise<boolean> {
    const savedJob = await this.prismaService.saveJobs.findFirst({
      where: {
        jobListingId,
        userId,
      },
    });
    // Retourner 'true' si un enregistrement est trouvé, sinon 'false'
    return !!savedJob;
  }



  ////////////////// Fonction pour générer l'identifiant unique
  private async generateUniqueIdentifier(): Promise<string>  {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Les mois commencent à 0
  const day = now.getDate().toString().padStart(2, '0');
  const randomPart = uuidv4().split('-')[0]; //  UUID pour l'unicité

  return `${year}${month}${day}-${randomPart}`;
}
  ///////////////// La suppression en Cascade d'un job listing Id
  private async deleteJobListingOnCascade(jobListingId: number) {
    try {
      // Début d'une transaction
      await this.prismaService.$transaction(async (prisma) => {
        // On supprime tous les enregistrements liés à l'offre d'emploi

        // On supprime tous les RDV liés à l'offre d'emploi
        await prisma.appointment.deleteMany({
          where: {
            jobApplication: { jobListing: { jobListingId: jobListingId } },
          },
        });

        // On supprime toutes les candidatures liées à l'offre d'emploi
        await prisma.jobApplications.deleteMany({
          where: { jobListing: { jobListingId: jobListingId } },
        });

        // On supprime toutes les sauvegardes liées à l'offre d'emploi
        await prisma.saveJobs.deleteMany({
          where: { jobListing: { jobListingId: jobListingId } },
        });

       
      });
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  ///////////////// Action en Cascade d'un job listing Id
  private async activationJobListingAndActionOnCascade(jobListingId: number) {
    try {
      // Début d'une transaction
      await this.prismaService.$transaction(async (prisma) => {
        // On supprime toutes les candidatures liées à l'offre d'emploi
        await prisma.jobApplications.deleteMany({
          where: {
            jobListingId: jobListingId,
          },
        });
        // On supprime toutes les sauvegardes liées à l'offre d'emploi
        await prisma.saveJobs.deleteMany({
          where: { jobListing: { jobListingId: jobListingId } },
        });
      });
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  ///////////////// La suppression en Cascade d'un job listing Id
  private async closeJobListingAndActionOnCascade(jobListingId: number) {
    try {
      // Début d'une transaction
      await this.prismaService.$transaction(async (prisma) => {
        // On supprime tous les enregistrements liés à l'offre d'emploi

        // On supprime tous les RDV liés à l'offre d'emploi
        await prisma.appointment.deleteMany({
          where: {
            jobApplication: { jobListing: { jobListingId: jobListingId } },
          },
        });

        // On supprime toutes les candidatures liées à l'offre d'emploi
        await prisma.jobApplications.deleteMany({
          where: {
            jobListingId: jobListingId,
            AND: [
              {
                OR: [{ jobInterviewOK: null }, { jobInterviewOK: false }],
              },
            ],
          },
        });

        // On supprime toutes les sauvegardes liées à l'offre d'emploi
        await prisma.saveJobs.deleteMany({
          where: { jobListing: { jobListingId: jobListingId } },
        });

        // On met a jour le statut (clôturer) l'emploi de la base de données
        await prisma.jobListings.update({
          where: { jobListingId: jobListingId },
          data: {
            jobClose: true,
          },
        });
      });
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
}
