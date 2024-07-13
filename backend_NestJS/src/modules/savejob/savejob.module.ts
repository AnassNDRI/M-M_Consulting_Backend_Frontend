import { Module } from '@nestjs/common';
import { SavejobController } from './savejob.controller';
import { SavejobService } from './savejob.service';
import { UsersModule } from '../users/users.module';
import { JoblistingModule } from '../joblisting/joblisting.module';
import { JobapplicationModule } from '../jobapplication/jobapplication.module';


@Module({
  imports: [UsersModule, JoblistingModule, JobapplicationModule ], // Importez UsersModule ici
  controllers: [SavejobController], 
  providers: [SavejobService],
  exports: [SavejobService]
})
export class SavejobModule {}
 