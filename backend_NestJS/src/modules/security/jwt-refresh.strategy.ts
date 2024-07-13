import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from '@nestjs/config';
import { PrismaService } from "../prisma/prisma.service";
import { Request } from 'express';
import { ErrorMessages } from "src/shared/error-management/errors-message";


type Payload = {
    sub: number;
    email: string;
    roleId?: number;
    userId?: number;
    jobListingId?: number;
    tokenVersion: number;

};

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(private configService: ConfigService, private readonly prismaService: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('REFRESH_SECRET_KEY'),
            ignoreExpiration: false,
            passReqToCallback: true,  
        });
    }

    async validate(request: Request, payload: Payload) {
        const token = request.headers.authorization?.split(' ')[1];

        const user = await this.prismaService.users.findUnique({
            where: { email: payload.email },
            include: { role: true },
        });

        if (!user) {
            throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED);
        }

        // On vérifie si le refreshToken de l'utilisateur correspond au token de la requête
        if (user.refreshToken !== token) {
            throw new UnauthorizedException(ErrorMessages.INVALID_TOKEN);
        }

        // Ajout de la vérification de tokenVersion
        if (payload.tokenVersion !== user.tokenVersion) {
            throw new UnauthorizedException(ErrorMessages.TOKEN_VERSION_MISMATCH);
           
        }

        // Suppression du mot de passe du retour
        Reflect.deleteProperty(user, 'password');

        // Ajout du roleId au payload retourné
        return { ...user, roleId: user.roleId };
    }
}

