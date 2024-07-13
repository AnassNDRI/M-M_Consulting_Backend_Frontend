import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { HttpInterceptorService } from './shared/service';

@NgModule({
  providers: [
    {
      // Enregistre le service intercepteur pour traiter les requêtes HTTP.
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      // Autorise plusieurs intercepteurs.
      multi: true,
    },
  ],
})
// Module pour configurer l'intercepteur HTTP.
export class HttpInterceptorModule {}
