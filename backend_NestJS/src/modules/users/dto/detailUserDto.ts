import { IsEmail, IsString, IsOptional, IsBoolean, Length, IsNumber } from 'class-validator';
import IsLowercase from 'src/modules/utils/customValidator';


export class DetailUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  readonly name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  readonly firstname?: string;

  @IsOptional()
  @IsString()
  readonly sex?: string;

  @IsOptional()
  @IsString()
  readonly phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  @Length(1, 50)
  @IsLowercase({ message: 'L\'email ne doit pas contenir de lettres majuscules.' })
  readonly email?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  readonly cv?: string;

  @IsOptional()
  @IsString()
  readonly address?: string;

  @IsOptional()
  @IsString()
  readonly nameCompany?: string;

  @IsOptional()
  @IsString()
  readonly addressCompany?: string;

  @IsOptional()
  @IsBoolean()
  readonly actif?: boolean;

  @IsOptional()
  @IsBoolean()
  notification?: boolean;

  @IsOptional()
  @IsNumber()
  readonly roleId?: number;
}
