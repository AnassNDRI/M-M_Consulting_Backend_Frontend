import { Controller, Get } from '@nestjs/common';
import { JobtitleService } from './jobtitle.service';

@Controller('api/jobtitle')
export class JobtitleController {

  
  constructor(
    private readonly jobTitleService: JobtitleService,
) { }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Job Titles @@@@@@@@@@@@@@@@
  @Get('jobtitles')
  async getAllJobTitles() {
    return this.jobTitleService.getAllJobTitles();
  }
}
