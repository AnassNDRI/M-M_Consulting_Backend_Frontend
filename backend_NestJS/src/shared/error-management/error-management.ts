// Importe les éléments nécessaires depuis NestJS et Express.
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

// Ce décorateur indique que ce filtre d'exception va attraper toutes les exceptions de type HttpException.
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  // La méthode `catch` est appelée chaque fois qu'une exception de type HttpException est levée dans l'application.
  catch(exception: HttpException, host: ArgumentsHost) {
    // Obtient le contexte HTTP pour accéder à l'objet de réponse.
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Récupère le statut HTTP de l'exception pour le réutiliser dans la réponse au client.
    const status = exception.getStatus();

    // Obtient la réponse de l'exception, qui peut être une chaîne ou un objet contenant plus de détails.
    const exceptionResponse = exception.getResponse();

    // Prépare l'objet de réponse d'erreur avec une structure standardisée.
    const errorResponse = {
      result: false, // Indique que la requête a échoué.
      data: null, // Aucune donnée à retourner en cas d'erreur.
      error_code: status, // Le code d'erreur HTTP.
      error: { message: '' }, // L'objet pour le message d'erreur.
      message: '', // Un message d'erreur supplémentaire.
    };

    // Vérifie si la réponse de l'exception est une chaîne de caractères.
    if (typeof exceptionResponse === 'string') {
      // Si c'est le cas, utilise cette chaîne pour le message d'erreur.
      errorResponse.error.message = exceptionResponse;
      errorResponse.message = exceptionResponse;
    } else {
      // Si la réponse est un objet, extrait le message d'erreur de cet objet.
      errorResponse.error.message = exceptionResponse['message'];
      errorResponse.message = exceptionResponse['error'] || 'An unexpected error occurred';
    }

    // Envoie l'objet de réponse d'erreur au client avec le statut HTTP approprié.
    response.status(status).json(errorResponse);
  }
}
