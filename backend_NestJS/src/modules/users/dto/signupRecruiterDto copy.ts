import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import IsLowercase from 'src/modules/utils/customValidator';

export class SignupRecruiterDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
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
  @Length(10, 250)
  readonly password: string;

  @IsNotEmpty()
  @IsString()
  readonly nameCompany?: string;

  @IsNotEmpty()
  @IsString()
  readonly tvaNumber?: string;

  @IsNotEmpty()
  @IsString()
  readonly addressCompany?: string;
}
