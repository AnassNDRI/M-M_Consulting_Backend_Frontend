import { IsString, IsOptional, Length, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileRecruiterDto {
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
  @IsString()
  nameCompany?: string;

  @IsOptional()
  @IsString()
  @Length(10, 1500)
  descriptionCompany?: string;

  @IsOptional()
  @IsString()
  tvaNumber?: string;

  @IsOptional()
  @IsString()
  addressCompany?: string;
}
