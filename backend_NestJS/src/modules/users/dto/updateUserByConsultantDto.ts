import {  IsString, IsOptional, IsBoolean, Length, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';


export class UpdateUserByConsultantDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  firstname?: string;

   @IsDate()
  @Type(() => Date)
  @IsOptional()
  readonly dateBirth?: Date;

  @IsOptional()
  @IsString()
  sex?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;


  @IsOptional()
  @IsNumber()
  @Type(() => Number)
 jobTitleId?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  nameCompany?: string;

  @IsOptional()
  @IsString()
  addressCompany?: string;

  @IsOptional()
  @IsString()
  tvaNumber?: string;

  @IsOptional()
 @IsNumber()
 @Type(() => Number)
  experienceId?: number;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;

  @IsOptional()
  @IsBoolean()
  notification?: boolean;

}
