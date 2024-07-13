import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ErrorMessages } from 'src/shared/error-management/errors-message';

@Injectable()
export class joblistingGuard implements CanActivate {
    constructor(private prismaService: PrismaService, private reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Vérifiez si l'utilisateur est connecté et a un roleId
        if (!user || !user.roleId) {
            throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_USER_OR_ROLE);
        }

        // Récupération du rôle de l'utilisateur
        const role = await this.prismaService.roles.findUnique({
            where: { roleId: user.roleId },
        });

        // Vérifiez si le rôle de l'utilisateur est 'Recruiter'
        if (role && (role.title === 'Recruiter'|| role.title === 'Consultant' || role.title === 'Administrator')) {
            return true;
        } else {
            throw new UnauthorizedException(ErrorMessages.ADMIN_OR_CONSULTANT_OR_RECRUITER_REQUIRED);
        }
    }
}
