import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { HistoriqueService } from './historique.service';
import { AuthGuard } from '@nestjs/passport';
import { ExternalGuard } from '../security/Guards/externalGuard';

@Controller('api/historique')
export class HistoriqueController {

  constructor(private readonly historiqueService: HistoriqueService) {}

 
  
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Job listing verifed, Acces by All USERS  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ExternalGuard)
  @Get('historiques') // Accès par tous les utilisateurs
  async getAllHistoriques() {
    return this.historiqueService.getAllHistoriques();
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Chercher un historique par un mot clé @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ExternalGuard)
  @Get('search-historiques-by-keyword')
  async searchAllHistoriquesByKeyword(@Query('keyword') keyword: string) {
    return this.historiqueService.searchAllHistoriquesByKeyword(keyword);
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Chercher des historiques par plage de dates @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ExternalGuard)
  @Get('search-historiques-by-date-range')
  async searchHistoriquesByDateRange( @Query('startDate') startDate: string, @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.historiqueService.searchHistoriquesByDateRange(start, end);
  }
}
