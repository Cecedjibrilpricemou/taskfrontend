import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideCharts(withDefaultRegisterables()),
    // Résout /auth/me AVANT que le router n'exécute le moindre guard --
    // sinon un guard pourrait trancher "non connecté" par erreur avant que
    // la réponse (qui dépend du cookie de session) ne soit arrivée.
    provideAppInitializer(() => firstValueFrom(inject(AuthService).chargerUtilisateurCourant())),
  ]
};
