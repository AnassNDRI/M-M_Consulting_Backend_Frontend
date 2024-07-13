import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, Length } from 'class-validator';

export class UpdateProfileEmplyee {
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
  dateBirth?: Date;

  @IsOptional()
  @IsString()
  @Length(1, 1)
  sex?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
/*
  @IsOptional()
  @IsNumber()
  @Type(() => Number) // pour s'assurer que roleId est un nombre
  roleId?: number; */

  @IsOptional()
  @IsString()
  address?: string;
}
