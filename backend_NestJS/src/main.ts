import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/error-management/error-management';

async function bootstrap() {
  // Appel de la fonction seed avant de démarrer l'application
  // await seed();
  dotenv.config(); // Charge les variables d'environnement

  // Vérifie si le dossier existe, sinon créez-le
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}


  const app = await NestFactory.create(AppModule);

  

  // Activation de CORS pour toutes les origines ou configuration pour des origines spécifiques
  app.enableCors({
    origin: 'http://localhost:4200', //  l'URL de l'application Angular (frontend)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Méthodes HTTP autorisées
    allowedHeaders: 'Content-Type, Accept, Authorization', // En-têtes autorisées
  });

  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
  
  // active la validation definie dans dto
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Ne garde que les propriétés déclarées dans les DTOs
      forbidNonWhitelisted: true, // Refuse les requêtes contenant des propriétés non déclarées dans les DTOs
      transform: true, // Transforme l'entrée en instance de DTO
      disableErrorMessages: false, // Affiche les messages d'erreur détaillés
    }),
  );

  // Configure un filtre global pour gérer toutes les erreurs HTTP via `HttpExceptionFilter`.
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3000);
}
bootstrap();
