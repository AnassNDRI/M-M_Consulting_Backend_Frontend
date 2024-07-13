import { Module } from '@nestjs/common';
import { JobapplicationController } from './jobapplication.controller';
import { JobapplicationService } from './jobapplication.service';
import { UsersModule } from '../users/users.module';
import { JoblistingModule } from '../joblisting/joblisting.module';
//import { SavejobService } from '../savejob/savejob.service';

@Module({
  imports: [UsersModule, JoblistingModule],
  controllers: [JobapplicationController],
  providers: [JobapplicationService],
  exports: [JobapplicationService]
})
export class JobapplicationModule {}
