import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUserId } from 'src/common/decorators/get-user-id.decorator';
import { CandidatGuard } from '../security/Guards/candidateGuard';
import { ConsultantGuard } from '../security/Guards/consultantGuard';
import { SaveJobGuard } from '../security/Guards/saveJobGuard';
import { CreateSavejobDto } from './dto/createSavejobDto';
import { SavejobService } from './savejob.service';
import { AdminGuard } from '../security/Guards/adminGuard';
import { UpdateSaveJobDto } from './dto/updateSaveJobDto';


@Controller('api/savejob')
export class SavejobController {
  constructor(private readonly saveJobService: SavejobService) {}

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   CREATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Save a job @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), SaveJobGuard)
  @Post('create')
  async createSaveJob(
    @Body() createSavejobDto: CreateSavejobDto,
    @GetUserId() requestingUserId: number, // Utilisation du décorateur pour récupérer l'ID de l'utilisateur
  ) {
    return this.saveJobService.createSaveJob(
      createSavejobDto,
      requestingUserId,
    );
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   READ  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Jobs saved By All Consultants @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('list-jobsaved-by-consultants')
  async getAllSaveJobsByConsultant() {
    return this.saveJobService.getAllSaveJobsByConsultant();
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Jobs saved By All Candidates  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), CandidatGuard)
  @Get('list-jobsaved-by-candidates')
  async getAllSaveJobsCandidates() {
    return this.saveJobService.getAllSaveJobsCandidates();
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Jobs saved  By Candidate Or Consultant @@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'))
  @Get('my-jobsaved')
  async myAllJobsSaved(@GetUserId() requestingUserId: number) {
    return this.saveJobService.myAllJobsSaved(requestingUserId);
  }















  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Jobs saved of the Consultant Access By Consultant Only @@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('my-jobsaved-consultant')
  async myAllJobsSavedConsultant(@GetUserId() consulatantId: number) {
    // Récupération de l'ID du candidat connecté depuis la requête
    return this.saveJobService.myAllJobsSavedConsultant(consulatantId);
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   Jobs saved Detail by jobSavedId Access By Consultant Only @@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('detail-jobsaved/:saveJobId')
  async detailConsultantJobsSavedByJobsaveId(
    @Param('saveJobId', ParseIntPipe) saveJobId: number,
  ) {
    return this.saveJobService.detailConsultantJobsSavedByJobsaveId(saveJobId);
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   Jobs saved Detail by jobSavedId Access By Consultant Only @@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), CandidatGuard)
  @Get('my-jobsaved-detail-candidate/:userId')
  async detailCandidateJobsSavedByJobsaveId(
    @Param('userId', ParseIntPipe) userId: number,
    @GetUserId() candidateId: number,
  ) {
    // Récupération de l'ID du candidat connecté depuis la requête
    return this.saveJobService.detailCandidateJobsSavedByJobsaveId(
      userId,
      candidateId,
    );
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   Jobs saved Detail by jobSavedId Access By Consultant Only @@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('jobsaved-by-joblisting/:jobListingId')
  async getAllJobsSavedByJobListingId(
    @Param('jobListingId', ParseIntPipe) jobListingId: number,
  ) {
    return this.saveJobService.getAllJobsSavedByJobListingId(jobListingId);
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  search all Jobs saved by ConsultantId  @@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('jobsaved-consultant/:userId')
  async getAllJobsSavedByConsultantId(
    @Param('userId', ParseIntPipe) userId: number,
    @GetUserId() candidateId: number,
  ) {
    return this.saveJobService.getAllJobsSavedByConsultantId(
      userId,
      candidateId,
    );
  }




  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   UPDATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Put('assign-to-consultant/:jobListingId')
  async assignmentTasksToConsultant(
    @Param('jobListingId') jobListingId: number,
    @Body() updateSaveJobDto: UpdateSaveJobDto,
  ) {
    return this.saveJobService.assignmentTasksToConsultant(jobListingId, updateSaveJobDto);
  }
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   DELETE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Delete my job saved by JoblistingId @@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), SaveJobGuard)
  @Delete('delete-my-jobsaved/:jobListingId')
  async deleteMyJobSavedByJobListingId(
    @Param('jobListingId', ParseIntPipe) jobListingId: number,
    @GetUserId() requestingUserId: number,
  ) {
    return this.saveJobService.deleteMyJobSavedByJobListingId(
      
      jobListingId,
      requestingUserId,
    );
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Delete all job saved where the associated joblisting is Closed  @@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Delete('delete-jobsaved-joblisting-close')
  async deleteAllJobSavedWhereJoblistingIsClosed() {
    return this.saveJobService.deleteAllJobSavedWhereJoblistingIsClosed();
  }
}
