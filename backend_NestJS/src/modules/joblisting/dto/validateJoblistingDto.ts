import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class ValidateJobListingDto {
  @IsOptional()
  @IsBoolean()
  validate: boolean;

  @IsOptional()
  @IsString()
  @Length(20, 1000)
  noteJoblisting: string;

  @IsOptional()
  @IsDateString()
  deadlineToDeleteNotConfirm?: Date;
}
