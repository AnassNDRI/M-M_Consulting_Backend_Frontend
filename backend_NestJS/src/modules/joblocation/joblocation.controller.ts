import { Controller, Get } from '@nestjs/common';
import { JoblocationService } from './joblocation.service';

@Controller('api/joblocation')
export class JoblocationController {

  constructor(
    private readonly joblocationService: JoblocationService,
  ) {}

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Job Locations @@@@@@@@@@@@@@@@
  @Get('jobLocations')
  async getAllJobLocations() {
    return this.joblocationService.getAllJobLocations();
  }
}
