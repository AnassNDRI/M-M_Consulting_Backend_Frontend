import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as moment from 'moment';
import { JobapplicationService } from '../jobapplication/jobapplication.service';
import { MailerService } from '../mailer/mailer.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateAppointmentDto } from './dto/createAppointmemtDto';
import { UpdateAppointmentDto } from './dto/updateAppointmentDto';

import {
  addDays,
  addYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isWeekend,
  parse,
  setHours,
  setMinutes,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ErrorMessages } from 'src/shared/error-management/errors-message';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly prismaService: PrismaService,

    private readonly userService: UsersService,
    private readonly jobApplicationService: JobapplicationService,
    private readonly mailerService: MailerService,
  ) {}

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   CREATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Create a new Appointment @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async createAppointment(
    createAppointmentDto: CreateAppointmentDto,
    consultantId: number,
  ) {
    const { jobApplicationId, appointmentDate, timeSlotId } =
      createAppointmentDto;

    // On verifie l'existence du consultant dans la BD
    const requestingUser =
      await this.userService.verifyUsersExistence(consultantId);

    // On vérifie le rôle pour s'assurer que l'utilisateur est bien un consultant
    if (
      !requestingUser.role ||
      !(
        requestingUser.role.title === 'Administrator' ||
        requestingUser.role.title === 'Consultant'
      )
    ) {
      throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_CONSULTANT );
    }

    // On verifie l'existence de la candidature
    const jobApplication =
      await this.jobApplicationService.verifyJobApplicationExistence(
        jobApplicationId,
      );

    // On verifie que l'emploi associé à la candidature n'est pas déjà close.
    if (jobApplication.jobListing.jobClose) {
      throw new UnauthorizedException(ErrorMessages.JOB_CLOSED);
    }

    // On sassure que les dates ne sont pas des dates passées et ne tombent pas un week
    await this.checkDateNotPastNotWeek(appointmentDate);

    // On verifie l'existence du crénea horaire
    const timeSlotIdOfDay = await this.verifyTimeSlotExistence(timeSlotId);

    // On verifie la disponibilité du consultant pour la journée et du créneau horaire.
    const availability = await this.checkConsultantAvailability(
      consultantId,
      timeSlotIdOfDay.timeSlotId,
      appointmentDate,
    );

    if (availability) {
      throw new ConflictException(ErrorMessages.TIME_SLOT_CONFLICT);
    }

    // parametre pour  la verification l'unicité du Rendez-vous
    const appJobTitleId = jobApplication.jobListing.jobTitle.jobTitleId;
    const candidateId = jobApplication.user.userId;
    const candidateName = jobApplication.user.name;
    const candidateEmail = jobApplication.user.email;
    const JobTitle = jobApplication.jobListing.jobTitle.title; // mettre a jour la variable note de appointment
    const consultantName = `${requestingUser.name} ${requestingUser.firstname}`;

    // On parse l'heure de début depuis la chaîne 'HH:mm' et on la met à jour dans l'objet date de rendez-vous "appointmentDate+appHoursStart"
    const appHoursStart = parse(
      timeSlotIdOfDay.appHoursStart,
      'HH:mm',
      new Date(),
    );
    const formatAppHoursStartDate = setMinutes(
      setHours(appointmentDate, appHoursStart.getHours()),
      appHoursStart.getMinutes(),
    );

    // On fait de même pour l'heure de fin     "appointmentDate+appHoursEnd"
    const appHoursEnd = parse(timeSlotIdOfDay.appHoursEnd, 'HH:mm', new Date());
    const formatAppHoursEndDate = setMinutes(
      setHours(appointmentDate, appHoursEnd.getHours()),
      appHoursEnd.getMinutes(),
    );

    // On vérifie l'unicité du Rendez-vous a la postulation
    await this.checkAppointmentUniqueness(
      jobApplicationId,
      candidateId,
      appJobTitleId,
      consultantId,
    );

    const interviewAppointment = await this.prismaService.appointment.create({
      data: {
        note: JobTitle,
        consultantId,
        jobApplicationId,
        timeSlotId,
        appointmentDate,
        appHoursStart: formatAppHoursStartDate,
        appHoursEnd: formatAppHoursEndDate,
      },
      select: {
        appointmentId: true,
        note: true,
        consultant: {
          select: {
            userId: true,
            name: true,
            firstname: true,
          },
        },
        appointmentDate: true,
        timeSlots: true,
        appHoursStart: true,
        appHoursEnd: true,
      },
    });

    const formattedDate = moment(interviewAppointment.appointmentDate).format(
      'DD-MM-YYYY',
    );
    const hours = interviewAppointment.timeSlots.appHoursStart;

    await this.mailerService.sendAppointmentConfirmationToCandidate(
      candidateName,
      candidateEmail,
      interviewAppointment.note,
      formattedDate,
      hours,
      consultantName,
    );

    return interviewAppointment;
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   READ  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  //++++++++++++++++++++++++++++++++++++++++++++++ CONSULTANT ++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ My Future Appointment grouped by day, Week, Moth @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getMyAllFutureAppointmentsGrouped(
    consultantId: number,
    filter: 'day' | 'week' | 'month' | 'all',
  ) {
    try {
      // On verifie l'existence du consultant dans la BD
      const consultant =
        await this.userService.verifyUsersExistence(consultantId);

      // On vérifie le rôle pour s'assurer que l'utilisateur est bien un consultant
      if (
        !consultant.role ||
        !(
          consultant.role.title === 'Administrator' ||
          consultant.role.title === 'Consultant'
        )
      ) {
        throw new UnauthorizedException(ErrorMessages.NOT_CONSULTANT);
      }

      const now = new Date();
      const startDate = startOfDay(now); // Début de la journée actuelle pour tous les filtres
      let endDate;

      switch (filter) {
        case 'day':
          endDate = endOfDay(now); // Fin de la journée actuelle
          break;
        case 'week':
          // `startDate` reste à `now` pour inclure les rendez-vous à partir du moment actuel
          endDate = endOfWeek(now, { weekStartsOn: 1 }); // Fin de la semaine actuelle
          break;
        case 'month':
          // `startDate` reste à `now` pour inclure les rendez-vous à partir du moment actuel
          endDate = endOfMonth(now); // Fin du mois actuel
          break;
        case 'all':
          // Pour 'all', on ne définit pas de `endDate`, ou on le définit très loin dans le futur
          endDate = addYears(now, 2); // Optionnel, pour englober tous les rendez-vous futurs
          break;
        default:
          throw new Error(ErrorMessages.INVALID_FILTER);
      }

      const futureAppointments = await this.prismaService.appointment.findMany({
        where: {
          consultantId: consultantId,
          // Utilisation de la fonction OR pour permettre la sélection des rendez-vous soit après aujourd'hui,
          // soit plus tard dans la journée
          OR: [
            {
              appointmentDate: {
                gte: startDate,
                lte: endDate,
              },
            },
            {
              // Ou bien, si le rendez-vous est aujourd'hui, l'heure de début doit être dans le futur
              AND: [
                {
                  appointmentDate: {
                    gte: startDate,
                    lte: endDate,
                  },
                },
                {
                  appHoursStart: {
                    gte: startDate,
                    lte: endDate,
                  },
                },
              ],
            },
          ],
        },
        orderBy: {
          appointmentDate: 'asc', // On trie les rendez-vous futurs du plus proche au plus éloigné
        },
        include: {
          jobApplication: {
            select: {
              jobApplicationId: true,
              user: {
                select: {
                  userId: true,
                  name: true,
                  firstname: true,
                  email: true,
                  phoneNumber: true,
                  dateBirth: true,
                  sex: true,
                },
              },
              jobListing: {
                select: {
                  jobListingId: true,
                  userId: true,
                  user: {
                    select: {
                      userId: true,
                      name: true,
                      nameCompany: true,
                    },
                  },
                  jobTitle: {
                    select: {
                      jobTitleId: true,
                      title: true,
                    },
                  },
                },
              },
            },
          },
          consultant: {
            select: {
              userId: true,
              name: true,
              firstname: true,
            },
          },
          timeSlots: true, // Inclure les détails du créneau horaire
        },
      });

      if (futureAppointments.length === 0) {
        return { message: ErrorMessages.NO_APPOINTMENTS };
      }

      //  Retourner la liste complète des RDV et leur nombres
      return {
        result: true,
        count: futureAppointments.length, // Le nombre total de RDV correspondants
        data: futureAppointments, // La liste des RDV correspondants
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ My Future Appointment Consultant @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getMyAllFutureAppointmentsConsultant(consultantId: number) {
    try {
      // On verifie l'existence du consultant dans la BD
      const consultant =
        await this.userService.verifyUsersExistence(consultantId);

      // On vérifie le rôle pour s'assurer que l'utilisateur est bien un consultant
      if (
        !consultant.role ||
        !(
          consultant.role.title === 'Administrator' ||
          consultant.role.title === 'Consultant'
        )
      ) {
        throw new UnauthorizedException(ErrorMessages.NOT_CONSULTANT);
      }

      const futureAppointments = await this.prismaService.appointment.findMany({
        where: {
          consultantId: consultantId,
        },
        orderBy: {
          appointmentDate: 'asc', // On trie les rendez-vous futurs du plus proche au plus éloigné
        },
        include: {
          jobApplication: {
            select: {
              jobApplicationId: true,
              user: {
                select: {
                  userId: true,
                  name: true,
                  firstname: true,
                  email: true,
                  phoneNumber: true,
                  dateBirth: true,
                  sex: true,
                },
              },
              jobListing: {
                select: {
                  jobListingId: true,
                  userId: true,
                  user: {
                    select: {
                      userId: true,
                      name: true,
                      nameCompany: true,
                    },
                  },
                  jobTitle: {
                    select: {
                      jobTitleId: true,
                      title: true,
                    },
                  },
                },
              },
            },
          },
          consultant: {
            select: {
              userId: true,
              name: true,
              firstname: true,
            },
          },
          timeSlots: true, // Inclure les détails du créneau horaire
        },
      });

      if (futureAppointments.length === 0) {
        return {message: ErrorMessages.NO_APPOINTMENTS};
      }

      //  Retourner la liste complète des RDV et leur nombres
      return {
        result: true,
        count: futureAppointments.length, // Le nombre total de RDV correspondants
        data: futureAppointments, // La liste des RDV correspondants
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Chercher un RDV par un mot clé  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async searchInfoInMyAppointment(keyword: string, consultantId: number) {
    try {
      // On verifie l'existence du consultant dans la BD
      const consultant =
        await this.userService.verifyUsersExistence(consultantId);

      // On vérifie le rôle pour s'assurer que l'utilisateur est bien un consultant
      if (
        !consultant.role ||
        !(
          consultant.role.title === 'Administrator' ||
          consultant.role.title === 'Consultant'
        )
      ) {
        throw new UnauthorizedException(ErrorMessages.NOT_CONSULTANT);
      }

      const now = new Date();
      const startDate = startOfDay(now); // Début de la journée actuelle pour tous les filtres

      // Simplification de la requête en consolidant les conditions de date et de recherche
      const futureAppointments = await this.prismaService.appointment.findMany({
        where: {
          consultantId: consultantId,
          appointmentDate: {
            gte: startDate, // Filtre pour s'assurer que la date du rendez-vous est aujourd'hui ou dans le futur
          },
          OR: [
            {
              consultant: {
                OR: [
                  { name: { contains: keyword } },
                  { firstname: { contains: keyword } },
                ],
              },
            },
            {
              jobApplication: {
                OR: [
                  {
                    user: {
                      OR: [
                        { name: { contains: keyword } },
                        { firstname: { contains: keyword } },
                        { phoneNumber: { contains: keyword } },
                        { email: { contains: keyword } },
                      ],
                    },
                  },
                  {
                    jobListing: {
                      OR: [
                        { jobTitle: { title: { contains: keyword } } },
                        { user: { nameCompany: { contains: keyword } } },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
        orderBy: {
          appointmentDate: 'asc', // On trie les rendez-vous futurs du plus proche au plus éloigné
        },
        include: {
          jobApplication: {
            select: {
              jobApplicationId: true,
              checkJobAppliByConsultant: true,
              user: {
                select: {
                  userId: true,
                  name: true,
                  firstname: true,
                  email: true,
                  phoneNumber: true,
                  dateBirth: true,
                  sex: true,
                },
              },
              jobListing: {
                select: {
                  userId: true,
                  user: {
                    select: {
                      userId: true,
                      name: true,
                      nameCompany: true,
                    },
                  },
                  jobTitle: {
                    select: {
                      jobTitleId: true,
                      title: true,
                    },
                  },
                },
              },
            },
          },
          consultant: {
            select: {
              userId: true,
              name: true,
              firstname: true,
            },
          },
          timeSlots: true, // Inclure les détails du créneau horaire
        },
      });

      if (futureAppointments.length === 0) {
        return {message: ErrorMessages.NO_APPOINTMENTS};
      }

      //  Retourner la liste complète des RDV et leur nombres
      return {
        result: true,
        count: futureAppointments.length, // Le nombre total de RDV correspondants
        data: futureAppointments, // La liste des RDV correspondants
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ My Future Appointment grouped by day, Week, Moth @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async AllFutureAppointmentsGrouped() {
    try {
      const now = new Date();
      const startDate = startOfDay(now); // Début de la journée actuelle pour tous les filtres

      const futureAppointments = await this.prismaService.appointment.findMany({
        where: {
          OR: [
            {
              appointmentDate: {
                gte: startDate,
              },
            },
            {
              // Ou bien, si le rendez-vous est aujourd'hui, l'heure de début doit être dans le futur
              AND: [
                {
                  appointmentDate: {
                    gte: startDate,
                  },
                },
                {
                  appHoursStart: {
                    gte: startDate,
                  },
                },
              ],
            },
          ],
        },
        orderBy: {
          appointmentDate: 'asc', // On trie les rendez-vous futurs du plus proche au plus éloigné
        },
        include: {
          jobApplication: {
            select: {
              jobApplicationId: true,
              checkJobAppliByConsultant: true,
              user: {
                select: {
                  userId: true,
                  name: true,
                  firstname: true,
                  email: true,
                  phoneNumber: true,
                  dateBirth: true,
                  sex: true,
                },
              },
              jobListing: {
                select: {
                  userId: true,
                  user: {
                    select: {
                      userId: true,
                      name: true,
                      nameCompany: true,
                    },
                  },
                  jobTitle: {
                    select: {
                      jobTitleId: true,
                      title: true,
                    },
                  },
                },
              },
            },
          },
          consultant: {
            select: {
              userId: true,
              name: true,
              firstname: true,
            },
          },
          timeSlots: true, // Inclure les détails du créneau horaire
        },
      });

      if (futureAppointments.length === 0) {
        return {
          message: `Aucun rendez-vous.`,
        };
      }

      //  Retourner la liste complète des RDV et leur nombres
      return {
        result: true,
        count: futureAppointments.length, // Le nombre total de RDV correspondants
        data: futureAppointments, // La liste des RDV correspondants
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Chercher un comptes validé par un mot clé @@@@@@@@@@@@@@@@@@@@@@@@
  async searchInfoInAppointment(keyword: string) {
    try {
      const now = new Date();
      const startDate = startOfDay(now); // Début de la journée actuelle pour tous les filtres

      // Simplification de la requête en consolidant les conditions de date et de recherche
      const futureAppointments = await this.prismaService.appointment.findMany({
        where: {
          appointmentDate: {
            gte: startDate, // Filtre pour s'assurer que la date du rendez-vous est aujourd'hui ou dans le futur
          },
          OR: [
            {
              consultant: {
                OR: [
                  { name: { contains: keyword } },
                  { firstname: { contains: keyword } },
                ],
              },
            },
            {
              jobApplication: {
                OR: [
                  {
                    user: {
                      OR: [
                        { name: { contains: keyword } },
                        { firstname: { contains: keyword } },
                        { phoneNumber: { contains: keyword } },
                        { email: { contains: keyword } },
                      ],
                    },
                  },
                  {
                    jobListing: {
                      OR: [
                        { jobTitle: { title: { contains: keyword } } },
                        { user: { nameCompany: { contains: keyword } } },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
        orderBy: {
          appointmentDate: 'asc', // On trie les rendez-vous futurs du plus proche au plus éloigné
        },
        include: {
          jobApplication: {
            select: {
              jobApplicationId: true,
              checkJobAppliByConsultant: true,
              user: {
                select: {
                  userId: true,
                  name: true,
                  firstname: true,
                  email: true,
                  phoneNumber: true,
                  dateBirth: true,
                  sex: true,
                },
              },
              jobListing: {
                select: {
                  userId: true,
                  user: {
                    select: {
                      userId: true,
                      name: true,
                      nameCompany: true,
                    },
                  },
                  jobTitle: {
                    select: {
                      jobTitleId: true,
                      title: true,
                    },
                  },
                },
              },
            },
          },
          consultant: {
            select: {
              userId: true,
              name: true,
              firstname: true,
            },
          },
          timeSlots: true, // Inclure les détails du créneau horaire
        },
      });

      if (futureAppointments.length === 0) {
        return {message: ErrorMessages.NO_APPOINTMENTS};
      }

      return {
        result: true,
        count: futureAppointments.length,
        data: futureAppointments,
      };
    } catch (error) {
      throw error; // Remontée de l'erreur pour traitement ultérieur
    }
  }

  /*MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM-------------------------------------------------- */

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   My appointment detail, Access By Consultant  @@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getMyAppointmentDetail(appointmentId: number, consultantId: number) {
    try {
      // On verifie l'existence du consultant dans la BD
      const consultant =
        await this.userService.verifyUsersExistence(consultantId);

      // On vérifie le rôle pour s'assurer que l'utilisateur est bien un consultant
      if (
        !consultant.role ||
        !(
          consultant.role.title === 'Administrator' ||
          consultant.role.title === 'Consultant'
        )
      ) {
        throw new UnauthorizedException(ErrorMessages.NOT_CONSULTANT);
      }

      // On verifie l'existence du rendez-vous
      await this.verifyAppointmentExistence(appointmentId);

      // On retoune les details de son rdv
      const myAppointment = await this.prismaService.appointment.findUnique({
        where: {
          appointmentId: appointmentId,
          consultantId: consultantId,
        },
        select: {
          appointmentId: true,
          timeSlotId: true,
          consultantId: true,
          jobApplicationId: true,
          appointmentDate: true,
          timeSlots: true,
          consultant: {
            select: {
              userId: true,
              name: true,
              firstname: true,
            },
          },
          jobApplication: {
            select: {
              jobApplicationId: true,
              jobInterviewOK: true,
              user: {
                select: {
                  userId: true,
                  name: true,
                  firstname: true,
                  email: true,
                },
              },
              jobListing: {
                select: {
                  jobListingId: true,
                  user: {
                    select: {
                      userId: true,
                      name: true,
                      firstname: true,
                      email: true,
                      phoneNumber: true,
                      nameCompany: true,
                    },
                  },
                  validate: true,
                  jobTitle: {
                    select: {
                      title: true,
                      jobTitleId: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!myAppointment) {
        throw new NotFoundException(ErrorMessages.NOT_FOUND_APPOINTMENT);
      }

      // On retourne une réponse de succès
      return {
        result: true,
        data: myAppointment, // La liste des Postulations correspondants
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   All appointment, ConsultantId  @@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getMyAppointmentConsultant(consultantId: number) {
    // On verifie l'existence du consultant dans la BD
    const consultant =
      await this.userService.verifyUsersExistence(consultantId);

    // On vérifie le rôle pour s'assurer que l'utilisateur est bien un consultant
    if (
      !consultant.role ||
      !(
        consultant.role.title === 'Administrator' ||
        consultant.role.title === 'Consultant'
      )
    ) {
      throw new UnauthorizedException(ErrorMessages.NOT_CONSULTANT);
    }

    // On retoune les details de tous les rdv du consultant
    const myAppointment = await this.prismaService.appointment.findMany({
      where: {
        consultantId: consultantId,
      },
      select: {
        appointmentDate: true,
        timeSlots: true,
        consultant: {
          select: {
            name: true,
            firstname: true,
          },
        },
        jobApplication: {
          select: {
            user: {
              select: {
                userId: true,
                name: true,
                firstname: true,
                email: true,
              },
            },
            jobListing: {
              select: {
                jobListingId: true,
                validate: true,
                jobTitle: {
                  select: {
                    title: true,
                    jobTitleId: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (myAppointment.length === 0) {
      return { message: `Cet consultant n'a aucun Rendez-vous` };
    }

    //  Retourner la liste complète des RDV et leur nombres
    const result = {
      count: myAppointment.length, // Le nombre total de RDV correspondants
      jobListings: myAppointment, // La liste des RDV correspondants
    };

    return result;
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All past appointments  , Access All Consultants  @@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllPastAppointments() {
    const currentDate = new Date();
    const currentTime = new Date();

    // On récupère tous les rendez-vous d'aujourd'hui et des jours précédents
    const pastAppointments = await this.prismaService.appointment.findMany({
      where: {
        OR: [
          {
            // Les rendez-vous dont la date est antérieure à aujourd'hui
            appointmentDate: {
              lt: currentDate,
            },
          },
          {
            // Ou bien, si le rendez-vous est aujourd'hui, l'heure de fin doit être passée
            AND: [
              {
                appointmentDate: currentDate,
              },
              {
                appHoursEnd: {
                  lt: currentTime,
                },
              },
            ],
          },
        ],
      },
      orderBy: {
        appointmentDate: 'desc', // Triez les rendez-vous passés du plus récent au plus ancien
      },
      include: {
        jobApplication: {
          select: {
            jobApplicationId: true,
            user: {
              select: {
                name: true,
                firstname: true,
                phoneNumber: true,
              },
            },
          },
        },
        consultant: {
          select: {
            name: true,
            firstname: true,
          },
        },
        timeSlots: true, // Inclure les détails du créneau horaire
      },
    });

    if (pastAppointments.length === 0) {
      return { message: `Aucun rendez-vous passé trouvé` };
    }

    //  Retourner la liste complète des RDV et leur nombres
    const result = {
      count: pastAppointments.length, // Le nombre total de RDV correspondants
      jobListings: pastAppointments, // La liste des RDV correspondants
    };

    return result;
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All future appointments  , Access All Consultants  @@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllFutureAppointments() {
    const currentDate = new Date();
    const currentTime = new Date();

    // On récupère tous les Rendez-vous d'aujourd'hui et des jours suivants
    const appointments = await this.prismaService.appointment.findMany({
      where: {
        // Utilisation de la fonction OR pour permettre la sélection des rendez-vous soit après aujourd'hui,
        // soit plus tard dans la journée
        OR: [
          {
            appointmentDate: {
              gte: currentDate, // Rendez-vous d'aujourd'hui et des jours suivants
            },
          },
          {
            // Ou bien, si le rendez-vous est aujourd'hui, l'heure de fin doit être passée
            AND: [
              {
                appointmentDate: currentDate,
              },
              {
                appHoursStart: {
                  gte: currentTime, // superieure
                },
              },
            ],
          },
        ],
      },
      orderBy: {
        appointmentDate: 'asc', // On trie les rendez-vous futurs du plus proche au plus éloigné
      },
      include: {
        jobApplication: {
          select: {
            jobApplicationId: true,
            user: {
              select: {
                userId: true,
                name: true,
                firstname: true,
                phoneNumber: true,
              },
            },
          },
        },
        consultant: {
          select: {
            userId: true,
            name: true,
            firstname: true,
          },
        },
        timeSlots: true, // Inclure les détails du créneau horaire
      },
    });
    if (appointments.length === 0) {
      return { message: `Aucun rendez-vous futur trouvé` };
    }

    //  Retourner la liste complète des RDV et leur nombres
    const result = {
      count: appointments.length, // Le nombre total de RDV correspondants
      jobListings: appointments, // La liste des RDV correspondants
    };

    return result;
  }

  /*
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   appointment detail by appointmentId, Access All Consultants  @@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAppointmentDetail(appointmentId: number) {
    // On verifie l'existence du rendez-vous
    await this.verifyAppointmentExistence(appointmentId);

    // On retoune les details de son rdv
    const myAppointment = await this.prismaService.appointment.findUnique({
      where: {
        appointmentId: appointmentId,
      },
      select: {
        appointmentDate: true,
        timeSlots: true,
        consultant: {
          select: {
            userId: true,
            name: true,
            firstname: true,
          },
        },
        jobApplication: {
          select: {
            user: {
              select: {
                userId: true,
                name: true,
                firstname: true,
                email: true,
              },
            },
            jobListing: {
              select: {
                jobListingId: true,
                user: {
                  select: {
                    userId: true,
                    name: true,
                    firstname: true,
                    email: true,
                    phoneNumber: true,
                  },
                },
                validate: true,
                jobTitle: {
                  select: {
                    title: true,
                    jobTitleId: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!myAppointment) {
      throw new NotFoundException(`Rendez-vous non trouvé`);
    }
    return myAppointment;
  } */

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ My Past Appointment grouped by day, Week, Moth @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getMyAllPastAppointmentsGrouped(
    consultantId: number,
    filter: 'day' | 'week' | 'month' | 'all',
  ) {
    // On verifie l'existence du consultant dans la BD
    const consultant =
      await this.userService.verifyUsersExistence(consultantId);

    // On vérifie le rôle pour s'assurer que l'utilisateur est bien un consultant
    if (
      !consultant.role ||
      !(
        consultant.role.title === 'Administrator' ||
        consultant.role.title === 'Consultant'
      )
    ) {
      throw new UnauthorizedException(ErrorMessages.NOT_CONSULTANT );
    }

    const now = new Date();
    let startDate;
    const endDate = endOfDay(now); // Fin de la journée actuelle pour tous les filtres, pour s'assurer de ne pas inclure des rendez-vous futurs

    switch (filter) {
      case 'day':
        startDate = startOfDay(now); // Début de la journée actuelle
        break;
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 }); // Début de la semaine actuelle
        break;
      case 'month':
        startDate = startOfMonth(now); // Début du mois actuel
        break;
      case 'all':
        // Pour 'all', on pourrait remonter très loin dans le passé, mais définir une limite raisonnable est généralement une bonne pratique
        startDate = new Date(2022, 0, 1); // Utiliser une date très ancienne comme point de départ
        break;
      default:
        throw new Error(ErrorMessages.INVALID_FILTER );
    }

    const pastAppointments = await this.prismaService.appointment.findMany({
      where: {
        consultantId: consultantId,
        // Utilisation de la fonction OR pour permettre la sélection des rendez-vous soit après aujourd'hui,
        // soit plus tard dans la journée
        AND: [
          {
            // Les rendez-vous dont la date est antérieure à aujourd'hui
            appointmentDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            // Ou bien, si le rendez-vous est aujourd'hui, l'heure de fin doit être passée
            OR: [
              {
                appointmentDate: {
                  gte: startDate,
                  lte: endDate,
                },
              },
              {
                appHoursEnd: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            ],
          },
        ],
      },
      orderBy: {
        appointmentDate: 'desc', // Triez les rendez-vous passés du plus récent au plus ancien
      },
      include: {
        jobApplication: {
          select: {
            jobApplicationId: true,
            user: {
              select: {
                userId: true,
                name: true,
                firstname: true,
                phoneNumber: true,
              },
            },
          },
        },
        consultant: {
          select: {
            userId: true,
            name: true,
            firstname: true,
          },
        },
        timeSlots: true, // Inclure les détails du créneau horaire
      },
    });

    if (pastAppointments.length === 0) {
      return {
        message: `Vous n'avez aucun rendez-vous pour la période sélectionnée.`,
      };
    }

    //  Retourner la liste complète des RDV et leur nombres
    const result = {
      count: pastAppointments.length, // Le nombre total de RDV correspondants
      jobListings: pastAppointments, // La liste des RDV correspondants
    };

    return result;
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   My Last appointment, To know my next awailability  @@@@@@@@@@@@@@@@@@@@@@@@@@
  async getMyNextAwailability(consultantId: number) {
    // On verifie l'existence du consultant dans la BD
    const consultant =
      await this.userService.verifyUsersExistence(consultantId);

    // On vérifie le rôle pour s'assurer que l'utilisateur est bien un consultant
    if (
      !consultant.role ||
      !(
        consultant.role.title === 'Administrator' ||
        consultant.role.title === 'Consultant'
      )
    ) {
      throw new UnauthorizedException(ErrorMessages.NOT_CONSULTANT);
    }
    // On retourne le dernier rendez-vous du consultant en triant par date et heure de début
    const myLastAppointment = await this.prismaService.appointment.findFirst({
      where: {
        consultantId: consultantId,
      },
      orderBy: [
        {
          appointmentDate: 'desc', // On trie les rendez-vous du plus récent au plus ancien
        },
      ],
      include: {
        timeSlots: true,
      },
    });
    if (!myLastAppointment) {
      throw new NotFoundException(ErrorMessages.NOT_FOUND_APPOINTMENT);
    }

    return myLastAppointment;
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ My available time slots from now until my last appointment @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getMyAwailabilityTimeSlotsNowLastAppointment(consultantId: number) {
    // On verifie l'existence du consultant dans la BD
    const consultant =
      await this.userService.verifyUsersExistence(consultantId);

    // On vérifie le rôle pour s'assurer que l'utilisateur est bien un consultant
    if (
      !consultant.role ||
      !(
        consultant.role.title === 'Administrator' ||
        consultant.role.title === 'Consultant'
      )
    ) {
      throw new UnauthorizedException(ErrorMessages.NOT_CONSULTANT);
    }

    // On définition de la période de recherche
    const now = new Date();

    // // On retourne le dernier rendez-vous du consultant en triant par date et heure de début
    const myLastAppointment = await this.getMyNextAwailability(consultantId);

    // On recupère la date et l'heure exactes de la fin du dernier rendez-vous
    const endPeriod = myLastAppointment.appHoursEnd;

    // SI je veux aller au-dela de la date du dernier RDV (recherche par défaut de 30 jours)
    // const endPeriod = myLastAppointment ? new Date(myLastAppointment.appHoursEnd) : addDays(now, 30);

    // Récupération des créneaux horaires dans la période concernée sans filtrage préalable
    const timeSlots = await this.prismaService.timeSlot.findMany({
      orderBy: { appHoursStart: 'asc' }, // On trie les créneau - futurs, du plus proche au plus éloigné
    });

    // On prepare le tableau pour stocker tous les créneaux horaires de maintenant à la date du dernier RDV
    const availableTimeSlots = [];

    // On va parcourir chaque jour jusqu'à endPeriod
    for (
      let date = startOfDay(now);
      isBefore(date, endPeriod);
      date = addDays(date, 1)
    ) {
      if (!isWeekend(date)) {
        // Vérification des jours ouvrables
        for (const slot of timeSlots) {
          const [hours, minutes] = slot.appHoursStart.split(':').map(Number);
          const slotDateTime = setMinutes(setHours(date, hours), minutes);

          // Vérifier si le créneau est dans le futur, non réservé, et avant 'endPeriod'
          if (isAfter(slotDateTime, now) && isBefore(slotDateTime, endPeriod)) {
            const isBooked = await this.checkIfSlotIsBooked(
              consultantId,
              slot.timeSlotId,
              slotDateTime,
            );
            if (!isBooked) {
              availableTimeSlots.push({
                date: format(slotDateTime, 'yyyy-MM-dd'),
                slot,
              });
            }
          }
        }
      }
    }

    if (availableTimeSlots.length === 0) {
      return {
        message: `Vous n'avez aucun créneau horaire libre jusqu'a votre dernier RDV`,
      };
    }

    //  Retourner la liste complète des RDV et leur nombres
    return {
      count: availableTimeSlots.length, // Le nombre total de Créneaux correspondants
      jobListings: availableTimeSlots, // La liste des Créneaux correspondants
    };
  }

  //++++++++++++++++++++++++++++++++++++++++++++++ CANDIDATE ++++++++++++++++++++++++++++++++++++++++++++++++++++++*/

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   My appointment Access By Candidate @@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getMyAppointmentCandidate(candidateId: number) {
    try {
      // On verifie l'existence du candidat dans la BD
      const candidate =
        await this.userService.verifyUsersExistence(candidateId);

      // On vérifie le rôle pour s'assurer que l'utilisateur est bien un candidat
      if (!candidate.role || !(candidate.role.title === 'Candidate')) {
        throw new UnauthorizedException(ErrorMessages.INVALID_CANDIDATE);
      }

      // On retoune les details de son rdv
      const myAppointment = await this.prismaService.appointment.findMany({
        where: {
          jobApplication: {
            user: {
              userId: candidateId,
            },
          },
        },
        select: {
          appointmentDate: true,
          timeSlots: true,
          consultant: {
            select: {
              name: true,
              firstname: true,
            },
          },
          jobApplication: {
            select: {
              jobListing: {
                select: {
                  jobTitle: {
                    select: {
                      title: true,
                    },
                  },
                  user: {
                    select: {
                      name: true,
                      nameCompany: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (myAppointment.length === 0) {
        return {
          data: `Vous n'avez aucun Rendez-vous prévu.`,
        };
      } else {
        // On retourne la liste complète des fonctions
        return {
          result: true,
          count: myAppointment.length,
          data: myAppointment,
          error_code: null,
          error: null,
        };
      }
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   My appointment detail, Access By Candidate @@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getCandidateAppointmentDetail(candidateId: number) {
    try {
      // On verifie l'existence du candidat dans la BD
      const candidate =
        await this.userService.verifyUsersExistence(candidateId);

      // On vérifie le rôle pour s'assurer que l'utilisateur est bien un candidat
      if (!candidate.role || !(candidate.role.title === 'Candidate')) {
        throw new UnauthorizedException(ErrorMessages.INVALID_CANDIDATE);
      }

      // On retoune les details de son rdv
      const myAppointment = await this.prismaService.appointment.findFirst({
        where: {
          jobApplication: {
            user: {
              userId: candidateId,
            },
          },
        },
        select: {
          appointmentDate: true,
          timeSlots: true,
          consultant: {
            select: {
              name: true,
              firstname: true,
            },
          },
          jobApplication: {
            select: {
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
          },
        },
      });
      if (!myAppointment) {
        throw new NotFoundException(ErrorMessages.CANDIDATE_NOT_FOUND);
      }

      // On retourne la liste complète des fonctions
      return {
        result: true,
        data: myAppointment,
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

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Updating Appointment @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async UpdateAppointment(
    appointmentToUpdateId: number,
    updateAppointmentDto: UpdateAppointmentDto,
    consultantId: number,
  ) {
    try {
      const { appointmentDate, timeSlotId } = updateAppointmentDto;

      // On verifie l'existence du consultant dans la BD
      const requestingUser =
        await this.userService.verifyUsersExistence(consultantId);

      // On vérifie le rôle pour s'assurer que l'utilisateur est bien un consultant ou un Candidat
      if (
        !requestingUser.role ||
        !(
          requestingUser.role.title === 'Administrator' ||
          requestingUser.role.title === 'Consultant'
        )
      ) {
        throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_CONSULTANT);
      }

      // On verifie l'existence du rendez-vous
      const appointmentToUpdate = await this.verifyAppointmentExistence(
        appointmentToUpdateId,
      );

      // On verifie que l'emploi associé à la candidature n'est pas déjà cloturé.
      if (appointmentToUpdate.jobApplication.jobListing.jobClose) {
        throw new UnauthorizedException(ErrorMessages.JOB_CLOSED);
      }

      // On verifie  que les dates ne sont pas des dates passées et ne tombent pas un week
      if (updateAppointmentDto.appointmentDate) {
        await this.checkDateNotPastNotWeek(appointmentDate);
      }

      // On verifie l'existence du crénea horaire
      const timeSlotIdOfDay = await this.verifyTimeSlotExistence(timeSlotId);

      // On verifie la disponibilité du consultant pour la journée et du créneau horaire.
      const availability = await this.checkConsultantAvailability(
        consultantId,
        timeSlotIdOfDay.timeSlotId,
        appointmentDate,
      );

      if (availability) {
        throw new ConflictException(ErrorMessages.CONFLICT_UPDATE);
      }

      // Paramètres pour l'envoi d'e-mail de confirmation de Rendez-vous au Candidat
      const candidateName = appointmentToUpdate.jobApplication.user.name;
      const candidateEmail = appointmentToUpdate.jobApplication.user.email;
      const consultantName = `${requestingUser.name} ${requestingUser.firstname}`;

      // On parse l'heure de début depuis la chaîne 'HH:mm' et on la met à jour dans l'objet date de rendez-vous "appointmentDate+appHoursStart"
      const appHoursStart = parse(
        timeSlotIdOfDay.appHoursStart,
        'HH:mm',
        new Date(),
      );
      const formatAppHoursStartDate = setMinutes(
        setHours(appointmentDate, appHoursStart.getHours()),
        appHoursStart.getMinutes(),
      );

      // On fait de même pour l'heure de fin     "appointmentDate+appHoursEnd"
      const appHoursEnd = parse(
        timeSlotIdOfDay.appHoursEnd,
        'HH:mm',
        new Date(),
      );
      const formatAppHoursEndDate = setMinutes(
        setHours(appointmentDate, appHoursEnd.getHours()),
        appHoursEnd.getMinutes(),
      );

      const interviewAppointmentUpdated =
        await this.prismaService.appointment.update({
          where: {
            appointmentId: appointmentToUpdateId,
          },
          data: {
            consultantId,
            timeSlotId,
            appointmentDate,
            appHoursStart: formatAppHoursStartDate,
            appHoursEnd: formatAppHoursEndDate,
          },
          select: {
            appointmentId: true,
            note: true,
            consultant: {
              select: {
                userId: true,
                name: true,
                firstname: true,
              },
            },
            appointmentDate: true,
            timeSlots: true,
            appHoursStart: true,
            appHoursEnd: true,
          },
        });
      const formattedDate = format(
        new Date(interviewAppointmentUpdated.appointmentDate),
        'yyyy-MM-dd',
      );
      const hours = interviewAppointmentUpdated.timeSlots.appHoursStart;

      await this.mailerService.sendAppointmentConfirmationToCandidate(
        candidateName,
        candidateEmail,
        interviewAppointmentUpdated.note,
        formattedDate,
        hours,
        consultantName,
      );
      // On supprime une réponse de succès
      return {
        result: true,
        data: 'Job listing successfully updated',
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   DELETE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@  Cancel an appointment Access By Consultants and Candidates if they are linked to appointment  @@@@@@@@@@@@@@@@@@
  async cancelAppointment(myAppointmentId: number, requestingUserId: number) {
    try {
      // On verifie l'existence du consultant dans la BD
      await this.userService.verifyUsersExistence(requestingUserId);

      // On verifie l'existence du rendez-vous
      const appointment =
        await this.verifyAppointmentExistence(myAppointmentId);

      const candidateId = appointment.jobApplication.user.userId;
      const consultantId = appointment.consultant.userId;

      // Seule une des parties associées au rendez-vous peut l'annuler
      if (
        requestingUserId !== candidateId &&
        requestingUserId !== consultantId
      ) {
        throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_CANCEL);
      }
      // On supprime si le appointmentId existe et (consultant associé ou utilisateur associé à la postulation)
      const myAppointment = await this.prismaService.appointment.delete({
        where: {
          appointmentId: myAppointmentId,
        },
      });
      if (!myAppointment) {
        throw new NotFoundException(ErrorMessages.NOT_FOUND_APPOINTMENT);
      }

      // On supprime une réponse de succès
      return {
        result: true,
        data: 'Job listing successfully deleted',
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   Fonctions Privée  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // on verifie l'existence d'un Rendez-vous
  async verifyAppointmentExistence(appointmentId: number) {
    const appointmentExists = await this.prismaService.appointment.findUnique({
      where: {
        appointmentId: appointmentId,
      },
      select: {
        appointmentDate: true,
        consultant: {
          select: {
            userId: true,
            name: true,
            firstname: true,
          },
        },
        timeSlots: {
          select: {
            timeSlotId: true,
            title: true,
            appHoursStart: true,
            appHoursEnd: true,
          },
        },
        jobApplication: {
          select: {
            user: {
              select: {
                userId: true,
                name: true,
                firstname: true,
                email: true,
              },
            },
            jobListing: {
              select: {
                jobListingId: true,
                validate: true,
                jobClose: true,
                jobTitle: {
                  select: {
                    title: true,
                    jobTitleId: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!appointmentExists) {
      throw new NotFoundException(ErrorMessages.NOT_FOUND_APPOINTMENT);
    }

    return appointmentExists;
  }
  // On vérifie  que les dates ne soint pas des dates passées et ou ne tombent pas un week
  async checkDateNotPastNotWeek(appointmentDate: Date) {
    moment().toDate();

    // On converti 'appointmentDate' en objet moment pour faciliter la manipulation
    const appointmentMoment = moment(appointmentDate);

    // On vérifie si la date est strictement avant le début de la journée actuelle
    if (appointmentMoment.isBefore(moment().startOf('day'))) {
      throw new BadRequestException(ErrorMessages.INVALID_DATE);
    }

    // On vérifie si la date tombe un week-end
    const dayOfWeek = appointmentMoment.day();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      throw new BadRequestException(ErrorMessages.WEEKEND_DATE);
    }

    // Si aucune exception n'est levée, le jour est valable (on continue...)
  }
  // On verifie l'existence du crénea horaire
  async verifyTimeSlotExistence(timeSlotId: number) {
    const timeSlotExists = await this.prismaService.timeSlot.findUnique({
      where: {
        timeSlotId: timeSlotId,
      },
      select: {
        timeSlotId: true,
        appHoursStart: true,
        appHoursEnd: true,
        title: true,
      },
    });
    if (!timeSlotExists) {
      throw new NotFoundException(ErrorMessages.TIME_SLOT_NOT_FOUND);
    }
    return timeSlotExists; // Sinon La date et le créneau horaire sont disponibles.
  }
  // On verifie la disponibilité du consultant pour la journée et du créneau horaire.
  async checkConsultantAvailability(
    consultantId: number,
    timeSlotId: number,
    appointmentDate: Date,
  ) {
    // On verifie si le créneau est déjà occupé pour ce consultant
    const appointmentExists = await this.prismaService.appointment.findFirst({
      where: {
        consultantId: consultantId,
        timeSlotId: timeSlotId,
        appointmentDate: appointmentDate,
      },
    });
    return !!appointmentExists;
  }
  // Disponibilité du créneaux horraire du Consultant
  async checkConsultantTimeSlotAvailability(
    candidateId: number,
    timeSlotId: number,
    appointmentDate: Date,
  ) {
    const consultantTimeSlotAvailability =
      await this.prismaService.appointment.findFirst({
        where: {
          consultantId: candidateId,
          timeSlotId: timeSlotId,
          appointmentDate: appointmentDate,
        },
        select: {
          appointmentDate: true,
          timeSlots: {
            select: {
              title: true,
              appHoursStart: true,
              appHoursEnd: true,
            },
          },
        },
      });
    if (consultantTimeSlotAvailability) {
      // On formate 'appointmentDate' en utilisant moment.js
      const formattedDate = moment(
        consultantTimeSlotAvailability.appointmentDate,
      ).format('YYYY-MM-DD');

      const appointment = `${formattedDate} à ${consultantTimeSlotAvailability.timeSlots.title}`;
      throw new ConflictException(ErrorMessages.APPOINTMENT_EXISTS +`${appointment}`);
    }

    // Si aucune exception n'est levée, le créneau horaire est disponible (on continue...)
  }
  //  On vérifie l'unicité du Rendez-vous
  async checkAppointmentUniqueness(
    jobApplicationId: number,
    candidateId: number,
    jobTitleId: number,
    consultantId: number,
  ) {
    const appointmentWithSameConsultant =
      await this.prismaService.appointment.findFirst({
        where: {
          jobApplicationId: jobApplicationId,
          jobApplication: {
            user: {
              userId: candidateId,
            },
            jobListing: {
              jobTitle: {
                jobTitleId: jobTitleId,
              },
            },
          },
          consultantId: consultantId,
        },
        select: {
          appointmentDate: true,
          timeSlots: {
            select: {
              title: true,
              appHoursStart: true,
              appHoursEnd: true,
            },
          },
          consultant: {
            select: {
              name: true,
              firstname: true,
            },
          },
        },
      });
    if (appointmentWithSameConsultant) {
      // On formate 'appointmentDate' en utilisant moment.js
      const formattedDate = moment(
        appointmentWithSameConsultant.appointmentDate,
      ).format('YYYY-MM-DD');

      const appointment = `${formattedDate} de ${appointmentWithSameConsultant.timeSlots.title}`;
      throw new ConflictException(ErrorMessages.APPOINTMENT_EXISTS +`${appointment}`);
    }
    // On refait une deuxième vérification pour l'existence d'un rendez-vous avec un autre consultant pour la même candidature et le même poste
    const appointmentWithOtherConsultant =
      await this.prismaService.appointment.findFirst({
        where: {
          jobApplication: {
            userId: candidateId,
            jobListing: {
              jobTitleId: jobTitleId,
            },
          },
          consultantId: {
            not: consultantId, // On exclu le consultant actuel
          },
        },
        select: {
          appointmentDate: true,
          timeSlots: {
            select: {
              title: true,
              appHoursStart: true,
              appHoursEnd: true,
            },
          },
          consultant: {
            select: {
              name: true,
              firstname: true,
            },
          },
        },
      });
    if (appointmentWithOtherConsultant) {
      // On formate 'appointmentDate' en utilisant moment.js
      const formattedDate = moment(
        appointmentWithOtherConsultant.appointmentDate,
      ).format('YYYY-MM-DD');
      // On recupère le nom du Consultant
      const consultantName = `${appointmentWithOtherConsultant.consultant.name} ${appointmentWithOtherConsultant.consultant.firstname}`;
      // On recupère la date et l'heure
      const appointmentDateTime = `${formattedDate} de ${appointmentWithOtherConsultant.timeSlots.title}`;
      throw new ConflictException(ErrorMessages.APPOINTMENT_WITH_OTHER_CONSULTANT_EXISTS_1 +
        `${consultantName}` + ErrorMessages.APPOINTMENT_WITH_OTHER_CONSULTANT_EXISTS_2 + `${appointmentDateTime}`,
      );
    }
    // Si aucune exception n'est levée, le rendez-vous est unique (on continue...)
  }
  // On vérifie si le créneau d'horaire est bloqué
  async checkIfSlotIsBooked(
    consultantId: number,
    timeSlotId: number,
    date: Date,
  ) {
    // On utilise 'startOfDay' et 'endOfDay' pour couvrir toute la plage de la journée
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    // On recherche un rendez-vous qui se déroule à n'importe quel moment pendant la journée spécifiée
    const appointment = await this.prismaService.appointment.findFirst({
      where: {
        consultantId: consultantId,
        timeSlotId: timeSlotId,
        appointmentDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    return !!appointment;
  }

  private isValidTimeFormat(time: string): boolean {
    return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }
}
