import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimeSlotService {

  constructor(private readonly prismaService: PrismaService) {}
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Job Titles @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllTimeSlots() {
    // Récupération de toutes les fonctions
    const timeSlots = await this.prismaService.timeSlot.findMany({});
    // Ici on vérifie si la liste  est vide
    if (timeSlots.length === 0) {
      return { message: 'Aucune créneau horaire dans la Base de donnèes' };
    }

    // On retourne la liste complète

    return {
      result: true,
      data: timeSlots, 
      count: timeSlots.length, 
      error_code: null,
      error: null,
    };
  }
}
