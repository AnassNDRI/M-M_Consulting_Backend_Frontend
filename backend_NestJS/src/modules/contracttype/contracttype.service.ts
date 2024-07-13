import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContracttypeService {

  constructor(private readonly prismaService: PrismaService) {}

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Contract Types @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllContractTypes() {
    // Récupération de tous les types de contrats
    const contractTypes = await this.prismaService.contractTypes.findMany({});
    
    // Ici on vérifie si la liste des types de contrats est vide
    if (contractTypes.length === 0) {
      return { message: 'Aucun type de contrat dans la Base de données' };
    }

    // On retourne la liste complète des types de contrats
    return {
      result: true,
      data: {
        count: contractTypes.length, // Le nombre total de types
        contractTypes: contractTypes, // La liste des types de contrats correspondants
      },
      error_code: null,
      error: null,
    };
  }
}
