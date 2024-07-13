import { Appointment } from './appointment.model';

export interface TimeSlot {
  timeSlotId: number;
  title: string;
  appHoursStart: string;
  appHoursEnd: string;
  appointments: Appointment[];
}
