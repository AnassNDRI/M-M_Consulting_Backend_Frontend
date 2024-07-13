import {
  IsNotEmpty,
  IsEmail,
  IsString,
  IsOptional,
  Length,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import IsLowercase from 'src/modules/utils/customValidator';

export class SignupRecruiterDto {
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
  @Length(2, 70)
  readonly nameCompany?: string;

  @IsOptional()
  @IsString()
  @Length(10, 1500)
  readonly descriptionCompany?: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  readonly tvaNumber?: string;

  @IsOptional()
  @IsString()
  @Length(2, 255)
  readonly addressCompany?: string;
}
