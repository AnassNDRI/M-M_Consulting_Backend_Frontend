import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteProfileDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}
