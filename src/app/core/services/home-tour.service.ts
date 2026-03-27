import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

type Language = 'es' | 'en';

interface TourContent {
  step1: { title: string; description: string };
  step2: { title: string; description: string };
  step3: { title: string; description: string };
}

@Injectable({
  providedIn: 'root'
})
export class HomeTourService {
  private driverInstance: any;
  private currentAudio: HTMLAudioElement | null = null;
  private readonly BACKEND_URL = 'http://localhost:3001';
  private selectedLanguage: Language = 'es';

  private translations: Record<Language, TourContent> = {
    es: {
      step1: {
        title: '🎯 Bienvenido',
        description: 'Bienvenido al Sistema de Gestión de Refacciones. El software fue creado para optimizar y automatizar la búsqueda y gestión de refacciones, herramientas y piezas de reposición en nuestro Tool Room. El objetivo es reducir tiempos de búsqueda, mantener un inventario organizado y mejorar la eficiencia operativa.'
      },
      step2: {
        title: '📍 Áreas de Trabajo',
        description: 'Para iniciar, seleccione el área donde quiere buscar su refacción. Tenemos 6 áreas disponibles: Corte, Costura, Consumibles, Herramientas, Químicos y Tornillos.'
      },
      step3: {
        title: '🔍 Búsqueda Global',
        description: 'También puede usar la Búsqueda Global para buscar mediante nombre, número de parte o número de SAP entre todo el catálogo del Tool Room.'
      }
    },
    en: {
      step1: {
        title: '🎯 Welcome',
        description: 'Welcome to the Parts Management System. This software was created to optimize and automate the search and management of spare parts, tools and replacement parts in our Tool Room. The objective is to reduce search times, maintain an organized inventory and improve operational efficiency.'
      },
      step2: {
        title: '📍 Work Areas',
        description: 'To start, select the area where you want to search for your spare parts. We have 6 available areas: Cutting, Sewing, Consumables, Tools, Chemicals and Fasteners.'
      },
      step3: {
        title: '🔍 Global Search',
        description: 'You can also use Global Search to search by name, part number or SAP number across our entire Tool Room catalog.'
      }
    }
  };

  constructor(private http: HttpClient) {}

  async startTourWithLanguageSelection(): Promise<void> {
    return new Promise((resolve) => {
      // Mostrar selector de idioma
      const languageModal = document.createElement('div');
      languageModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      `;

      const modalContent = document.createElement('div');
      modalContent.style.cssText = `
        background: white;
        border-radius: 16px;
        padding: 60px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        max-width: 600px;
      `;

      const title = document.createElement('h2');
      title.textContent = 'Selecciona tu idioma / Select your language';
      title.style.cssText = 'margin: 0 0 40px 0; font-size: 28px; color: #1f2937; font-weight: 700;';
      modalContent.appendChild(title);

      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = 'display: flex; gap: 15px; justify-content: center;';

      const esButton = document.createElement('button');
      esButton.textContent = '🇪🇸 Español';
      esButton.style.cssText = `
        padding: 16px 32px;
        font-size: 18px;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-weight: bold;
        transition: background 0.3s;
      `;
      esButton.onmouseover = () => esButton.style.background = '#2563eb';
      esButton.onmouseout = () => esButton.style.background = '#3b82f6';
      esButton.onclick = () => {
        this.selectedLanguage = 'es';
        document.body.removeChild(languageModal);
        this.startTour().then(resolve);
      };

      const enButton = document.createElement('button');
      enButton.textContent = '🇺🇸 English';
      enButton.style.cssText = `
        padding: 16px 32px;
        font-size: 18px;
        background: #10b981;
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-weight: bold;
        transition: background 0.3s;
      `;
      enButton.onmouseover = () => enButton.style.background = '#059669';
      enButton.onmouseout = () => enButton.style.background = '#10b981';
      enButton.onclick = () => {
        this.selectedLanguage = 'en';
        document.body.removeChild(languageModal);
        this.startTour().then(resolve);
      };

      buttonContainer.appendChild(esButton);
      buttonContainer.appendChild(enButton);
      modalContent.appendChild(buttonContainer);
      languageModal.appendChild(modalContent);
      document.body.appendChild(languageModal);
    });
  }

  async startTour(): Promise<void> {
    // Destruir tour anterior si existe
    if (this.driverInstance) {
      this.driverInstance.destroy();
    }

    const content = this.translations[this.selectedLanguage];

    // Agregar estilos CSS personalizados para driver.js
    const style = document.createElement('style');
    style.innerHTML = `
      .driver-popover {
        max-width: 700px !important;
        font-size: 18px !important;
      }
      .driver-popover-title {
        font-size: 32px !important;
        font-weight: bold !important;
      }
      .driver-popover-description {
        font-size: 20px !important;
        line-height: 1.6 !important;
      }
    `;
    document.head.appendChild(style);

    // Crear nueva instancia del tour
    this.driverInstance = driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.4,
      steps: [
        {
          // Paso 1: Pantalla completa (sin elemento específico)
          popover: {
            title: content.step1.title,
            description: content.step1.description,
            side: 'top',
            align: 'center'
          },
          onHighlighted: async () => {
            await this.playAudio(content.step1.description);
          }
        },
        {
          // Paso 2: Enfasis en áreas (6 paneles)
          element: 'div.professional-grid.grid-3',
          popover: {
            title: content.step2.title,
            description: content.step2.description,
            side: 'bottom',
            align: 'center'
          },
          onHighlighted: async () => {
            await this.playAudio(content.step2.description);
          }
        },
        {
          // Paso 3: Enfasis en búsqueda global
          element: '.professional-grid.grid-2 .professional-card',
          popover: {
            title: content.step3.title,
            description: content.step3.description,
            side: 'bottom',
            align: 'center'
          },
          onHighlighted: async () => {
            await this.playAudio(content.step3.description);
          }
        }
      ]
    });

    // Iniciar el tour
    this.driverInstance.drive();
  }

  private async playAudio(text: string): Promise<void> {
    // Detener audio actual si existe
    this.stopCurrentAudio();

    try {
      // Llamar al backend para generar audio
      const response = await this.http.post(
        `${this.BACKEND_URL}/api/text-to-speech`,
        { text },
        { responseType: 'blob' }
      ).toPromise();

      if (response) {
        // Crear un blob URL y reproducir
        const audioUrl = URL.createObjectURL(response);
        this.currentAudio = new Audio(audioUrl);
        this.currentAudio.play();
      }
    } catch (error) {
      console.warn('Audio no disponible (backend no conectado):', error);
      // El tour continúa sin audio
    }
  }

  private stopCurrentAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }
}
