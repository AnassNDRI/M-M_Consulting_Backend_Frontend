import { IsNotEmpty, IsEmail } from 'class-validator';

export class ResetPasswordDemandDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
