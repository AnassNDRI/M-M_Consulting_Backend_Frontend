import {  IsBoolean } from 'class-validator';

export class UpdateJobApplicationDto {

  @IsBoolean()
  status?: boolean;

}