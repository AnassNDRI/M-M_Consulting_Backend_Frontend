import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouterStore } from '@ngrx/router-store';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  // Exporte appConfig pour initialiser/configurer l'application Angular.
  providers: [
    // Liste des providers pour différentes fonctionnalités/services.
    provideRouter(routes), // Configure le système de routage avec les routes définies.
    provideAnimationsAsync(), // Active les animations asynchrones.
    provideStore(), // Configure le store NgRx pour la gestion d'état.
    provideRouterStore(), // Intègre l'état du routeur avec le store NgRx.
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideHttpClient(), // Active les devtools pour NgRx Store avec des paramètres spécifiques.
  ],
};
