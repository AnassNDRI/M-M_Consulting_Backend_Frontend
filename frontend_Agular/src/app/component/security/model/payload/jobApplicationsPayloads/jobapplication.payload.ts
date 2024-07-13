import { PayloadInterface } from '../../../../../shared/model';

export interface JobApplicationPayload extends PayloadInterface {
  jobListingId?: number;
  status?: boolean;
  jobInterviewOK?: boolean;
  interviewNote?: string;
}
