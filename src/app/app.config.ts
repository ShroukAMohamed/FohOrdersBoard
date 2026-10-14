import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { kitchenOrdersPreset } from './core/theme/kitchen-orders.preset';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    providePrimeNG({
      license: 'eyJpZCI6IjEyNWE2NWM2LWI0ZjItNGIyNy04ZWQ2LTVmZGE1ZWM0NTA2YyIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3OTE5OTE3MDAsImV4cCI6MTgyMzUyNzcwMH0.fO9VTYwVw2R2Sj-7mQsJ5T2fjWOh1jeVVUIE9og9VdLKlStIhn5VnS1fXldSvV_mqoBjt4C8PtpamFd6xnuaAg',
      theme: {
        preset: kitchenOrdersPreset,
        options: {
          darkModeSelector: 'none',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng, utilities',
          },
        },
      },
    }),
  ],
};
