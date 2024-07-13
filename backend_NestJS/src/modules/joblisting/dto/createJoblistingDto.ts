import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export class CreateJobListingDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly jobTitleId: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly experienceId: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly jobLocationId: number;
z
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly contractTypeId: number;

  @IsNotEmpty()
  @IsString()
  @Length(20, 2000)
  readonly description: string;

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
  readonly workingHours?: number; // "40"h/semaines numberOfCandidates,


  @IsOptional()
  @IsNumber()
  @IsPositive()
  readonly numberOfCandidates?: number; // "40"h/semaines ,

  @IsOptional()
  @IsString()
  @Length(5, 5)
  readonly workingHoursStart: string; // "09:00"

  @IsOptional()
  @IsString()
  @Length(5, 5)
  readonly workingHoursEnd: string; // "17:00"

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  readonly startDate?: Date;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  readonly salary?: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  readonly deadline: Date;
}
