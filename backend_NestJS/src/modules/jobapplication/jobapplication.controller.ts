import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Users } from '@prisma/client';
import { GetUserId } from 'src/common/decorators/get-user-id.decorator';
import { CandidatGuard } from '../security/Guards/candidateGuard';
import { ConsultantGuard } from '../security/Guards/consultantGuard';
import { joblistingGuard } from '../security/Guards/joblistingGuard';
import { CreateJobApplicationDto } from './dto/createJobApplicationDto';
import { UpdateJobApplicationDto } from './dto/updateJobApplicationDto';
import { UpdateJobApplicationInterviewsDto } from './dto/updateJobApplicationInterviewsDto';
import { JobapplicationService } from './jobapplication.service';
import { RecruiterGuard } from '../security/Guards/recruiterGuard';

@Controller('api/jobapplication')
export class JobapplicationController {
  constructor(private readonly jobApplicationService: JobapplicationService) {}

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   CREATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Créer une nouvelle postulation pour un emploi @@@@@@@@@@@@@@@@@

  @UseGuards(AuthGuard('jwt'), CandidatGuard)
  @Post('create')
  async createJobApplication(
    @Body() createJobApplicationDto: CreateJobApplicationDto,
    @GetUserId() candidateId: number,
  ) {
    return this.jobApplicationService.createJobApplication(
      createJobApplicationDto,
      candidateId,
    );
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   READ  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$


 // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Job Applications of the Candidate Access By Candidate @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 @UseGuards(AuthGuard('jwt'), CandidatGuard)
 @Get('my-jobapplications')
 async allJobApplicationsOfCandidat(@GetUserId() candidateId: number) {
   return this.jobApplicationService.allJobApplicationsOfCandidat(candidateId);
 }


  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Liste les candidatures par recruteur avec infos sélectionnées.  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), RecruiterGuard)
  @Get('job-applications-by-recruiter')
  async findJobListingsWithApplications( @GetUserId() userId: number) {
    return this.jobApplicationService.findJobListingsWithApplications(userId);
  }
  
  
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Liste les candidatures suivies par le consultant avec infos sélectionnées.  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('all-job-applications-follow-up-consultant')
  async findAllJobApplicationsFollowUpByConsultant(@GetUserId() userId: number) {
    return this.jobApplicationService.findAllJobApplicationsFollowUpByConsultant(userId);
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Récupérer toutes les candidatures @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('list')
  async getAllJobApplications() {
    return this.jobApplicationService.getAllJobApplications();
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Job Applications Where Interview is OK Acces By Consultant @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('jobAppli-list-interview-ok')
  async allJobApplicationsWhereInterviewOK() {
    return this.jobApplicationService.allJobApplicationsWhereInterviewOK();
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Job Applications by User ID Acces By Consultant @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('jobAppli-by-candidate/:userId')
  async allJobApplicationsByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() request: Request & { user: Users },
  ) {
    // Récupération de l'ID de l'utilisateur connecté depuis la requête
    const consultantId = request.user.userId;
    return this.jobApplicationService.allJobApplicationsByUserId(
      consultantId,
      userId,
    );
  } 

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Job Applications by Job Listing ID. Acces By Consultant or Recruiter @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), joblistingGuard)
  @Get('jobAppli-by-joblisting/:jobListingId')
  async allJobApplicationsByJobListingId( @Param('jobListingId', ParseIntPipe) jobListingId: number,
    @GetUserId() requestingUserId: number,
  ) {
    return this.jobApplicationService.allJobApplicationsByJobListingId(
      requestingUserId,
      jobListingId,
    );
  }
  
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Job Application Detail Access by Admin, Consultant, Recruiter, Candidate  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), joblistingGuard)
  @Get('jobAppli-detail/:jobApplicationId')
  async jobApplicationDetail(
    @Param('jobApplicationId', ParseIntPipe) jobApplicationId: number,
    @GetUserId() candidateId: number,
  ) {
    return this.jobApplicationService.jobApplicationDetail(
      jobApplicationId,
      candidateId,
    );
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   UPDATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Update job application status, Access By Consulant @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Put('update-job-Appli-status/:jobApplicationId')
  async validateJobApplication(
    @Param('jobApplicationId', ParseIntPipe) jobApplicationId: number,
    @GetUserId() consultantId: number,
    @Body() updateJobApplicationDto: UpdateJobApplicationDto,
  ) {
    return this.jobApplicationService.validateJobApplication(
      jobApplicationId,
      consultantId,
      updateJobApplicationDto,
    );
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Result after job interview @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Put('update-job-Appli-interview/:jobApplicationId')
  async resultJobApplicationInterviews(
    @Param('jobApplicationId', ParseIntPipe) jobApplicationId: number,
    @GetUserId() consultantId: number,
    @Body()
    updateJobApplicationInterviewsDto: UpdateJobApplicationInterviewsDto,
  ) {
    return this.jobApplicationService.resultJobApplicationInterviews(
      jobApplicationId,
      updateJobApplicationInterviewsDto,
      consultantId,
    );
  }


  
   // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Update ADD note after Interview @@@@@@@@@@@@@@@@@@@@
   @UseGuards(AuthGuard('jwt'), ConsultantGuard)
   @Get('update-interview/:jobApplicationId')
   updateAddNoteInterview(@Param('jobApplicationId', ParseIntPipe) jobApplicationId: number) {
     return this.jobApplicationService.updateAddNoteInterview(jobApplicationId);
   }


  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   DELETE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Delete a Job application. Acces by Consultant @@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:jobApplicationId')
  async deleteJobApplication(
    @Param('jobApplicationId', ParseIntPipe) jobApplicationId: number,
    @Req() req: Request & { user: Users },
  ) {
    // Récupération de l'ID du candidat connecté depuis la requête
    const requestingUserId = req.user?.userId;
    return this.jobApplicationService.deleteJobApplication(
      jobApplicationId,
      requestingUserId,
    );
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Delete my Job application. Acces by Candidate @@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), CandidatGuard)
  @Delete('delete-my-jobapplications/:jobApplicationId')
  async deleteMyJobApplication(
    @Param('jobApplicationId', ParseIntPipe) jobApplicationId: number,
    @Req() req: Request & { user: Users },
  ) {
    // Récupération de l'ID du candidat connecté depuis la requête
    const requestingUserId = req.user?.userId;
    return this.jobApplicationService.deleteMyJobApplication(
      jobApplicationId,
      requestingUserId,
    );
  }
/*  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Delete all Job application where deadline now @@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Delete('delete-job-Appli-deadline-now')
  async deleteAllJobApplicationWhereDeadlineIsNow() {
    return this.jobApplicationService.deleteAllJobApplicationWhereDeadlineIsNow();
  } */
}
