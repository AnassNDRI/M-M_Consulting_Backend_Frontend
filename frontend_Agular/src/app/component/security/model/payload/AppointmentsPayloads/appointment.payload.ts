import { PayloadInterface } from '../../../../../shared/model';

export interface AppointmentPayload extends PayloadInterface {
  jobApplicationId?: number;
  appointmentDate?: Date;
  timeSlotId?: number;
}
