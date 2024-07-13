import { Module } from '@nestjs/common';
import { CleanDataBaseController } from './clean-data-base.controller';
import { CleanDataBaseService } from './clean-data-base.service';

@Module({
  controllers: [CleanDataBaseController],
  providers: [CleanDataBaseService]
})
export class CleanDataBaseModule {}
