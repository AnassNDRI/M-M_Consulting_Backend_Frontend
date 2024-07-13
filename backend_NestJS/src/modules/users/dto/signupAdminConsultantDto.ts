import {
  IsNotEmpty,
  IsEmail,
  IsString,
  IsOptional,
  Length,
  IsNumber,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import IsLowercase from 'src/modules/utils/customValidator';

export class SignupAdminConsultantDto {
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
  @Length(1, 50)
  @IsLowercase({
    message: "L'email ne doit pas contenir de lettres majuscules.",
  })
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 250)
  readonly password: string;

  @IsOptional()
  @IsString()
  readonly address?: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number) // pour s'assurer que roleId est un nombre
  readonly roleId: number;
}
