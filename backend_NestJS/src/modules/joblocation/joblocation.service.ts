import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JoblocationService {
  constructor(private readonly prismaService: PrismaService) {}

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Job Locations @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllJobLocations() {
    // Récupération de tous les lieux de travail
    const jobLocations = await this.prismaService.jobLocation.findMany({});

    // Ici on vérifie si la liste des lieux est vide
    if (jobLocations.length === 0) {
      return { message: 'Aucun lieu de travail dans la Base de données' };
    }

    // On retourne la liste complète des lieux
    return {
      result: true,
      data: {
        count: jobLocations.length, // Le nombre total de lieux
        jobLocations: jobLocations, // La liste des lieux correspondants
      },
      error_code: null,
      error: null,
    };
  }
}
