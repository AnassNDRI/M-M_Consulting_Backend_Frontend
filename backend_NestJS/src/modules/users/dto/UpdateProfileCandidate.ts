
import { IsString, IsOptional, Length, IsDate, IsNumber} from 'class-validator';
import { Type } from 'class-transformer';


export class UpdateProfileCandidateDto {

  @IsOptional()
  @IsString()
  @Length(2, 50)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  firstname?: string;
  
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateBirth?: Date;

  @IsOptional()
  @IsString()
  @Length(1, 1)
  sex: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;


  @IsOptional()
  @IsNumber()
  @Type(() => Number)
 jobTitleId?: number;

 @IsOptional()
 @IsNumber()
 @Type(() => Number)
  experienceId?: number;

  
  @IsOptional()
  @IsString()
  @Length(10, 1500)
  interviewNote?: string;


  @IsString()
  @IsOptional()
  @IsString()
  address?: string;

}
