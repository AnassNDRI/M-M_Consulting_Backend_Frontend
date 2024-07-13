import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { enableProdMode, importProvidersFrom, isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore } from '@ngrx/router-store';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import {
  CalendarDateFormatter,
  CalendarModule,
  DateAdapter,
} from 'angular-calendar';

import { FlatpickrModule } from 'angularx-flatpickr';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { HttpInterceptorModule } from './app/http.Interceptor.module';
import { environment } from './environment/environment';
import { CustomDateFormatter } from './app/shared/calendar/custom-date-formatter';


import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';



if (environment.production) {
  enableProdMode();
}

// Enregistrement de la locale française globalement
registerLocaleData(localeFr, 'fr');


bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      RouterModule.forRoot(routes),
      FlatpickrModule.forRoot(),
      CalendarModule.forRoot({
        provide: DateAdapter,
        useFactory: adapterFactory
      }),
      BrowserAnimationsModule,
      HttpClientModule,
      HttpInterceptorModule
    ),
    { provide: CalendarDateFormatter, useClass: CustomDateFormatter }, // Ajout comme provider standard
    provideStore(),
    provideEffects(),
    provideRouterStore(),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
  ],
});
