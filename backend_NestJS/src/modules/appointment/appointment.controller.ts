import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Users } from '@prisma/client';
import { GetUserId } from 'src/common/decorators/get-user-id.decorator';
import { CandidatGuard } from '../security/Guards/candidateGuard';
import { ConsultantGuard } from '../security/Guards/consultantGuard';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/createAppointmemtDto';
import { UpdateAppointmentDto } from './dto/updateAppointmentDto';

@Controller('api/appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   CREATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Create a new Appointment @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Post('create')
  async createAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Req() req: Request & { user: Users },
  ) {
    // On recupere le Id de l'utilisateur
    const consultantId = req.user.userId;
    return this.appointmentService.createAppointment(
      createAppointmentDto,
      consultantId,
    );
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   READ  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ My Future Appointment grouped by day, Week, Moth @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('my-future-appointments-by-day-week-month-all/:filter')
  async getMyAllFutureAppointmentsGrouped(
    @Param('filter') filter: string,
    @GetUserId() consultantId: number,
  ) {
    // On vérifie la validité du filtre
    const validFilters = ['day', 'week', 'month', 'all'] as const; // On utilise 'as const' pour affiner le type à des valeurs spécifiques
    if (!validFilters.includes(filter as any)) {
      return {
        message: `Filtre invalide. Les options valides sont: ${validFilters.join(', ')}.`,
      };
    }
    // Appel du service avec le filtre validé
    return this.appointmentService.getMyAllFutureAppointmentsGrouped(
      consultantId,
      filter as 'day' | 'week' | 'month' | 'all',
    );
  }


  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('my-appointment-consultant')
  async getMyAllFutureAppointmentsConsultant(@GetUserId() consultantId: number) {
    return this.appointmentService.getMyAllFutureAppointmentsConsultant(consultantId);
  }

    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Chercher Dans mes RDV  par un mot clé @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('search-in-my-appointment')
  async searchInfoInMyAppointment(@Query('keyword') keyword: string, @GetUserId() consultantId: number) {
   
    return this.appointmentService.searchInfoInMyAppointment(keyword,  consultantId);

  }

  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('all-future-appointments')
  async getAllFutureAppointmentsGrouped() {
    // Appel du service avec le filtre validé
    return this.appointmentService.AllFutureAppointmentsGrouped();
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Chercher un comptes validé par un mot clé @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('search-info-in-appointment')
  async searchInfoInAppointmrnt(@Query('keyword') keyword: string) {
    return this.appointmentService.searchInfoInAppointment(keyword);
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   My all appointment, Access By Consultant @@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), CandidatGuard)
  @Get('my-appointment-consultant')
  async getMyCandidateAppointmentConsultant(@GetUserId() candidateId: number) {
    return this.appointmentService.getMyAppointmentConsultant(candidateId);
  }

  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++ CANDIDATE +++++++++++++++++++++++++++++++++++++*/
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   My appointment detail, Access By Candidate @@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), CandidatGuard)
  @Get('candidate-appointment')
  async getCandidateAppointmentDetail(@GetUserId() candidateId: number) {
    return this.appointmentService.getCandidateAppointmentDetail(candidateId);
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   My all appointment, Access By Candidate @@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), CandidatGuard)
  @Get('my-appointment-candidate')
  async getMyAppointmentCandidate(@GetUserId() candidateId: number) {
    return this.appointmentService.getMyAppointmentCandidate(candidateId);
  }

  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++ CANDIDATE +++++++++++++++++++++++++++++++++++++*/

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All past appointments  , Access All Consultants  @@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('past-appointments')
  async getAllPastAppointments() {
    return this.appointmentService.getAllPastAppointments();
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All future appointments  , Access All Consultants  @@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('future-appointments')
  async getAllFutureAppointments() {
    return this.appointmentService.getAllFutureAppointments();
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   appointment detail by appointmentId, Access All Consultants  @@@@@@@@@@@@@@@@@@@@@@@@@@@
 /* @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('appointments-detail/:appointmentId')
  async getAppointmentDetail(
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
  ) {
    return this.appointmentService.getAppointmentDetail(appointmentId);
  } */
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   All appointment, By ConsultantId, Access By all Consultants  @@@@@@@@@@@@@@@@@@@@@@@@@@@
  /* @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('appointments-by-consultant-id/:consultantId')
  async getAllAppointmentByConsultantId(
    @Param('consultantId', ParseIntPipe) consultantId: number,
  ) {
 return this.appointmentService.getAllAppointmentByConsultantId(
      consultantId,
    );
  } */

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   My appointment detail, Access By Consultant @@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('my-appointment-detail/:appointmentId')
  async getMyAppointment(
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
    @GetUserId() consultantId: number
  ) {

    return this.appointmentService.getMyAppointmentDetail(
      appointmentId,
      consultantId,
    );
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   My Last appointment, To know my next awailability  @@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('my-last-appointments')
  async getMyLastAppointment(@Req() req: Request & { user: Users }) {
    // Recupère le  ID de l'utilisateur
    const consultantId = req.user.userId;
    return this.appointmentService.getMyNextAwailability(consultantId);
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ My available time slots from now until my last appointment @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('my-available-timeslots-now-until')
  async getMyAwailabilityTimeSlotsNowLastAppointment(
    @Req() req: Request & { user: Users },
  ) {
    // Recupère le  ID de l'utilisateur
    const consultantId = req.user.userId;
    return this.appointmentService.getMyAwailabilityTimeSlotsNowLastAppointment(
      consultantId,
    );
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Candidat all past appointments  , Access by consultant  @@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('my-past-appointments-by-day-week-month-all/:filter')
  async getMyAllPastAppointmentsGrouped(
    @Param('filter') filter: string,
    @Req() req: Request & { user: Users },
  ) {
    // On recupère le Id de l'utilisateur
    const consultantId = req.user.userId;

    // On vérifie la validité du filtre
    const validFilters = ['day', 'week', 'month', 'all'] as const; // On utilise 'as const' pour affiner le type à des valeurs spécifiques
    if (!validFilters.includes(filter as any)) {
      return {
        message: `Filtre invalide. Les options valides sont: ${validFilters.join(', ')}.`,
      };
    }

    return this.appointmentService.getMyAllPastAppointmentsGrouped(
      consultantId,
      filter as 'day' | 'week' | 'month' | 'all',
    );
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   UPDATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Updating Appointment @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Put('update-appointment/:appointmentId')
  async UpdateAppointment(
    @Param('appointmentId', ParseIntPipe) appointmentToUpdateId: number,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @GetUserId()consultantId: number
  ) {
    return this.appointmentService.UpdateAppointment(
      appointmentToUpdateId,
      updateAppointmentDto,
      consultantId,
    );
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   DELETE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@  Cancel an appointment Access By Consultants and Candidates if they are linked to appointment  @@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'))
  @Delete('delete-my-appointment/:appointmentId')
  async cancelAppointment(
    @Param('appointmentId', ParseIntPipe) myAppointmentId: number,
    @GetUserId() requestingUserId: number ,
  ) {

    return this.appointmentService.cancelAppointment(
      myAppointmentId,
      requestingUserId,
    );
  }
}
