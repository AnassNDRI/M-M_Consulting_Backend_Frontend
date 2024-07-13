import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { addDays } from 'date-fns';
import { JoblistingService } from '../joblisting/joblisting.service';
import { MailerService } from '../mailer/mailer.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateJobApplicationDto } from './dto/createJobApplicationDto';
import { UpdateJobApplicationDto } from './dto/updateJobApplicationDto';
import { UpdateJobApplicationInterviewsDto } from './dto/updateJobApplicationInterviewsDto';
import { ErrorMessages } from 'src/shared/error-management/errors-message';

@Injectable()
export class JobapplicationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailerService: MailerService,
    private readonly userService: UsersService,
    private readonly jobListingService: JoblistingService,
  ) {}

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   CREATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Créer une nouvelle postulation pour un emploi @@@@@@@@@@@@@@@@@
  async createJobApplication(
    createJobApplicationDto: CreateJobApplicationDto,
    candidateId: number,
  ) {
    const { jobListingId } = createJobApplicationDto;

    // On  vérifie si l'utilisateur (requestingUserId) existe dans la base de données
    const candidate = await this.userService.verifyUsersExistence(candidateId);

    // On  vérifie si le rôle de l'utilisateur est "Candidat"
    if (candidate.role.title !== 'Candidate') {
      throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_CANDIDATE);
    }

    // On  vérifie si le jobListingId spécifié existe dans la base de données
    const jobListing =
      await this.jobListingService.verifyJobListingExistence(jobListingId);

    // On s'assure qu'on ne postule pas un emploi qui n'est pas encore validé
    if (!jobListing.validate) {
      throw new UnauthorizedException(ErrorMessages.UNVALIDATED_JOB_LISTING);
    }

    // On vérifie l'unicité de la postulation
    await this.checkJobApplicationUniqueness(
      createJobApplicationDto,
      candidateId,
    );

    const jobTitle = jobListing.jobTitle.title;
    const email = candidate.email;
    const name = candidate.name;
    const today = new Date();
    // Créer et enregistrer la candidature dans la base de données
    await this.prismaService.jobApplications.create({
      data: {
        jobListingId,
        userId: candidateId,
        actif: true,
        applicationHours: today,
      },
    });
    // On  envoie un mail de confirmation de reception de sa candidature
    await this.mailerService.sendJobApplicationAwaitingConfirmation(
      email,
      name,
      jobTitle,
    );
    // On  retourne une réponse de succès
    return { message: 'Job application successfully created' };
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   READ  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Récupérer toutes les candidatures @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllJobApplications() {
    const jobApplications = await this.prismaService.jobApplications.findMany();
    // On  retourne un message si aucune candidature n'est présente
    if (jobApplications.length === 0) {
      return { message: ErrorMessages.NO_APPLICATIONS_FOUND };
    }
    return {
      count: jobApplications.length, // Le nombre total de Postulations
      jobListings: jobApplications, // La liste des Postulations correspondants
    };
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Job Applications Where Interview is OK Acces By Consultant @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async allJobApplicationsWhereInterviewOK() {
    // Récupération de toutes les candidatures associées à cet utilisateur
    const jobApplications = await this.prismaService.jobApplications.findMany({
      where: { jobInterviewOK: true },
      include: {
        user: {
          select: {
            userId: true, // Ajoutez cette ligne
            name: true,
            firstname: true,
            jobTitle: true,
            phoneNumber: true,
            email: true,
            address: true,
            roleId: true,
          },
        },
        jobListing: {
          select: {
            user: {
              select: {
                userId: true, // Ajoutez cette ligne
                name: true,
                firstname: true,
                jobTitle: true,
                phoneNumber: true,
                email: true,
                address: true,
                roleId: true,
              },
            },
            jobTitle: {
              select: {
                title: true,
              },
            },
            jobLocation: {
              select: {
                location: true,
              },
            },
            contractType: {
              // Inclure tous les types de contrat
              select: {
                title: true,
              },
            },
            description: true,
            workingHours: true,
            workingHoursStart: true,
            workingHoursEnd: true,
            startDate: true,
            salary: true,
          },
        },
      },
    });

    // On  vérifie si des candidatures sont disponibles
    if (jobApplications.length === 0) {
      return { message: ErrorMessages.NO_POSITIVE_INTERVIEWS };
    }

    return {
      count: jobApplications.length, // Le nombre total de Postulations
      jobListings: jobApplications, // La liste des Postulations correspondants
    };
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Job Applications by User ID Acces By Consultant @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async allJobApplicationsByUserId(requestUserId: number, candidateId: number) {
    // On  vérifie si le consultant existe dans la base de donnée
    await this.userService.verifyUsersExistence(requestUserId);

    // On  vérifie si le candidat existe dans la base de donnée
    await this.userService.verifyUsersExistence(candidateId);

    // Récupération de toutes les candidatures associées à cet utilisateur
    const jobApplications = await this.prismaService.jobApplications.findMany({
      where: { userId: candidateId },
      include: {
        jobListing: {
          select: {
            description: true,
            workingHours: true,
            workingHoursStart: true,
            workingHoursEnd: true,
            startDate: true,
            salary: true,
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
        },
      },
    });

    // On  vérifie si des candidatures sont disponibles
    if (jobApplications.length === 0) {
      return {
        message: ErrorMessages.NO_APPLICATIONS_FOR_USER,
      };
    }

    return {
      count: jobApplications.length, // Le nombre total de Postulations
      jobListings: jobApplications, // La liste des Postulations correspondants
    };
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Job Applications by Job Listing ID. Acces By Consultant or Recruiter @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async allJobApplicationsByJobListingId(
    requestUserId: number,
    jobListingId: number,
  ) {
    // On  vérifie si le consultant ou le recruiter demandeur existe dans la base de donnée
    const user = await this.userService.verifyUsersExistence(requestUserId);

    // On  vérifie si le job listing existe dans la base de donnée
    const jobListing =
      await this.jobListingService.verifyJobListingExistence(jobListingId);

    // On  vérifie si le demandeur est le recruteur de l'offre d'emploi ou un consultant
    if (
      user.role.title === 'Candidat' ||
      (user.role.title === 'Recruiter' && jobListing.userId !== requestUserId)
    ) {
      throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_VIEW_APPLICATIONS);
    }

    // Récupération de toutes les candidatures associées à cette offre d'emploi
    const jobApplications = await this.prismaService.jobApplications.findMany({
      where: { jobListingId: jobListingId },
      include: {
        user: {
          select: {
            userId: true, // Ajoutez cette ligne
            name: true,
            firstname: true,
            jobTitle: true,
            phoneNumber: true,
            email: true,
            address: true,
            roleId: true,
          },
        },
        jobListing: {
          select: {
            user: {
              select: {
                userId: true, // Ajoutez cette ligne
                name: true,
                firstname: true,
                jobTitle: true,
                phoneNumber: true,
                email: true,
                address: true,
                roleId: true,
              },
            },
            jobTitle: {
              select: {
                title: true,
              },
            },
            jobLocation: {
              select: {
                location: true,
              },
            },
            contractType: {
              // Inclure tous les types de contrat
              select: {
                title: true,
              },
            },
            description: true,
            workingHours: true,
            workingHoursStart: true,
            workingHoursEnd: true,
            startDate: true,
            salary: true,
          },
        },
      },
    });

    // On  vérifie si des candidatures sont disponibles
    if (jobApplications.length === 0) {
      return {
        message:  ErrorMessages.NO_APPLICATIONS_FOR_LISTING,
      };
    }

    return {
      count: jobApplications.length, // Le nombre total de Postulations
      jobListings: jobApplications, // La liste des Postulations correspondants
    };
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Liste les candidatures par recruteur avec infos sélectionnées.  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async findJobListingsWithApplications(requestingUserId: number) {
    try {
      // Vérifier si le recruteur existe et a le rôle approprié
      const recruiter =
        await this.userService.verifyUsersExistence(requestingUserId);
      if (!recruiter || recruiter.role.title !== 'Recruiter') {
        throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_ACCESS);
      }

      // Récupérer tous les JobListings du recruteur avec les candidatures associées
      const jobListings = await this.prismaService.jobListings.findMany({
        where: {
          userId: requestingUserId,
        },
        select: {
          jobListingId: true,
          publicationDate: true,
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
          jobTitle: {
            select: {
              title: true,
            },
          },
          jobApplications: {
            // Inclure les candidatures liées à chaque JobListing
            select: {
              jobApplicationId: true,
              status: true,
              jobInterviewOK: true,
              user: {
                select: {
                  userId: true,
                  name: true,
                  firstname: true,
                  email: true,
                  sex: true,
                  dateBirth: true,
                  phoneNumber: true,
                  jobTitle: {
                    select: {
                      title: true,
                    },
                  },
                  experience: {
                    select: {
                      title: true,
                    },
                  },
                },
              },
              jobListing: {
                select: {
                  jobClose: true,
                }
              }
            },
          },
        },
      });

      // Ajout du countApply pour chaque jobListing
      const enhancedJobListings = await Promise.all(
        jobListings.map(async (jobListing) => {
          const countApply = await this.prismaService.jobApplications.count({
            where: {
              jobListingId: jobListing.jobListingId,
              status: true,
              jobInterviewOK: true,
            },
          });

          return {
            ...jobListing,
            countApply,
          };
        }),
      );

      if (enhancedJobListings.length === 0) {
        return { message: `Vous n'avez aucune offre d'emploi sauvegardée.` };
      }

      // Réponse de succès avec la structure de données attendue
      return {
        result: true,
        count: enhancedJobListings.length,
        data: enhancedJobListings, // retourne les objets jobListings complets avec countApply
        error_code: null,
        error: null,
      };
    } catch (error) {
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Liste les candidatures par recruteur avec infos sélectionnées.  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async findAllJobApplicationsFollowUpByConsultant(consultantId: number) {
    try {
      // On  vérifie si le consultant demandeur existe dans la base de donnée
      const consultant =
        await this.userService.verifyUsersExistence(consultantId);

      // On  vérifie si le demandeur est COnsultant
      if (
        !consultant ||
        (consultant.role.title !== 'Consultant' &&
          consultant.role.title !== 'Administrator')
      ) {
        throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_ACCESS);
      }

      // Trouver tous les identifiants des offres d'emploi sauvegardées par le consultant
      const savedJobListings = await this.prismaService.saveJobs.findMany({
        where: {
          userId: consultantId,
        },
        select: {
          jobListingId: true, // Sélectionner seulement les identifiants des offres d'emploi
        },
      });

      // Extraire les identifiants des offres d'emploi
      const jobListingIds = savedJobListings.map((job) => job.jobListingId);

      // Trouver toutes les candidatures liées aux offres d'emploi suivies par ce consultant
      const jobApplications = await this.prismaService.jobApplications.findMany(
        {
          where: {
            jobListingId: {
              in: jobListingIds, // Utiliser l'opérateur `in` pour filtrer par plusieurs identifiants
            },
          },
          select: {
            jobApplicationId: true,
            status: true,
            jobInterviewOK: true,
            jobListing: {
              select: {
                jobListingId: true,
                description: true,
                workingHours: true,
                workingHoursStart: true,
                workingHoursEnd: true,
                publicationDate: true,
                startDate: true,
                salary: true,

                jobTitle: {
                  select: {
                    title: true,
                  },
                },
                user: {
                  select: {
                    userId: true,
                    name: true,
                    firstname: true,
                    email: true,
                    nameCompany: true,
                    dateBirth: true,
                    phoneNumber: true,
                  },
                },
              },
            },
            user: {
              select: {
                userId: true,
                name: true,
                firstname: true,
                email: true,
                sex: true,
                dateBirth: true,
                jobTitle: {
                  select: {
                    title: true,
                  },
                },
                phoneNumber: true,
              },
            },
          },
        },
      );

      // Renvoie les candidatures et leur nombre total
      return {
        result: true,
        count: jobApplications.length, // Ajoutez count ici, au même niveau que 'data'
        data: jobApplications, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
















































  

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Job Applications of the Candidate Access By Candidate @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async allJobApplicationsOfCandidat(candidateId: number) {
    try {
      // On  vérifie si le candidat existe dans la base de donnée
      await this.userService.verifyUsersExistence(candidateId);

      // Récupération de toutes les candidatures associées à cet utilisateur
      const jobApplications = await this.prismaService.jobApplications.findMany(
        {
          where: {
            userId: candidateId,
            actif: true,
          },
          include: {
            jobListing: {
              select: {
                jobListingId: true,
                description: true,
                workingHours: true,
                workingHoursStart: true,
                workingHoursEnd: true,
                publicationDate: true,
                startDate: true,
                salary: true,
                contractType: {
                  select: {
                    title: true,
                  },
                },
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
                  },
                },
                jobLocation: {
                  select: {
                    location: true,
                  },
                },
              },
            },
          },
        },
      );

      // On  vérifie si des candidatures sont disponibles
      if (jobApplications.length === 0) {
        return {
          result: false,
          data: `Vous n'avez aucune de postulation en cours.`,
          count: jobApplications.length,
          error_code: null,
          error: null,
        };
      }
      // On retourne une réponse de succès
      return {
        result: true,
        data: jobApplications, // La liste des Postulations correspondants
        count: jobApplications.length, // Le nombre total de Postulations
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Job Application Detail Access by Admin, Consultant, Recruiter candidate  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async jobApplicationDetail(
    jobApplicationId: number,
    requestingUserId: number,
  ) {
    try {
      // On  vérifie si l'utilisateur (requestingUserId) existe dans la base de données
      const user =
        await this.userService.verifyUsersExistence(requestingUserId);

      // On  vérifie si le jobApplicationId spécifié existe dans la base de données
      await this.verifyJobApplicationExistence(jobApplicationId);

      // Récupérer les détails de la candidature
      const jobApplication =
        await this.prismaService.jobApplications.findUnique({
          where: { jobApplicationId },
          include: {
            user: {
              select: {
                userId: true,
                name: true,
                firstname: true,
                jobTitle: true,
                phoneNumber: true,
                email: true,
                address: true,
                roleId: true,
              },
            },
            jobListing: {
              select: {
                user: {
                  select: {
                    userId: true,
                    name: true,
                    firstname: true,
                    nameCompany: true,
                    jobTitle: true,
                    phoneNumber: true,
                    email: true,
                    address: true,
                    roleId: true,
                  },
                },
                jobTitle: {
                  select: {
                    title: true,
                  },
                },
                jobLocation: {
                  select: {
                    location: true,
                  },
                },
                contractType: {
                  // Inclure tous les types de contrat
                  select: {
                    title: true,
                  },
                },
                description: true,
                workingHours: true,
                workingHoursStart: true,
                workingHoursEnd: true,
                startDate: true,
                salary: true,
              },
            },
          },
        });

      if (!jobApplication) {
        throw new NotFoundException(ErrorMessages.NOT_FOUND_APPLICATION);
      }

      if (user.role.title === 'Recruiter' || user.role.title === 'Candidat') {
        // Vérifie si l'utilisateur est autorisé à voir les détails de la candidature
        if (
          (user.role.title === 'Candidat' &&
            jobApplication.userId !== user.userId) || // Est-ce le candidate ?
          (user.role.title === 'Recruiter' &&
            jobApplication.jobListing.user.userId !== user.userId)
        ) {
          // Est le Recruteur Publicateur de l'annonce ?
          throw new UnauthorizedException(
            `Vous n'êtes pas autorisé à voir les détails de cette candidature car vous n'êtes ni le candidat concerné, ni le recruteur ayant publié l'offre.`,
          );
        }
      }

      // On retourne une réponse de succès
      return {
        result: true,
        data: jobApplication, // La liste des Postulations correspondants
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   UPDATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Mettre à jour le statut de la candidature @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async validateJobApplication(
    jobApplicationId: number,
    consultantId: number,
    updateJobApplicationDto: UpdateJobApplicationDto,
  ) {
    try {
      const { status } = updateJobApplicationDto;

      // Récupérer les informations de l'utilisateur demandant la modification
      const requestingConsultant =
        await this.userService.verifyUsersExistence(consultantId);

      // on recupère le nom et prenom du consultant traitant
      const consultantName =
        requestingConsultant.name + ' ' + requestingConsultant.firstname;

      const jobApplication =
        await this.verifyJobApplicationExistence(jobApplicationId);

      // On s'assure qu'on ne postule pas un emploi qui n'est pas encore validé
      if (!jobApplication.jobListing.validate) {
        throw new UnauthorizedException(ErrorMessages.UNVALIDATED_JOB_LISTING);
      }

      // On  vérifie si jobApplication a déjà été validé ou non
      if (jobApplication.status === status) {
        // La candidature a déjà le statut souhaité.
        throw new BadRequestException(ErrorMessages.APPLICATION_STATUS_SAME);
      }

      if (status) {
        // On  vérifie si l'utilisateur a deja est déjà accepté pour un 1er RDV
        await this.verifyJobApplicationStatusExistence(jobApplication.userId);
        // On vérifie si le nombre de candidat a retenir demandé par Clent est atteint
        await this.verifyNumberOfCandidates(jobApplication.jobListingId);

        // Mettre à jour le statut de la candidature dans la base de données
        await this.prismaService.jobApplications.update({
          where: { jobApplicationId },
          data: {
            status,
            checkJobAppliByConsultant: consultantName,
          },
        });
        // On  envoie un email de confirmation de l'acceptation de la candidature
        await this.mailerService.sendJobApplicationAccepted(
          jobApplication.user.name,
          jobApplication.user.email,
          jobApplication.jobListing.jobTitle.title,
        );
      } else {
        // On  envoie un email d'échec de la candidature
        await this.mailerService.sendJobApplicationNotAccepted(
          jobApplication.user.name,
          jobApplication.user.firstname,
          jobApplication.user.email,
          jobApplication.jobListing.jobTitle.title,
        );
        // Desactiver la candidature la postulation
        await this.prismaService.jobApplications.update({
          where: { jobApplicationId: jobApplicationId },
          data: {
            actif: false,
            status: false,
          },
        });
      }

      // On retourne la liste complète des fonctions
      return {
        result: true,
        data: { data: 'Statut de la candidature mis à jour avec succès' }, // Directement le tableau des jobListings
        error_code: null,
        error: null,
      };
    } catch (error) {
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Resultat apres Entretien d'embauche @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async resultJobApplicationInterviews(
    jobApplicationId: number,
    updateJobApplicationInterviewsDto: UpdateJobApplicationInterviewsDto,
    requestingUserId: number,
  ) {
    try {
      const { jobInterviewOK } = updateJobApplicationInterviewsDto;

      // Récupérer les informations de l'utilisateur demandant la modification
      const requestingConsultant =
        await this.userService.verifyUsersExistence(requestingUserId);

      // on recupère le nom et prenom du consultant traitant
      const consultantName =
        requestingConsultant.name + ' ' + requestingConsultant.firstname;

      // On  vérifie si la candidature spécifiée existe
      const jobApplication =
        await this.verifyJobApplicationExistence(jobApplicationId);

      if (!jobApplication.jobListing.validate) {
        throw new UnauthorizedException(ErrorMessages.UNVALIDATED_JOB_LISTING);
      }
      if (!jobApplication.status) {
        throw new UnauthorizedException(ErrorMessages.NO_INTERVIEW_NOTIFICATION);
      }

      // On  vérifie si jobApplication a déjà été validé ou non
      if (jobApplication.jobInterviewOK === jobInterviewOK) {
        // La candidature a déjà le statut souhaité, on retourne alors un message indiquant que l'action a déjà été effectuée
        throw new BadRequestException(ErrorMessages.APPLICATION_STATUS_SAME);
      }

      if (jobInterviewOK) {
        // On va chercher le nombre de Candidats déjà retenu
         await this.verifiyNumberOfCandidates(
          jobApplication.jobListingId,
          jobApplication.jobListing.numberOfCandidates
        );

        // On vérifie si le nombre de candidats à recruter n'est pas atteint
       
        //On verifie si le Consultant a ajouter une note des info pertinente sur le candidat lors de l'interview.
        // interviewNote.trim() === '' : Vérifie si interviewNote est une chaîne vide après avoir supprimé les espaces au début et à la fin de la chaîne.
        if (
          !jobApplication.user.interviewNote ||
          jobApplication.user.interviewNote.trim() === ''
        ) {
          throw new BadRequestException(ErrorMessages.MISSING_INTERVIEW_NOTE);
        }

        const deadlineToCloseJobApplication = addDays(new Date(), 30); // Ajoute 30 jours à jourd'hui pour cloturer et supprimer la candidature

        // Mettre à jour le statut de la candidature dans la base de données
        const jobApplicationAfterInterview =
          await this.prismaService.jobApplications.update({
            where: { jobApplicationId },
            data: {
              jobInterviewOK,
              checkJobAppliByConsultant: consultantName,
              interviewNote: jobApplication.user.interviewNote,
              deadlineToDelete: deadlineToCloseJobApplication,
            },
            select: {
              jobApplicationId: true,
              status: true,
              jobInterviewOK: true,
              interviewNote: true,
              jobListing: {
                select: {
                  user: {
                    select: {
                      userId: true,
                      name: true,
                      firstname: true,
                      nameCompany: true,
                      email: true,
                    },
                  },
                  jobTitle: {
                    select: {
                      title: true,
                    },
                  },
                },
              },
              user: {
                select: {
                  userId: true,
                  name: true,
                  firstname: true,
                  email: true,
                  interviewNote: true,
                  experience: true,
                },
              },
            },
          });
        /*/  // On recupère la note de l'entretien
      const coverNote = jobApplicationAfterInterview.interviewNote;
      // On va recupérer le Id du jobListing associé pour mettre à true la variable JobClose ( Empecher de sauvegarder des emploi clos)
      const jobListingClosedId =
        jobApplicationAfterInterview.jobListing.jobListingId;

      // Mettre à jour jobClose du joblisting associé
      await this.prismaService.jobListings.update({
        where: { jobListingId: jobListingClosedId },
        data: {
          jobClose: true,
        },
      }); */

        // On  envoie un email de confirmation de Promesse d'engagement
        await this.mailerService.sendJobApplicationInterviewAccepted(
          jobApplicationAfterInterview.user.name,
          jobApplicationAfterInterview.user.email,
          jobApplicationAfterInterview.jobListing.jobTitle.title,
          jobApplicationAfterInterview.jobListing.user.nameCompany,
        );

         // On  envoie un email avec le CV du candidat au recruteur
      // On  envoie un email avec le CV du candidat au recruteur
      const recruiterName = jobApplicationAfterInterview.jobListing.user.name + ' ' +
        jobApplicationAfterInterview.jobListing.user.firstname;
      const recruiterEmail = jobApplicationAfterInterview.jobListing.user.email;
      const jobTitle = jobApplicationAfterInterview.jobListing.jobTitle.title;
      const candidateName = jobApplicationAfterInterview.user.firstname + ' ' +
        jobApplicationAfterInterview.user.name;
      const interviewNote = jobApplicationAfterInterview.user.interviewNote;
      const userId = jobApplicationAfterInterview.user.userId;

      await this.mailerService.sendCvToRecruiter(
        recruiterName,
        recruiterEmail,
        jobTitle,
        candidateName,
        interviewNote,
        userId,
      );
      } else {
        // On  envoie un email de non retenu apres l'interview
        await this.mailerService.sendJobApplicationInterviewNotAccepted(
          jobApplication.user.name,
          jobApplication.user.email,
          jobApplication.jobListing.jobTitle.title,
        );
        // Desactiver la candidature la postulation
        await this.prismaService.jobApplications.update({
          where: { jobApplicationId: jobApplicationId },
          data: {
            actif: false,
            status: false,
            jobInterviewOK: false,
          },
        });

        // On va egalement supprimer le RDV
        await this.prismaService.appointment.delete({
          where: { jobApplicationId: jobApplicationId },
        });
      }
      // On  retourne une réponse de succès

      return {
        result: true,
        data: { data: 'Statut de la candidature mis à jour avec succès' },
        error_code: null,
        error: null,
      };
    } catch (error) {
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Update Notification @@@@@@@@@@@@@@@@@@@@
  async updateAddNoteInterview(jobApplicationId: number) {
    try {
      // On verifie si l'utilisateur existe
      const jobapplication =
        await this.verifyJobApplicationExistence(jobApplicationId);

      if (
        jobapplication.user! &&
        jobapplication.user.role.title !== 'Candidate'
      ) {
        throw new BadRequestException(ErrorMessages.NOTE_ALREADY_EXISTS);
      }
      // Mettre à jour l'utilisateur
      await this.prismaService.users.update({
        where: { userId: jobapplication.user.userId },
        data: {
          addNote: true,
        },
      });
      // On retourne la liste complète des nom de company
      return {
        result: true,
        data: 'Success',
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   DELETE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Delete a Job application. Acces by Consultant @@@@@@@@@@@@@@@@@
  async deleteJobApplication(
    jobApplicationId: number,
    requestingUserId: number,
  ) {
    // Récupérer la postulation d'emploi
    const jobApplication =
      await this.verifyJobApplicationExistence(jobApplicationId);

    // On verifie l'utilisateur demandeur de la requete et on recupere ces informations
    const requestingUser =
      await this.userService.verifyUsersExistence(requestingUserId);

    // On  vérifie si l'utilisateur est un consultant/administrateur ou le candidat associé à la postulation
    if (
      !(
        requestingUser.role.title === 'Consultant' ||
        requestingUser.role.title === 'Administrator' ||
        jobApplication.user.userId === requestingUserId
      )
    ) {
      throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_DELETE);
    }

    // Supprimer la postulation de la base de données
    await this.deleteJoApplicationsOnCascade(jobApplicationId);

    // On  retourne une réponse de succès
    return { message: 'Job application successfully deleted' };
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Delete my Job application. Acces by Candidate @@@@@@@@@@@@@@@@@
  async deleteMyJobApplication(
    jobApplicationId: number,
    requestingUserId: number,
  ) {
    // Récupérer la postulation d'emploi
    const jobApplication =
      await this.verifyJobApplicationExistence(jobApplicationId);

    // On verifie l'utilisateur demandeur de la requete et on recupere ces informations
    const requestingUser =
      await this.userService.verifyUsersExistence(requestingUserId);

    // On  vérifie si l'utilisateur est le candidat associé à la postulation
    if (jobApplication.user.userId !== requestingUser.userId) {
      throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_DELETE_CANDIDATE);
    }

    // Supprimer la postulation de la base de données
    await this.deleteJoApplicationsOnCascade(jobApplicationId);

    // On  retourne une réponse de succès
    return { message: 'Job application successfully deleted' };
  }

  /*
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Delete all Job application where deadline now @@@@@@@@@@@@@@@@@
  async deleteAllJobApplicationWhereDeadlineIsNow() {
    const startOfToday = startOfDay(new Date()); // Date d'aujourd'hui à minuit

    await this.prismaService.$transaction(async (prisma) => {
      // Trouver d'abord tous les jobApplications à supprimer
      const jobApplicationsToDelete = await prisma.jobApplications.findMany({
        where: {
          deadlineToDelete: {
            lte: startOfToday,
          },
        },
        select: {
          jobApplicationId: true, // Sélectionner uniquement jobApplicationId pour la suppression des RDV
        },
      });

      // Supprimer tous les RDV liés aux candidatures trouvées
      for (const jobApplication of jobApplicationsToDelete) {
        await prisma.appointment.deleteMany({
          where: { jobApplicationId: jobApplication.jobApplicationId },
        });
      }

      // Ensuite, supprimer toutes les candidatures trouvées en une seule opération
      const deleteResult = await prisma.jobApplications.deleteMany({
        where: {
          deadlineToDelete: {
            lte: startOfToday,
          },
        },
      });

      if (deleteResult.count > 0) {
        return {
          message: `Nombre de candidatures expirées et supprimées: ${deleteResult.count}.`,
        };
      } else {
        return { message: `Il n'y a aucune candidature clôturée et expirée.` };
      }
    });
  }
*/
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   Fonctions Privée  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // Fonction pour On  vérifie l'existance de la candidature
  async verifyJobApplicationExistence(jobApplicationId: number) {
    const jobApplication = await this.prismaService.jobApplications.findUnique({
      where: {
        jobApplicationId: jobApplicationId,
      },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            email: true,
            firstname: true,
            interviewNote: true,
            cv: true,
            role: true,
          },
        },
        jobListing: {
          select: {
            validate: true,
            jobClose: true,
            numberOfCandidates: true,
            user: {
              select: {
                userId: true,
                name: true,
                email: true,
                firstname: true,
                nameCompany: true,
                addressCompany: true,
                role: {
                  select: {
                    title: true,
                  },
                },
              },
            },
            jobApplications: true,
            jobTitle: true,
          },
        }, // Inclure les détails de l'offre d'emploi pour accéder à l'ID du recruteur
      },
    });

    if (!jobApplication) {
      throw new NotFoundException(ErrorMessages.NOT_FOUND_APPLICATION);
    }

    return jobApplication;
  }

  // Fonction pour vérifier si l'utilisateur a deja est déjà accepté pour un 1er RDV
  async verifyJobApplicationStatusExistence(userId: number) {
    const jobApplication = await this.prismaService.jobApplications.findFirst({
      where: {
        userId: userId,
        status: true,
        jobListing: {
          jobClose: false,
        },
      },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
          },
        },
        jobListing: {
          select: {
            checkJobListingByConsultant: true,
            user: {
              select: {
                nameCompany: true,
              },
            },
            jobTitle: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (jobApplication) {
     /* throw new NotFoundException(
        `Ce candidat est déjà prévu en entretien avec <strong>${jobApplication.jobListing.checkJobListingByConsultant}</strong> pour l'offre 
        <strong>${jobApplication.jobListing.jobTitle.title}</strong> de la société : <strong>${jobApplication.jobListing.user.nameCompany}</strong>.<br>
        Veuillez attendre la clôture de l'offre.`,
      );*/
      throw new NotFoundException(
        ErrorMessages.ALREADY_SCHEDULED_INTERVIEW
          .replace('{consultantName}', jobApplication.jobListing.checkJobListingByConsultant)
          .replace('{jobTitle}', jobApplication.jobListing.jobTitle.title)
          .replace('{companyName}', jobApplication.jobListing.user.nameCompany)
      );
    }
  }

  // Fonction pour vérifier si le nombre de candidat a retenir demandé par Clent est atteint
  async verifyNumberOfCandidates(jobListingId: number) {
    // Récupérer le jobListing pour obtenir le nombre de candidats maximum
    const jobListing = await this.prismaService.jobListings.findUnique({
      where: {
        jobListingId: jobListingId,
      },
      select: {
        numberOfCandidates: true,
      },
    });

    if (!jobListing) {
      throw new NotFoundException(ErrorMessages.JOB_LISTING_NOT_FOUND);
    }

    const numberOfCandidatesRequestedByRecruiter = jobListing.numberOfCandidates;

    // Compter le nombre de candidatures valides pour ce jobListing
    const validatedJobApplicationsCount = await this.prismaService.jobApplications.count(
      {
        where: {
          jobListingId: jobListingId,
          status: true,
          jobInterviewOK: true,
          jobListing: {
            jobClose: false,
          },
        },
      },
    );

    if (validatedJobApplicationsCount >= numberOfCandidatesRequestedByRecruiter) {
     /* throw new NotFoundException(
        `Le nombre <strong>(${numberOfCandidatesRequestedByRecruiter})</strong> de candidats à retenir, demandé par le client est atteint.<br>
        Veuillez clôturer cette offre !`,
      );*/
      ErrorMessages.CANDIDATE_LIMIT_REACHED.replace('{maxCandidates}', numberOfCandidatesRequestedByRecruiter.toString())
      
    }
  }

  // On vérifie l'unicité de la postulation
  async checkJobApplicationUniqueness(
    createJobListingDto: CreateJobApplicationDto,
    candidateId: number,
  ): Promise<void> {
    const { jobListingId } = createJobListingDto;
    const jobApplicationExists =
      await this.prismaService.jobApplications.findFirst({
        where: {
          jobListingId: jobListingId,
          userId: candidateId,
        },
      });
    if (jobApplicationExists) {
      throw new ConflictException(ErrorMessages.DUPLICATE_APPLICATION);
    }
  }

  //// Compter le nombre de candidature liée à l'offre
    async verifiyNumberOfCandidates(jobListingId: number, maxCandidates: number): Promise<void> {
      const numberOfCandidates = await this.prismaService.jobApplications.count({
        where: {
          jobListingId: jobListingId,
          status: true,
          jobInterviewOK: true,
        },
      });
  
      // Vérifier si le nombre de candidats à recruter est atteint
      if (numberOfCandidates  >= maxCandidates) {
        throw new BadRequestException(ErrorMessages.RECRUITMENT_LIMIT_REACHED);
      }
    }
  

  ///////////////// La suppression en Cascade d'un job listing Id
  async deleteJoApplicationsOnCascade(jobApplicationId: number) {
    // Début d'une transaction
    await this.prismaService.$transaction(async (prisma) => {
      // On supprime tous les RDV liés à la candidature
      await prisma.appointment.deleteMany({
        where: { jobApplication: { jobApplicationId: jobApplicationId } },
      });

      // On supprime la candidature de la base de données
      await prisma.jobApplications.delete({
        where: { jobApplicationId: jobApplicationId },
      });
    });
  }
}
