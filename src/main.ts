import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app/app';
import { routes } from './app/app.routes';

console.log('🔧 main.ts - Iniciando bootstrapApplication...');

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
  ],
})
  .then(() => {
    console.log('✅ main.ts - bootstrapApplication completado exitosamente');
  })
  .catch((err) => {
    console.error('❌ main.ts - Error en bootstrapApplication:', err);
  });
