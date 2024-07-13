import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { JobapplicationModule } from './modules/jobapplication/jobapplication.module';
import { JoblistingModule } from './modules/joblisting/joblisting.module';
import { SavejobModule } from './modules/savejob/savejob.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { RoleModule } from './modules/role/role.module';
import { JobtitleModule } from './modules/jobtitle/jobtitle.module';
import { JoblocationModule } from './modules/joblocation/joblocation.module';
import { ContracttypeModule } from './modules/contracttype/contracttype.module';
import { SendGridModule } from '@anchan828/nest-sendgrid';
import { CleanDataBaseModule } from './modules/clean-data-base/clean-data-base.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ExperienceModule } from './modules/experience/experience.module';
import { TimeSlotModule } from './modules/time-slot/time-slot.module';
import { HistoriqueModule } from './modules/historique/historique.module';

@Module({
  imports: [
    SendGridModule.forRoot({ apikey: process.env.SENDGRID_API_KEY }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    AppointmentModule,
    JobapplicationModule,
    JoblistingModule,
    SavejobModule,
    MailerModule,
    RoleModule,
    JobtitleModule,
    JoblocationModule,
    ContracttypeModule,
    CleanDataBaseModule,
    ExperienceModule,
    TimeSlotModule,
    HistoriqueModule,
  ],
})
export class AppModule {}
