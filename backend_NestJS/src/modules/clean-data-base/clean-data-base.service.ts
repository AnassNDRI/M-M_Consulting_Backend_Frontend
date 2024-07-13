import { Injectable } from '@nestjs/common';
import { format, startOfDay } from 'date-fns';
import { MailerService } from '../mailer/mailer.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CleanDataBaseService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   EXECUTION DES TACHES PLANIFIEES $$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Deleting all inactive accounts with expired confirmationMailTokenExpires  @@@@@@
  //   @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) //  EVERY_DAY_AT_MIDNIGHT = "0 0 * * *",
  // @Cron(CronExpression.EVERY_10_SECONDS) EVERY_10_SECONDS = "*/10 * * * * *",
  /*   async handleCronDeleteExpiredConfirmationTokens() {
        await this.deleteExpiredConfirmationTokens();
    } */
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings List where deadline is Now @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //   @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) //  EVERY_DAY_AT_MIDNIGHT = "0 0 * * *",
  // @Cron(CronExpression.EVERY_10_SECONDS) EVERY_10_SECONDS = "*/10 * * * * *",
  /*  async handleCronGetAllJobListingsWithDeadlineIsNow() {
        await this.getAllJobListingsWithDeadlineIsNow();
    } */
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings List where deadline is Now @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //   @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) //  EVERY_DAY_AT_MIDNIGHT = "0 0 * * *",
  // @Cron(CronExpression.EVERY_10_SECONDS) EVERY_10_SECONDS = "*/10 * * * * *",
  /*   async handleCronDeleteAllJobListingsWithDeadlineExpiredByTwoWeek() {
        await this.DeleteAllJobListingsWithDeadlineExpiredAfterTwoWeek();
    } */
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings List where deadline is Now @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //   @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) //  EVERY_DAY_AT_MIDNIGHT = "0 0 * * *",
  // @Cron(CronExpression.EVERY_10_SECONDS) EVERY_10_SECONDS = "*/10 * * * * *",
  /* async handleCronDeleteAllJobListingsWithDeadlineExpiredByTwoDays() {
        await this.DeleteAllJobListingsWithDeadlineExpiredAfterTwoDays();
    }*/
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Delete all Job application where deadline now @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //   @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) //  EVERY_DAY_AT_MIDNIGHT = "0 0 * * *",
  // @Cron(CronExpression.EVERY_10_SECONDS) EVERY_10_SECONDS = "*/10 * * * * *",
  /*  async handleCrondeleteAllJobApplicationWhereDeadlineIsNow() {
        await this.handleCrondeleteAllJobApplicationWhereDeadlineIsNow();
    }*/
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Delete all job saved where the associated joblisting is Closed  @@@@@@@@@@@@@@@@@
  //  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) //  EVERY_DAY_AT_MIDNIGHT = "0 0 * * *",
  // @Cron(CronExpression.EVERY_10_SECONDS) EVERY_10_SECONDS = "*/10 * * * * *",
  /*  async handleCrondeleteAllJobSavedWhereJoblistingIsClosed() {
        // Récupérer les emplois sauvés
        await this.handleCrondeleteAllJobSavedWhereJoblistingIsClosed();
        
    }*/

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   METHODES DES TACHES PLANIFIEES  $$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Deleting all inactive accounts with expired confirmationMailTokenExpires @@@@@@@@@@
  async deleteExpiredConfirmationTokens() {
    const now = new Date();
    await this.prismaService.users.deleteMany({
      where: {
        AND: [
          { confirmationMailToken: { not: null } },
          { confirmationMailTokenExpires: { lt: now } },
          { verifiedMail: false },
        ],
      },
    });
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings List where deadline is Now @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllJobListingsWithDeadlineIsNow() {
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
          },
        },
        jobTitle: {
          select: {
            title: true,
          },
        },
      },
    });
    // On va parcourir cette liste d'emploi
    for (const joblisting of joblistings) {
      // Formatage de la date
      const deadline = joblisting.deadline;
      const deadlineToDelete = joblisting.deadlineExpires;
      // Utilisation de Moment.js pour formater la date et l'heure
      const formattedDeadlineToDelete = format(
        new Date(deadlineToDelete),
        'dd/MM/yyyy HH:mm',
      );
      const formattedDeadline = format(new Date(deadline), 'dd/MM/yyyy HH:mm');
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
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings with deadline expired after two week @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async DeleteAllJobListingsWithDeadlineExpiredAfterTwoWeek() {
    // Date d'aujourd'hui à minuit,;
    const startOfToday = startOfDay(new Date());

    await this.prismaService.jobListings.deleteMany({
      where: {
        deadlineExpires: {
          lte: startOfToday, // 'lte' pour 'less than or equal', inclut les annonces expirant aujourd'hui
        },
      },
    });
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings To Update with deadline expired by two Days @@@@@@@@@@@@@@@@@@@@@@@@@
  async DeleteAllJobListingsWithDeadlineExpiredAfterTwoDays() {
    // Date d'aujourd'hui à minuit,
    const startOfToday = startOfDay(new Date());

    await this.prismaService.jobListings.deleteMany({
      where: {
        deadlineToDeleteNotConfirm: {
          lte: startOfToday, // 'lte' pour 'less than or equal', inclut les annonces expirant aujourd'hui
        },
      },
    });
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Delete all Job application where deadline now @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async deleteAllJobApplicationWhereDeadlineIsNow() {
    // Date d'aujourd'hui à minuit,
    const startOfToday = startOfDay(new Date());

    await this.prismaService.jobApplications.deleteMany({
      where: {
        deadlineToDelete: {
          lte: startOfToday, // 'lte' pour 'less than or equal', inclut les annonces expirant aujourd'hui
        },
      },
    });
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Delete all job saved where the associated joblisting is Closed  @@@@@@@@@@@@@@@@@
  async deleteAllJobSavedWhereJoblistingIsClosed() {
    // Récupérer les emplois sauvés
    await this.prismaService.saveJobs.deleteMany({
      where: {
        jobListing: {
          jobClose: true,
        },
      },
    });
  }
}
