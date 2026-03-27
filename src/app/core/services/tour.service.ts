import { Injectable } from '@angular/core';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export interface TourStep {
  element: string;
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class TourService {
  private driverInstance: any;

  readonly tourSteps: TourStep[] = [
    {
      element: '.professional-nav',
      title: '🏠 Barra de Navegación',
      description:
        'Esta es la barra de navegación principal. Desde aquí puedes acceder a todas las funciones del sistema.',
    },
    {
      element: '.nav-brand',
      title: '🏢 Logo y Branding',
      description:
        'Logo del Sistema de Gestión de Refacciones. Este es tu punto de referencia en toda la aplicación.',
    },
    {
      element: '.nav-menu',
      title: '📋 Menú Principal',
      description:
        'Aquí encontrarás los botones para navegar a las diferentes secciones: Inicio, Búsqueda Global, Importar Excel y más.',
    },
    {
      element: 'main',
      title: '📊 Área de Contenido',
      description:
        'Este es el área principal donde se muestra toda la información y funcionalidades del sistema.',
    },
    {
      element: '.time-indicator',
      title: '⏰ Indicador de Hora',
      description:
        'Muestra la fecha y hora actual del sistema. Útil para saber en qué momento estás operando.',
    },
  ];

  constructor() {
    this.driverInstance = driver({
      showProgress: true,
      allowClose: true,
      steps: this.formatSteps(),
    });
  }

  private formatSteps() {
    return this.tourSteps.map((step, index) => ({
      element: step.element,
      title: step.title,
      description: step.description,
      side: index % 2 === 0 ? 'left' : 'right',
    }));
  }

  startTour(): void {
    console.log('🎬 Iniciando tour...');
    this.driverInstance.drive();
  }

  resetTour(): void {
    this.driverInstance.reset();
  }

  getSteps(): TourStep[] {
    return this.tourSteps;
  }
}
