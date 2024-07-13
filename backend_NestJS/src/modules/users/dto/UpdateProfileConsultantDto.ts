import { IsString, IsOptional, Length, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProfileConsultantDto {
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

  @IsString()
  @IsOptional()
  @IsString()
  address?: string;
}
