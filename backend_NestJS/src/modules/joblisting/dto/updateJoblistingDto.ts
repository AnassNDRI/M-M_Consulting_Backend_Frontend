import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class UpdateJobListingDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  jobTitleId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  jobLocationId?: number;

  
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  experienceId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  contractTypeId?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  readonly responsibilities?: string;

  @IsOptional()
  @IsString()
  readonly requiredQualifications?: string;

  @IsOptional()
  @IsString()
  readonly benefits?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  workingHours?: number; // "40"h/semaines

  @IsOptional()
  @IsNumber()
  @IsPositive()
  numberOfCandidates?: number; // nombre de Canditats

  @IsOptional()
  @IsString()
  workingHoursStart?: string; // Chaîne de caractères "09:00"

  @IsOptional()
  @IsString()
  workingHoursEnd?: string; // Chaîne de caractères "17:00"

  @IsOptional()
  @IsDateString()
  startDate?: Date; // ISO Date string "2024-09-01"

  @IsOptional()
  @IsNumber()
  @IsPositive()
  salary?: number;

  @IsOptional()
  @IsDateString()
  deadline?: Date; // ISO Date string "2024-07-01"
}
