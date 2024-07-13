import { Module } from '@nestjs/common';
import { HistoriqueService } from './historique.service';
import { HistoriqueController } from './historique.controller';

@Module({
  providers: [HistoriqueService],
  controllers: [HistoriqueController]
})
export class HistoriqueModule {}
