import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExperienceService {


  constructor(private readonly prismaService: PrismaService) {}

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Experiences Titles @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllExperiences() {
    // Récupération de toutes les libellés
    const experiences = await this.prismaService.experiences.findMany({});
    // Ici on vérifie si la liste des experiences est vide
    if (experiences.length === 0) {
      return { message: `Aucun intitullé d'experience dans la Base de donnèes.` };
    }

    // On retourne la liste complète 
    return {
      result: true,
      data: {
        count: experiences.length, // Le nombre total fonctions
        experiences: experiences, // La liste des fonctions correspondants
      },
      error_code: null,
      error: null,
    };
  }


  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Experiences Titles @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async verifyExperienceExistence(experienceId: number) {
    
    const experience  = await this.prismaService.experiences.findUnique({
      where: { experienceId },
    });
    if (!experience) {
      throw new NotFoundException(
        'The specified experience could not be found.',
      );
    }
  }




}
