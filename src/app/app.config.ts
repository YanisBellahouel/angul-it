import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

/**
 * ⚙️ Configuration principale de l'application Angular
 *
 * Cette configuration est utilisée lors du bootstrap de l'app (main.ts)
 * Elle configure tous les providers (services, routing, etc.)
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // 🔄 Optimisation de la détection de changements
    provideZoneChangeDetection({ eventCoalescing: true }),

    // 🛣️ Configuration du routing
    provideRouter(routes)
  ]
};