import { JobApplications } from './jobApplications.model';
import { TimeSlot } from './timeSlot.model';
import { Users } from './user.model';

export interface Appointment {
  appointmentId: number;
  note: string;
  consultantId: number;
  jobApplicationId: number;
  timeSlotId: number;
  appointmentDate: Date;
  appHoursStart?: Date;
  appHoursEnd?: Date;
  appointmentMade?: boolean;
  createdAt: Date;
  updatedAt: Date;
  jobApplication: JobApplications;
  timeSlots: TimeSlot;
  consultant: Users;
}
