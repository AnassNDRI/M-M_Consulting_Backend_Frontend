import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';


// Factory function pour créer une instance de TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [
    HttpClientModule, // Module pour effectuer des requêtes HTTP
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient], // Dépendance nécessaire pour TranslateHttpLoader
      },
    }),
  ],
  exports: [TranslateModule], // On exporte TranslateModule pour l'utiliser dans d'autres modules
})
export class GlobalTranslateModule {}
