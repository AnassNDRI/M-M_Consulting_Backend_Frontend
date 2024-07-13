import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ErrorMessages } from 'src/shared/error-management/errors-message';



@Injectable()
export class CandidatGuard implements CanActivate {
  constructor(private prismaService: PrismaService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roleId) {
      throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_USER_OR_ROLE);
    }
    // Récupération du rôle de l'utilisateur à l'aide de Prisma
    const role = await this.prismaService.roles.findUnique({
      where: { roleId: user.roleId },
    });

    // On vérifie si le rôle est 'Candidat'
    if (role && role.title === 'Candidate') {
      return true;
    } else {
      throw new UnauthorizedException(ErrorMessages.ACCESS_DENIED_CANDIDATE);
    }
  }
}

