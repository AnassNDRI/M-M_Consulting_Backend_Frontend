import { Module } from '@nestjs/common';
import { TimeSlotService } from './time-slot.service';
import { TimeSlotController } from './time-slot.controller';

@Module({
  providers: [TimeSlotService],
  controllers: [TimeSlotController]
})
export class TimeSlotModule {}
