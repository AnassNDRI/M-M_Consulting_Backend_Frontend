import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobtitleService {

  constructor(private readonly prismaService: PrismaService) {}
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Job Titles @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllJobTitles() {
    // Récupération de toutes les fonctions
    const jobTitles = await this.prismaService.jobTitle.findMany({});
    // Ici on vérifie si la liste des emplois est vide
    if (jobTitles.length === 0) {
      return { message: 'Aucune Function dans la Base de donnèes' };
    }

    // On retourne la liste complète des fonctions
    return {
      result: true,
      data: {
        count: jobTitles.length, // Le nombre total fonctions
        jobTitles: jobTitles, // La liste des fonctions correspondants
      },
      error_code: null,
      error: null,
    };
  }
}

