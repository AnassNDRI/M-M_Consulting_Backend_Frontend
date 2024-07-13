import {  IsBoolean } from 'class-validator';

export class UpdateJobApplicationInterviewsDto {

  @IsBoolean()
  jobInterviewOK: boolean;


}