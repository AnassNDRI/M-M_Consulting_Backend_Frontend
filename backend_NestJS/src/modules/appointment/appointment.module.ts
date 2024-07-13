import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { UsersModule } from '../users/users.module';
import { JobapplicationModule } from '../jobapplication/jobapplication.module';

@Module({
  imports: [UsersModule, JobapplicationModule],
  controllers: [AppointmentController],
  providers: [AppointmentService]
})
export class AppointmentModule {}
