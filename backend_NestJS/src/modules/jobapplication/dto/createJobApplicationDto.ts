import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateJobApplicationDto {
 
  @IsInt()
  @IsNotEmpty()
  jobListingId: number;

}
