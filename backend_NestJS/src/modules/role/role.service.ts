import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private readonly prismaService: PrismaService) {}
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Job Titles @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getEmployeeRoles() {
    // Récupération de tous les roles
    const roles = await this.prismaService.roles.findMany();
    // Ici on vérifie si la liste des roles
    if (roles.length === 0) {
      return { message: 'Aucun rôle spécifié trouvé dans la base de données.' };
    }

    // On retourne la liste complète desroles
    return {
      result: true,
      data: {
        count: roles.length, // Le nombre total roles
        roles: roles, // La liste des roles correspondants
      },
      error_code: null,
      error: null,
    };
  }
}
