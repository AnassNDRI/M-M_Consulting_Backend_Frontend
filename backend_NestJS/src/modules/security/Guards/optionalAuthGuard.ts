import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // On enveloppe super.canActivate(context) dans Promise.resolve() pour gérer les cas synchrones et asynchrones
    return Promise.resolve(super.canActivate(context))
      .then(() => true) // Toujours retourner true pour autoriser l'accès
      .catch(() => true); // Même en cas d'erreur, autoriser l'accès
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext): any {
    return user || null; // Retourne l'utilisateur si présent, sinon null
  }
}
