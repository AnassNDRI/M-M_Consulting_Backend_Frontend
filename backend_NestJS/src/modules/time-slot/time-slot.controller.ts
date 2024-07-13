import { Controller, Get } from '@nestjs/common';
import { TimeSlotService } from './time-slot.service';

@Controller('api/time-slot')
export class TimeSlotController {

  constructor(
    private readonly timeService: TimeSlotService,
) { }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All time slots @@@@@@@@@@@@@@@@
  @Get('timeSlots')
  async getAllTimeSlots() {
    return this.timeService.getAllTimeSlots();
  }
}
