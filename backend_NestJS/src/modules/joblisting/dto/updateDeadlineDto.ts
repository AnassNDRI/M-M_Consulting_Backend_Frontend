
import { IsNotEmpty, IsDateString } from 'class-validator';


export class UpdateDeadlineDto {
  @IsNotEmpty()
  @IsDateString()
  deadline?: Date;  // ISO Date string "2024-07-01"


}