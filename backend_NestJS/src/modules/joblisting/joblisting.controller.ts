import {
  BadRequestException,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  Body,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { GetUserId } from 'src/common/decorators/get-user-id.decorator';
import { ConsultantGuard } from '../security/Guards/consultantGuard';
import { joblistingGuard } from '../security/Guards/joblistingGuard';
import { OptionalAuthGuard } from '../security/Guards/optionalAuthGuard';
import { RecruiterGuard } from '../security/Guards/recruiterGuard';
import { CreateJobListingDto } from './dto/createJoblistingDto';
import { InvalidateToDeleteJobListingDto } from './dto/invalidateToDeleteJoblistingDto';
import { UpdateJobListingDto } from './dto/updateJoblistingDto';
import { ValidateJobListingDto } from './dto/validateJoblistingDto';
import { JoblistingService } from './joblisting.service';
import { CloseJobListingDto } from './dto/closeJobListingDto';

@Controller('api/joblistings')
export class JoblistingController {
  constructor(private readonly joblistingService: JoblistingService) {}

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   CREATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Create Job Listing @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), RecruiterGuard)
  @Post('job-publishing')
  async createJobListing(
    @Body() createJobListingDto: CreateJobListingDto,
    @GetUserId() recruiterId: number,
  ) {
    // On appelle la méthode signup avec l'ID de l'utilisateur effectuant la requête
    return this.joblistingService.createJobListing(
      createJobListingDto,
      recruiterId,
    );
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   READ  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job listing verifed, Acces by All USERS  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(OptionalAuthGuard)
  @Get('joblists-verified') //joblistings/joblists-verified
  async getAllVerifiedJobListings(@GetUserId() userId?: number) {
    // Appel du service avec userId. Si l'utilisateur n'est pas connecté, userId sera undefined
    return this.joblistingService.getJobListingsActive(userId);
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Job Listing Detail  By ALL Users Connected or No  @@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(OptionalAuthGuard)
  @Get('detail-jobListing/:jobListingId')
  async jobListingDetailByAll(
    @Param('jobListingId', ParseIntPipe) jobListingId: number,
    @GetUserId() requestingUserId?: number,
  ) {
    return this.joblistingService.jobListingDetailByAll(
      jobListingId,
      requestingUserId,
    );
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par un mot clé @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('search-job-by-admin')
  async searchAllJoblistingsByKeyword(@Query('keyword') keyword: string) {
    return this.joblistingService.searchAllJoblistingsByKeyword(keyword);
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par un mot clé acces candidate  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('search-job-validate-for-candidate')
  async searchJoblistingValidateByKeyword(@Query('keyword') keyword: string) {
    return this.joblistingService.searchJoblistingValidateForCandidateByKeyword(
      keyword,
    );
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par un mot clé dans la description @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('search-job-validate-admin')
  async searchJoblistingValidateByKeywordAdmin(
    @Query('keyword') keyword: string,
  ) {
    return this.joblistingService.searchJoblistingValidateByKeywordAdmin(
      keyword,
    );
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par un mot clé dans la description @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('search-job-invalidate')
  async searchJoblistingInvalidateByKeyword(@Query('keyword') keyword: string) {
    return this.joblistingService.searchJoblistingInvalidateByKeyword(keyword);
  }

  /*
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  chercher un emploi par un mot clé dans la description @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //@UseGuards(AuthGuard('jwt'), joblistingGuard)
  @Get('search-job-in-description-by-admin')
  async searchByJobInDescriptionByAdmi(@Query('keyword') keyword: string) {
    return this.joblistingService.searchByJobInDescriptionByAdmin(keyword);
  } */

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Par le nom d'une localité  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('search-job-by-location/:jobLocationId')
  async findJobListingsByJobLocation(
    @Param('jobLocationId', ParseIntPipe) jobLocationId: number,
  ) {
    return this.joblistingService.findJobListingsByJobLocation(jobLocationId);
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Par le nom d'une localité  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('search-job-by-location-candidate/:jobLocationId')
  async findJobListingsByJobLocationAccessCandidate(
    @Param('jobLocationId', ParseIntPipe) jobLocationId: number,
  ) {
    return this.joblistingService.findJobListingsByJobLocationAccessCandidate(
      jobLocationId,
    );
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Par le nom d'une localité  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('search-job-by-location-invalidate/:jobLocationId')
  async findJobListingsInvalidateByJobLocation(
    @Param('jobLocationId', ParseIntPipe) jobLocationId: number,
  ) {
    return this.joblistingService.findJobListingsInvalidateByJobLocation(
      jobLocationId,
    );
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Par le nom d'une localité  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('search-job-by-location-validate/:jobLocationId')
  async findJobListingsValidateByJobLocation(
    @Param('jobLocationId', ParseIntPipe) jobLocationId: number,
  ) {
    return this.joblistingService.findJobListingsValidateByJobLocation(
      jobLocationId,
    );
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Par un Type de Contrat  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('search-job-by-contrat/:contractTypeId')
  async findJobListingsByContractTypeByAdmin(
    @Param('contractTypeId', ParseIntPipe) contractTypeId: number,
  ) {
    return this.joblistingService.findJobListingsByContractTypeByAdmin(
      contractTypeId,
    );
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Par un Type de Contrat  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('search-job-by-contrat-candidate/:contractTypeId')
  async findJobListingsByContractTypeAccessCandidate(
    @Param('contractTypeId', ParseIntPipe) contractTypeId: number,
  ) {
    return this.joblistingService.findJobListingsByContractTypeAccessCandidate(
      contractTypeId,
    );
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Par un Type de Contrat  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('search-job-by-contrat-validate/:contractTypeId')
  async findJobListingsByContractTypeAccessValidate(
    @Param('contractTypeId', ParseIntPipe) contractTypeId: number,
  ) {
    return this.joblistingService.findJobListingsByContractTypeValidate(
      contractTypeId,
    );
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Par un Type de Contrat  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('search-job-by-contrat-invalidate/:contractTypeId')
  async findJobListingsByContractTypeInvalidate(
    @Param('contractTypeId', ParseIntPipe) contractTypeId: number,
  ) {
    return this.joblistingService.findJobListingsByContractTypeInvalidate(
      contractTypeId,
    );
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Par un nom de compagnie  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('search-job-by-company/:userId')
  async findJobListingsByCompanyName(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.joblistingService.findJobListingsByCompanyName(userId);
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Par un nom de compagnie  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('search-job-by-company-candidate/:userId')
  async findJobListingsByCompanyNameAccessCandidate(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.joblistingService.findJobListingsByCompanyNameAccessCandidate(
      userId,
    );
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Par un nom de compagnie  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('search-job-by-company-invalidate/:userId')
  async findJobListingsByCompanyNameInvalidate(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.joblistingService.findJobListingsByCompanyNameInvalidate(
      userId,
    );
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Par un nom de compagnie  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('search-job-by-company-validate/:userId')
  async findJobListingsByCompanyNameValidate(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.joblistingService.findJobListingsByCompanyNameValidate(userId);
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Par le nom d'une fonction   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('search-job-by-function/:jobTitleId')
  async findJobListingsByJobTitle(
    @Param('jobTitleId', ParseIntPipe) jobTitleId: number,
  ) {
    return this.joblistingService.findJobListingsByJobTitle(jobTitleId);
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Par le nom d'une fonction par Candidat   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('search-job-by-function-candidate/:jobTitleId')
  async findJobListingsByJobTitleAccessByCandidate(
    @Param('jobTitleId', ParseIntPipe) jobTitleId: number,
  ) {
    return this.joblistingService.findJobListingsByJobTitleAccessByCandidate(
      jobTitleId,
    );
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Par job invalidé le nom d'une fonctin   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('search-job-by-function-invalidate/:jobTitleId')
  async findJobListingsInvalidateByJobTitle(
    @Param('jobTitleId', ParseIntPipe) jobTitleId: number,
  ) {
    return this.joblistingService.findJobListingsInvalidateByJobTitle(
      jobTitleId,
    );
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Jobs validés le nom d'une fonction par Candidat   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('search-job-by-function-validate/:jobTitleId')
  async findJobListingsValidateByJobTitle(
    @Param('jobTitleId', ParseIntPipe) jobTitleId: number,
  ) {
    return this.joblistingService.findJobListingsValidateByJobTitle(jobTitleId);
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ All Job Listings grouped by day, Week, Moth Acces Admin @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('all-jobs-grouped-by-day-week-month-all/:filter')
  async getAllJobListingsGrouped(@Param('filter') filter: string) {
    // On vérifie la validité du filtre
    const validFilters = ['day', 'week', '2weeks', 'month', 'all'] as const; // Inclure "2 weeks" dans les filtres valides
    if (!validFilters.includes(filter as any)) {
      // Lancer une exception BadRequestException pour gérer correctement l'erreur
      throw new BadRequestException(
        `Filtre invalide. Les options valides sont: ${validFilters.join(', ')}.`,
      );
    }
    // Appel du service avec le filtre validé
    return this.joblistingService.getAllJobListingsGroupedAccessByAdmin(
      filter as 'day' | 'week' | '2weeks' | 'month' | 'all',
    );
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ All Job Listings grouped by day, Week, Moth Acces Candidate @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('jobs-grouped-by-day-week-month-all-for-candidate/:filter')
  async getAllJobListingsGroupedForCandidate(@Param('filter') filter: string) {
    // On vérifie la validité du filtre
    const validFilters = ['day', 'week', '2weeks', 'month', 'all'] as const; // Inclure "2 weeks" dans les filtres valides
    if (!validFilters.includes(filter as any)) {
      // Lancer une exception BadRequestException pour gérer correctement l'erreur
      throw new BadRequestException(
        `Filtre invalide. Les options valides sont: ${validFilters.join(', ')}.`,
      );
    }
    // Appel du service avec le filtre validé
    return this.joblistingService.getAllJobListingsValidateGroupedForCandidate(
      filter as 'day' | 'week' | '2weeks' | 'month' | 'all',
    );
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ All Job Listings grouped by day, Week, Moth VALIDATE @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('jobs-grouped-by-day-week-month-all-validate/:filter')
  async getAllJobListingsGroupedValidate(@Param('filter') filter: string) {
    // On vérifie la validité du filtre
    const validFilters = ['day', 'week', '2weeks', 'month', 'all'] as const; // Inclure "2 weeks" dans les filtres valides
    if (!validFilters.includes(filter as any)) {
      // Lancer une exception BadRequestException pour gérer correctement l'erreur
      throw new BadRequestException(
        `Filtre invalide. Les options valides sont: ${validFilters.join(', ')}.`,
      );
    }
    // Appel du service avec le filtre validé
    return this.joblistingService.getAllJobListingsValidateGroupedForCandidate(
      filter as 'day' | 'week' | '2weeks' | 'month' | 'all',
    );
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ All Job Listings grouped by day, Week, Moth  INVALIDATE @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('jobs-grouped-by-day-week-month-all-invalidate/:filter')
  async getAllJobListingsGroupedInvalidate(@Param('filter') filter: string) {
    // On vérifie la validité du filtre
    const validFilters = ['day', 'week', '2weeks', 'month', 'all'] as const; // Inclure "2 weeks" dans les filtres valides
    if (!validFilters.includes(filter as any)) {
      // Lancer une exception BadRequestException pour gérer correctement l'erreur
      throw new BadRequestException(
        `Filtre invalide. Les options valides sont: ${validFilters.join(', ')}.`,
      );
    }
    // Appel du service avec le filtre validé
    return this.joblistingService.getAllJobListingsInvalidateGroupedAccessByAdmin(
      filter as 'day' | 'week' | '2weeks' | 'month' | 'all',
    );
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job listing, Acces ADMIN  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('joblists') //joblistings/joblists-verified
  async getAllJobListings(@GetUserId() userId: number) {
    // Appel du service avec userId. Si l'utilisateur n'est pas connecté, userId sera undefined
    return this.joblistingService.getJobListings(userId);
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job listing, Acces ADMIN  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('joblists-active') //joblistings/joblists-verified
  async getJobListingsActive(@GetUserId() userId: number) {
    // Appel du service avec userId. Si l'utilisateur n'est pas connecté, userId sera undefined
    return this.joblistingService.getJobListingsActive(userId);
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job listing, Acces ADMIN  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('joblists-inactive') //joblistings/joblists-verified
  async getJobListingsInactive() {
    // Appel du service avec userId. Si l'utilisateur n'est pas connecté, userId sera undefined
    return this.joblistingService.getJobListingsInactive();
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Access By Consultant @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('joblists-disable')
  async getAllJobListingsDisable() {
    return this.joblistingService.getAllJobListingsDisable();
  }

  // °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°° METHODE USING °°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°°

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Par le nom d'une localité  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('search-job-by-location-by-admin/:jobLocationId')
  async findJobListingsByJobLocationByAdmin(
    @Param('jobLocationId', ParseIntPipe) jobLocationId: number,
  ) {
    return this.joblistingService.findJobListingsByJobLocationByAdmin(
      jobLocationId,
    );
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Par le nom d'une fonction   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('search-job-by-function-by-admin/:jobTitleId')
  async findJobListingsByJobTitleByAdmin(
    @Param('jobTitleId', ParseIntPipe) jobTitleId: number,
  ) {
    return this.joblistingService.findJobListingsByJobTitleByAdmin(jobTitleId);
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ All Job Listings grouped by day, Week, Moth @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('jobs-grouped-by-day-week-month-all-by-admin/:filter')
  async getAllJobListingsGroupedByAdmin(@Param('filter') filter: string) {
    // On vérifie la validité du filtre
    const validFilters = ['day', 'week', '2weeks', 'month', 'all'] as const; // Inclure "2 weeks" dans les filtres valides
    if (!validFilters.includes(filter as any)) {
      // Lancer une exception BadRequestException pour gérer correctement l'erreur
      throw new BadRequestException(
        `Filtre invalide. Les options valides sont: ${validFilters.join(', ')}.`,
      );
    }
    // Appel du service avec le filtre validé
    return this.joblistingService.getAllJobListingsGroupedByAdmin(
      filter as 'day' | 'week' | '2weeks' | 'month' | 'all',
    );
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ My All Jobs Published by Recruiter   @@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), RecruiterGuard)
  @Get('my-jobs-published')
  async AlljobListingOfRecruiter(@GetUserId() recruiterId: number) {
    return this.joblistingService.AlljobListingOfRecruiter(recruiterId);
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  where validate validate is null @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('joblists-disable-to-validate')
  async getAllJobListingsToValidate() {
    return this.joblistingService.getAllJobListingsToValidate();
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   where deadline is Now @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('jobs-deadline-now')
  async getAllJobListingsWithDeadlineIsNow() {
    return this.joblistingService.getAllJobListingsWithDeadlineIsNowAndSendMail();
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  all jobs of recruiter recruiterId Access By Consultant @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('recruiter-jobs-published/:userId')
  async jobListingsByRecruiterId(
    @Param('userId', ParseIntPipe) recruiterId: number,
  ) {
    return this.joblistingService.jobListingsByRecruiterId(recruiterId);
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Where deadline expired after two week @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('jobs-deadline-expired-two-weeks')
  async getAllJobListingsWithDeadlineExpiredAfterTwoWeek() {
    return this.joblistingService.getAllJobListingsWithDeadlineExpiredAfterTwoWeek();
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ To Update with deadline expired after two Days @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('jobs-deadline-expired-two-days')
  async getAllJobListingsWithDeadlineExpiredAfterTwoDays() {
    return this.joblistingService.getAllJobListingsWithDeadlineExpiredAfterTwoDays();
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   UPDATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   Update Job Listing by Recruiter @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), RecruiterGuard)
  @Put('update-job-befor-published/:jobListingId')
  async updateJobListing(
    @Param('jobListingId', ParseIntPipe) jobListingToUpdate: number,
    @GetUserId() recruiterId: number,
    @Body() updateJobListingDto: UpdateJobListingDto,
  ) {
    return this.joblistingService.updateJobListingBeforPublished(
      jobListingToUpdate,
      recruiterId,
      updateJobListingDto,
    );
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listing validate by consulatant @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Put('validate-job-published/:jobListingId')
  async validateJobListing(
    @Param('jobListingId', ParseIntPipe) jobListingToValidate: number,
    @GetUserId() consultantId: number,
    @Body() validateJobListingDto: ValidateJobListingDto,
  ) {
    return this.joblistingService.validateJobListing(
      jobListingToValidate,
      consultantId,
      validateJobListingDto,
    );
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listing invalidate by consulatant and detele @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Put('invalidate-delete-job-published/:jobListingId')
  async invalidateToDeleteJobListing(
    @Param('jobListingId', ParseIntPipe) jobListingInvalidateToDelete: number,
    @GetUserId() consultantId: number,
    @Body() invalidateToDeleteJobListingDto: InvalidateToDeleteJobListingDto,
  ) {
    return this.joblistingService.invalidateToDeleteJobListing(
      jobListingInvalidateToDelete,
      consultantId,
      invalidateToDeleteJobListingDto,
    );
  }


   // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listing invalidate by consulatant and detele @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
   @UseGuards(AuthGuard('jwt'), joblistingGuard)
   @Put('close-job/:jobListingId')
   async closingJobListing(
     @Param('jobListingId', ParseIntPipe) jobListingToCloseId: number,
     @GetUserId() consultantId: number,
     @Body() closeJobListingDto: CloseJobListingDto,
   ) {
     return this.joblistingService.closingJobListing(
      jobListingToCloseId,
       consultantId,
       closeJobListingDto
       
     );
   }
 





  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   DELETE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Delete  My Job Listing Delete Job Listing by Consultant @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), joblistingGuard)
  @Delete('delete-joblisting/:jobListingId')
  async deleteMyJobListingOrDeleteByConsultant(
    @Param('jobListingId', ParseIntPipe) jobListingIdToDelete: number,
    @GetUserId() consultantId: number,
  ) {
    return this.joblistingService.deleteMyJobListingOrDeleteByConsultant(
      jobListingIdToDelete,
      consultantId,
    );
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings with deadline expired by two week @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Delete('delete-jobs-deadline-expired-90-days')
  async DeleteAllJobListingsWithDeadlineExpiredByTwoWeek() {
    return this.joblistingService.DeleteAllJobListingsWithDeadlineExpiredIn90Days();
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job Listings To Update with deadline expired by two Days @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Delete('delete-jobs-deadline-expired-two-days')
  async DeleteAllJobListingsWithDeadlineExpiredByTwoDays() {
    return this.joblistingService.DeleteAllJobListingsWithDeadlineExpiredInTwoDays();
  }
}
