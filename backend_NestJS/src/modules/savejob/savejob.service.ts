import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { differenceInDays } from 'date-fns';
import { JoblistingService } from '../joblisting/joblisting.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateSavejobDto } from './dto/createSavejobDto';
import { UpdateSaveJobDto } from './dto/updateSaveJobDto';
import { ErrorMessages } from 'src/shared/error-management/errors-message';

@Injectable()
export class SavejobService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UsersService,
    private readonly jobListingService: JoblistingService,
  ) {}

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   CREATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Save a job @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async createSaveJob(
    createSavejobDto: CreateSavejobDto,
    requestingUserId: number,
  ) {
    try {
      const { jobListingId } = createSavejobDto;

      // On verifie son existence dans la BD
      const requestingUser =
        await this.userService.verifyUsersExistence(requestingUserId);

      // On vérifie le rôle pour s'assurer que l'utilisateur est bien un consultant ou un Candidat
      if (
        !requestingUser.role ||
        !(
          requestingUser.role.title === 'Administrator' ||
          requestingUser.role.title === 'Consultant' ||
          requestingUser.role.title === 'Candidate'
        )
      ) {
        throw new UnauthorizedException( ErrorMessages.UNAUTHORIZED_ROLE);
      }
      // On verifie l'existence du jobListing
      const jobListing =
        await this.jobListingService.verifyJobListingExistence(jobListingId);

      if (requestingUser.role.title === 'Candidate' && !jobListing.validate) {
        throw new UnauthorizedException( ErrorMessages.JOB_NOT_VALIDATED);
      }

      // On verifie que l'offre n'est pas cloturée
      if (jobListing.jobClose) {
        throw new UnauthorizedException( ErrorMessages.NOT_SAVE_JOB_CLOSED);
      }

      // On vérifie l'unicité de la sauvegarde
      await this.checkSaveJobUniqueness(createSavejobDto, requestingUserId);

      // On empêche que 2 Consultants sauvegardent la même offre d'emploi
      if (requestingUser.role.title === 'Consultant') {
        // On verifie que cette offre n'est déjà été sauvée par un autre consultant.
        await this.checkJoblistingAlreadySaveJobByConsultant(jobListingId);
      }
      // On crée et on enregistre la sauvegarde dans la base de données
      const savedJob = await this.prismaService.saveJobs.create({
        data: {
          jobListingId,
          userId: requestingUserId,
        },
      });

      // On retourne une réponse de succès
      return {
        result: true,
        data: savedJob,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   READ  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Jobs saved By All Consultants @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllSaveJobsByConsultant() {
    const consultantRole = 'Consultant';

    const saveJobs = await this.prismaService.saveJobs.findMany({
      where: {
        user: {
          role: {
            title: consultantRole,
          },
        },
      },
      include: {
        user: true,
        jobListing: true,
      },
    });

    if (saveJobs.length === 0) {
      return { message: `Aucun emploi sauvé dans la base de données.` };
    }
    return saveJobs;
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Jobs saved By All Candidates  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllSaveJobsCandidates() {
    const consultantRole = 'Candidate';

    const saveJobs = await this.prismaService.saveJobs.findMany({
      where: {
        user: {
          role: {
            title: consultantRole,
          },
        },
      },
      include: {
        user: {
          select: {
            name: true,
            firstname: true,
            dateBirth: true,
            sex: true,
            phoneNumber: true,
            email: true,
          },
        },
        jobListing: {
          select: {
            description: true,
            workingHours: true,
            workingHoursStart: true,
            workingHoursEnd: true,
            startDate: true,
            salary: true,
            deadline: true,
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
        },
      },
    });
    if (saveJobs.length === 0) {
      return { message: `Aucun emploi sauvé dans la base de donnée.` };
    }
    return saveJobs;
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   All Jobs saved  By Candidate Or Consultant @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async myAllJobsSaved(requestingUserId: number) {
    try {
      const now = new Date();
      // Vérification de l'existence du candidat
      await this.userService.verifyUsersExistence(requestingUserId);

      // Récupération des offres d'emploi sauvegardées par le candidat
      const jobsSaved = await this.prismaService.saveJobs.findMany({
        where: { userId: requestingUserId },
        orderBy: {
          jobListing: {
            publicationDate: 'desc', // Ajout du tri par date de publication, du plus récent au plus ancien
          },
        },
        include: {
          jobListing: {
            select: {
              jobListingId: true,
              description: true,
              responsibilities: true,
              requiredQualifications: true,
              benefits: true,
              workingHours: true,
              workingHoursStart: true,
              workingHoursEnd: true,
              startDate: true,
              salary: true,
              deadline: true,
              dayAgo: true,
              numberOfCandidates: true,
              publicationDate: true,
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
          },
        },
      });

      // Calculer 'dayAgo' pour chaque jobListing et ajouter 'isSaved'
      const enhancedJobListings = jobsSaved.map((jobSaved) => {
        if (jobSaved.jobListing && jobSaved.jobListing.publicationDate) {
          const dayAgo = differenceInDays(
            now,
            new Date(jobSaved.jobListing.publicationDate),
          );
          // Ajout dynamique des propriétés
          return {
            ...jobSaved,
            jobListing: {
              ...jobSaved.jobListing,
              dayAgo,
              isSaved: true,
            },
          };
        }
        return jobSaved;
      });

      if (enhancedJobListings.length === 0) {
        return {
          result: false,
          count: 0,
          data: `Vous n'avez aucune offre d'emploi sauvegardée.`,
          error_code: null,
          error: null,
        };
      }

      // Réponse de succès avec la structure de données attendue
      return {
        result: true,
        count: enhancedJobListings.length,
        data: enhancedJobListings, // retourne les objets jobsSaved complets
        error_code: null,
        error: null,
      };
    } catch (error) {
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Jobs saved of the Consultant Access By Consultant Only @@@@@@@@@@@@@@@@@@@@@@@@@@@
  async myAllJobsSavedConsultant(consultantId: number) {
    try {
      // Vérification de l'existence du consultant
      await this.userService.verifyUsersExistence(consultantId);
      // Récupération des offres d'emploi sauvegardées par le consultant
      const jobsSaved = await this.prismaService.saveJobs.findMany({
        where: { userId: consultantId },
        include: {
          jobListing: {
            select: {
              jobListingId: true,
              description: true,
              workingHours: true,
              workingHoursStart: true,
              workingHoursEnd: true,
              startDate: true,
              dayAgo: true,
              salary: true,
              noteJoblisting: true,
              deadline: true,
              deadlineExpires: true,
              validate: true,
              invalidatyToDelete: true,
              numberOfCandidates: true,
              jobClose: true,
              checkJobListingByConsultant: true,
              publicationDate: true,
              user: {
                select: {
                  userId: true,
                  name: true,
                  firstname: true,
                  email: true,
                  phoneNumber: true,
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
                select: {
                  title: true,
                },
              },
              jobLocation: {
                select: {
                  location: true,
                },
              },
              jobApplications: {
                where: {
                  actif: true, // Filtrer pour inclure uniquement les candidatures actives
                },
                select: {
                  jobApplicationId: true,
                  appointmentId: true,
                  applicationHours: true,
                  status: true,
                  jobInterviewOK: true,
                  userId: true,
                  checkJobAppliByConsultant: true,
                  deadlineToDelete: true,
                  actif: true,
                  createdAt: true,
                  user: {
                    select: {
                      userId: true,
                      name: true,
                      addNote: true,
                      firstname: true,
                      interviewNote: true,
                      dateBirth: true,
                      email: true,
                      sex: true,
                      phoneNumber: true,
                      jobTitle: {
                        select: {
                          title: true,
                        },
                      },
                      experience: true,
                    },
                  },
                  appointment: {
                    include: {
                      timeSlots: true,
                      
                    },
                  },
                },
                orderBy: [
                  { jobInterviewOK: 'desc' }, // Trier par jobInterviewOK true en premier
                  { appointment: { createdAt: 'asc' } }, // Ensuite trier par appointment.createdAt (les plus anciens en premier)
                  { status: 'desc' }, // Ensuite trier par status true en premier
                  { createdAt: 'asc' }, // Enfin trier par createdAt avec les plus anciens en haut
                ],
              },
            },
          },
        },
      });

      // Ajout du countApply pour chaque jobListing
      const enhancedJobsSaved = await Promise.all(
        jobsSaved.map(async (jobSaved) => {
          const countApply = await this.prismaService.jobApplications.count({
            where: {
              jobListingId: jobSaved.jobListing.jobListingId,
              status: true,
              jobInterviewOK: true,
            },
          });

          return {
            ...jobSaved,
            jobListing: {
              ...jobSaved.jobListing,
              countApply,
            },
          };
        }),
      );

      if (enhancedJobsSaved.length === 0) {
        return { message: `Vous n'avez aucune offre d'emploi sauvegardée.` };
      }
      // Réponse de succès avec la structure de données attendue
      return {
        result: true,
        count: enhancedJobsSaved.length,
        data: enhancedJobsSaved, // retourne les objets jobsSaved complets avec countApply
        error_code: null,
        error: null,
      };
    } catch (error) {
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   Jobs saved Detail by jobSavedId Access By Consultant Only @@@@@@@@@@@@@@@@@@@@@@@@@@@ consultant
  async detailConsultantJobsSavedByJobsaveId(saveJobId: number) {
    // On vérifie l'existence de la sauvegarde
    await this.verifySaveJobExistence(saveJobId);

    const detailJobSaved = await this.prismaService.saveJobs.findUnique({
      where: { saveJobId },
      include: {
        jobListing: {
          select: {
            description: true,
            workingHours: true,
            workingHoursStart: true,
            workingHoursEnd: true,
            startDate: true,
            salary: true,
            noteJoblisting: true,
            deadline: true,
            deadlineExpires: true,
            validate: true,
            invalidatyToDelete: true,
            jobClose: true,
            checkJobListingByConsultant: true,
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
    return detailJobSaved;
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   Jobs saved Detail by jobSavedId Access By Consultant Only @@@@@@@@@@@@@@@@@@@@@@@@@@@
  async detailCandidateJobsSavedByJobsaveId(
    saveJobId: number,
    candidateId: number,
  ) {
    // On vérifie l'existence de la sauvegarde
    await this.verifySaveJobExistence(saveJobId);

    // On vérifie l'existence de l'utilisateur qui fait la demande et on s'assure que le job save lui appartient
    await this.userService.verifyUsersExistence(candidateId);

    const detailJobSaved = await this.prismaService.saveJobs.findUnique({
      where: { saveJobId: saveJobId, userId: candidateId },
      include: {
        jobListing: {
          select: {
            description: true,
            workingHours: true,
            workingHoursStart: true,
            workingHoursEnd: true,
            startDate: true,
            salary: true,
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
    return detailJobSaved;
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   all job list offer save by jobListingId. Access By Consultant Only @@@@@@@@@@@@@@@@@@@@@@@@@@@ check the postualation
  async getAllJobsSavedByJobListingId(jobListingId: number) {
    // On vérifie l'existence de la sauvegarde
    await this.jobListingService.verifyJobListingExistence(jobListingId);
    const RoleTitle = 'Candidate';

    const JobListingsSaved = await this.prismaService.saveJobs.findMany({
      where: {
        jobListingId: jobListingId,
        user: {
          role: {
            title: RoleTitle,
          },
        },
      },
      include: {
        jobListing: {
          select: {
            description: true,
            workingHours: true,
            workingHoursStart: true,
            workingHoursEnd: true,
            startDate: true,
            salary: true,
            noteJoblisting: true,
            deadline: true,
            deadlineExpires: true,
            validate: true,
            invalidatyToDelete: true,
            jobClose: true,
            checkJobListingByConsultant: true,
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
    if (JobListingsSaved.length === 0) {
      return { message: `Aucune sauvegarde pour cette offre d'emploi.` };
    }

    return JobListingsSaved;
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  search all Jobs saved by ConsultantId  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllJobsSavedByConsultantId(
    consultantId: number,
    requestUserId: number,
  ) {
    // On vérifie l'existence et le rôle de l'utilisateur qui fait la demande
    const requestUser =
      await this.userService.verifyUsersExistence(requestUserId);

    if (
      !requestUser ||
      !(
        requestUser.role.title === 'Consultant' ||
        requestUser.role.title === 'Administrator'
      )
    ) {
     
      throw new UnauthorizedException( ErrorMessages.UNAUTHORIZED_VIEW);
    }
    // On vérifie l'existence et le rôle du consultant
    const consultant =
      await this.userService.verifyUsersExistence(consultantId);

    if (!consultant || consultant.role.title !== 'Consultant') {
      throw new UnauthorizedException( ErrorMessages.UNAUTHORIZED_USER);
    }
    const JobListingsSaved = await this.prismaService.saveJobs.findMany({
      where: {
        userId: consultantId, // On filtre les emplois sauvegardés par l'ID du consultant
      },
      include: {
        jobListing: {
          select: {
            description: true,
            workingHours: true,
            workingHoursStart: true,
            workingHoursEnd: true,
            startDate: true,
            salary: true,
            noteJoblisting: true,
            deadline: true,
            deadlineExpires: true,
            validate: true,
            invalidatyToDelete: true,
            jobClose: true,
            checkJobListingByConsultant: true,
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
    if (JobListingsSaved.length === 0) {
      return { message: `Aucune sauvegarde trouvée pour ce consultant.` };
    }

    return JobListingsSaved;
  }

  //********************************************** The Counts *************************************************/
  //*********************************************************************************************************//

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Count all Jobs saved By All Consultants   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async countAllSaveJobsByConsultant() {
    const consultantRole = 'Consultant';

    const saveJobs = await this.prismaService.saveJobs.count({
      where: {
        user: {
          role: {
            title: consultantRole,
          },
        },
      },
    });

    if (saveJobs === 0) {
      return {
        message: `Aucun emploi sauvé par les consultants dans la base de données .`,
      };
    }
    return saveJobs;
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Count all Jobs saved By All Candidates  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async countAllSaveJobsCandidates() {
    const consultantRole = 'Candidate';

    const saveJobs = await this.prismaService.saveJobs.count({
      where: {
        user: {
          role: {
            title: consultantRole,
          },
        },
      },
    });
    if (saveJobs === 0) {
      return {
        message: `Aucun emploi sauvé par les candidats dans la base de donnée.`,
      };
    }
    return saveJobs;
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Jobs saved of the Candidate Access By Candidate @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async countMyAllJobsSavedCandidate(candidateId: number) {
    // On vérifie si le candidat existe dans la base de donnée
    await this.userService.verifyUsersExistence(candidateId);

    // Récupération de toutes les offres d'emploi sauvegardées par le candidat
    const jobsSaved = await this.prismaService.saveJobs.count({
      where: { userId: candidateId },
    });
    if (jobsSaved === 0) {
      return { message: `Vous n'avez aucune offre d'emploi sauvegardée.` };
    }
    return jobsSaved;
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  COunt All Jobs saved of the Consultant Access By Consultant Only @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async countMyAllJobsSavedConsulant(consulatantId: number) {
    // On vérifie si le candidat existe dans la base de donnée
    await this.userService.verifyUsersExistence(consulatantId);
    // Récupération de toutes les offres d'emploi sauvegardées par le candidat
    const jobsSaved = await this.prismaService.saveJobs.count({
      where: { userId: consulatantId },
    });
    if (jobsSaved === 0) {
      return { message: `Vous n'avez aucune offre d'emploi sauvegardée.` };
    }
    return jobsSaved;
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Count  Jobs saved Detail by jobSavedId Access By Consultant Only @@@@@@@@@@@@@@@@@@@@@@@@@@@ check the postualation
  async countAllJobsSavedByJobListingId(jobListingId: number) {
    // On vérifie l'existence de la sauvegarde
    await this.jobListingService.verifyJobListingExistence(jobListingId);

    const RoleTitle = 'Candidate';

    const JobListingsSaved = await this.prismaService.saveJobs.count({
      where: {
        jobListingId: jobListingId,
        user: {
          role: {
            title: RoleTitle,
          },
        },
      },
    });
    if (JobListingsSaved === 0) {
      return { message: `Aucune sauvegarde pour cette offre d'emploi.` };
    }
    return JobListingsSaved;
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Count search all Jobs saved by ConsultantId  @@@@@@@@@@@@@@@@@@@@@@@@@@@
  async countAllJobsSavedByConsultantId(
    consultantId: number,
    requestUserId: number,
  ) {
    // On vérifie l'existence et le rôle de l'utilisateur qui fait la demande
    const requestUser =
      await this.userService.verifyUsersExistence(requestUserId);

    if (
      !requestUser ||
      !(
        requestUser.role.title === 'Consultant' ||
        requestUser.role.title === 'Administrator'
      )
    ) {
     
      throw new UnauthorizedException( ErrorMessages.UNAUTHORIZED_VIEW);
    }
    // On vérifie l'existence et le rôle du consultant
    const consultant =
      await this.userService.verifyUsersExistence(consultantId);

    if (!consultant || consultant.role.title !== 'Consultant') {
      
      throw new UnauthorizedException( ErrorMessages.UNAUTHORIZED_USER);
    }
    const JobListingsSaved = await this.prismaService.saveJobs.count({
      where: {
        userId: consultantId, // On filtre les emplois sauvegardés par l'ID du consultant
      },
    });
    if (JobListingsSaved === 0) {
      return { message: `Aucune sauvegarde trouvée pour ce consultant.` };
    }

    return JobListingsSaved;
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   UPDATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  

  
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  UPDATE my job saved  @@@@@@@@@@@@@@@@@

  async assignmentTasksToConsultant(jobListingId: number, updateSaveJobDto: UpdateSaveJobDto) {
    const { userId } = updateSaveJobDto;

    try {
      // Vérifier l'existence de l'offre d'emploi
      await this.jobListingService.verifyJobListingExistence(jobListingId);

      // Récupérer les informations de l'utilisateur
      const collaborator = await this.userService.verifyUsersExistence(userId);
      const nameFirstnameCollaborator = `${collaborator.firstname} ${collaborator.name}`;

      // Supprimer tous les futurs RDV liés à cette offre
      await this.prismaService.appointment.deleteMany({
        where: {
          jobApplication: {
            jobListingId: jobListingId
          }
        }
      });

      // Supprimer l'offre chez le 1er consultant
      await this.prismaService.saveJobs.deleteMany({
        where: {
          jobListingId: jobListingId,
          user: {
            role: {
              title: 'Consultant',
            },
          },
        },
      });

      // Réattribuer l'offre à un autre consultant
      await this.prismaService.saveJobs.create({
        data: {
          userId: userId,
          jobListingId: jobListingId,
        },
      });

      // Mettre à jour l'offre d'emploi avec le nouveau consultant
      await this.prismaService.jobListings.update({
        where: {
          jobListingId: jobListingId,
        },
        data: { 
          checkJobListingByConsultant: nameFirstnameCollaborator,
        },
      });

      // Retourner une réponse de succès
      return {
        result: true,
        data: 'Success',
        error_code: null,
        error: null,
      };
    } catch (error) {
      throw error;
    }
  }
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   DELETE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Delete my job saved  @@@@@@@@@@@@@@@@@
  async deleteMyJobSavedByJobListingId(
    jobListingId: number,
    requestingUserId: number,
  ) {
    // On récupère l'Id de la sauvegarde
    const jobListing =
      await this.jobListingService.verifyJobListingExistence(jobListingId);

    // On verifie l'utilisateur demandeur de la requête et on recupère ces informations
    const requestingUser =
      await this.userService.verifyUsersExistence(requestingUserId);

    // On va recuperer le Id de la sauvegarde
    const jobSaved = await this.prismaService.saveJobs.findFirst({
      where: {
        userId: requestingUser.userId,
        jobListingId: jobListing.jobListingId,
      },
      select: {
        saveJobId: true,
        userId: true,
        jobListingId: true,
      },
    });

    // On vérifie si  le demandeur est l'utilisateur associé à la sauvegarde
    if (!requestingUser || jobSaved.userId !== requestingUser.userId) {
     

      throw new UnauthorizedException( ErrorMessages.UNAUTHORIZED_DELETION);
    }
    // On Supprime la sauvegarde de la base de données
    await this.prismaService.saveJobs.delete({
      where: {
        saveJobId: jobSaved.saveJobId,
        userId: requestingUser.userId,
      },
    });
    // On retourne une réponse de succès
    return { message: 'Job application successfully deleted' };
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Delete all job saved where the associated joblisting is Closed  @@@@@@@@@@@@@@@@@
  async deleteAllJobSavedWhereJoblistingIsClosed() {
    // Récupérer les emplois sauvés
    const roleTitle = 'Candidate';
    const jobsSaved = await this.prismaService.saveJobs.deleteMany({
      where: {
        jobListing: {
          jobClose: true,
        },
        user: {
          role: {
            title: roleTitle,
          },
        },
      },
    });
    if (jobsSaved.count > 0) {
      // result.count contiendra le nombre de puplications supprimés

      return {
        message: `Nombre de puplications expirées, supprimées est: ${jobsSaved.count}.`,
      };
    }
    return { message: `Il n'y a aucune puplication expirée.` };
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   Fonctions Privée  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // On vérifie l'unicité de le sauvegarde
  async checkSaveJobUniqueness(
    createSavejobDto: CreateSavejobDto,
    requestingUserId: number,
  ) {
    const { jobListingId } = createSavejobDto;

    const saveJobExists = await this.prismaService.saveJobs.findFirst({
      where: {
        jobListingId,
        userId: requestingUserId,
      },
      select: {
        user: {
          select: {
            role: true,
          },
        },
        jobListing: true,
      },
    });
    if (saveJobExists) {
      throw new ConflictException( ErrorMessages.JOB_ALREADY_SAVED);
    }

    return saveJobExists;
  }

  // On vérifie l'existence de la sauvegarde
  async verifySaveJobExistence(saveJobId: number) {
    const saveJobExists = await this.prismaService.saveJobs.findUnique({
      where: {
        saveJobId: saveJobId,
      },
      select: {
        jobListing: true,
        user: true,
      },
    });
    if (!saveJobExists) {

      throw new NotFoundException( ErrorMessages.SAVE_JOB_NOT_FOUND);

    }

    return saveJobExists;
  }
  // On vérifie que 'emploi n'a pas déjà été attribué à un Consultant
  async checkJoblistingAlreadySaveJobByConsultant(jobListingToSavedId: number) {
    const isAlreadySaveByConsultant =
      await this.prismaService.saveJobs.findFirst({
        where: {
          jobListingId: jobListingToSavedId,
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
              name: true,
              firstname: true,
            },
          },
        },
      });
    if (isAlreadySaveByConsultant && isAlreadySaveByConsultant.user) {
      const consultantName = `${isAlreadySaveByConsultant.user.name} ${isAlreadySaveByConsultant.user.firstname}`;
      throw new ConflictException( `${ErrorMessages.JOB_ALREADY_ASSIGNED}: ${consultantName}`);
    }
  }
}
