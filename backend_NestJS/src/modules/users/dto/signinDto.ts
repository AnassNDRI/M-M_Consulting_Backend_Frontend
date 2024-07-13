import { IsNotEmpty, IsEmail, IsString } from 'class-validator';


export class SigninDto {
    @IsNotEmpty()
    @IsEmail()
    readonly email: string;
    
    @IsNotEmpty()
    @IsString()
    readonly password: string;
  
  }
  