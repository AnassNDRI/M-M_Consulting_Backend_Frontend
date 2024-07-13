import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import IsLowercase from 'src/modules/utils/customValidator';

export class SignupCandidateDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 70)
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 70)
  readonly firstname: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  readonly dateBirth: Date;

  @IsOptional()
  @IsString()
  @Length(1, 1)
  readonly sex: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly jobTitleId: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly experienceId: number;

  @IsOptional()
  @IsString()
  readonly phoneNumber: string;

  @IsNotEmpty()
  @IsEmail()
  @Length(1, 70)
  @IsLowercase({
    message: "L'email ne doit pas contenir de lettres majuscules.",
  })
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 250)
  readonly password: string;

  @IsOptional()
  @IsString()
  readonly address?: string;

  @IsOptional()
  @IsString()
  cv?: string;
}
