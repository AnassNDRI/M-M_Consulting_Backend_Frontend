import { CallHandler, ExecutionContext, NestInterceptor, Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;

    Logger.log(`Incoming request ${method} ${url}`, 'LoggingInterceptor');

    return next
      .handle()
      .pipe(tap(() => Logger.log(`Outgoing response ${method} ${url}`, 'LoggingInterceptor')));
  }
}