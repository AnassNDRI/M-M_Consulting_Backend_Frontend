import { IsNotEmpty, IsEmail, IsString } from 'class-validator';


export class ResetPasswordConfirmationDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()     // le code généré et envoyé à l'utilisateur
    @IsNotEmpty()
    code: string;

}
