import { Appointment } from './appointment.model';
import { JobListings } from './jobListings.model';
import { Users } from './user.model';

export interface JobApplications {
  jobApplicationId: number;
  jobListingId: number;
  appointmentId?: number;
  applicationHours: Date;
  status?: boolean;
  jobInterviewOK?: boolean;
  interviewNote?: string;
  userId: number;
  checkJobAppliByConsultant?: string;
  deadlineToDelete?: Date;
  createdAt: Date;
  updatedAt: Date;
  applicationCount?: number; 
  appointment?: Appointment;
  jobListing: JobListings;
  user: Users;
}

