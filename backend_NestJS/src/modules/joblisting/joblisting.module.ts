import { Module } from '@nestjs/common';
import { JoblistingController } from './joblisting.controller';
import { JoblistingService } from './joblisting.service';
import { UsersModule } from '../users/users.module';
import { MailerService } from '../mailer/mailer.service';
import { PrismaService } from '../prisma/prisma.service';
//import { SavejobModule } from '../savejob/savejob.module';

@Module({
  imports: [UsersModule],
  controllers: [JoblistingController],
  providers: [PrismaService, MailerService, JoblistingService],
  exports: [JoblistingService]
})
export class JoblistingModule {}
