import { Controller, Get } from '@nestjs/common';
import { ExperienceService } from './experience.service';

@Controller('api/experience')
export class ExperienceController {


  constructor(private readonly experienceService: ExperienceService) {}

   // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Job Experiences @@@@@@@@@@@@@@@@
   @Get('experiences')
   async getAllExperiences() {
     return this.experienceService.getAllExperiences();
   }

}






