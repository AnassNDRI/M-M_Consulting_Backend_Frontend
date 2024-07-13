import { Module } from '@nestjs/common';
import { ContracttypeService } from './contracttype.service';
import { ContracttypeController } from './contracttype.controller';

@Module({
  providers: [ContracttypeService],
  controllers: [ContracttypeController]
})
export class ContracttypeModule {}
