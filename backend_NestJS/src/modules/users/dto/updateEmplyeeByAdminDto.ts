import {
  IsString,
  IsOptional,
  IsBoolean,
  Length,
  IsDate,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateEmplyeeByAdminDto {
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
  sex: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  roleId?: number;
}
