import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class ValidateUsersDto {
  @IsNotEmpty()
  @IsBoolean()
  actif: boolean;

  @IsOptional()
  @IsString()
  @Length(20, 500)
  noteInscription: string;
}
