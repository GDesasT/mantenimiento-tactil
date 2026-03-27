import { Component, OnDestroy, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TouchButtonComponent } from './shared/components/touch-button/touch-button';
import { HomeTourService } from './core/services/home-tour.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, TouchButtonComponent, HttpClientModule],
  template: `
    <div class="app-container">
      <nav class="professional-nav">
        <div class="nav-container">
          <div class="nav-content">
            <!-- Logo y branding -->
            <div class="nav-brand">
              <img
                src="logo.svg"
                alt="Global Safety Textiles"
                class="brand-logo"
              />
              <div class="brand-text">
                <span class="brand-title">Tool Room</span>
                <span class="brand-subtitle">Industrial Solutions</span>
              </div>
            </div>

            <!-- Navegación principal -->
            <div class="nav-menu">
              <app-touch-button
                [variant]="isCurrentRoute('') ? 'primary' : 'secondary'"
                size="lg"
                icon="🏠"
                (clicked)="navigateTo('')"
                class="nav-touch-button"
              >
                Inicio
              </app-touch-button>

              <app-touch-button
                [variant]="isCurrentRoute('/search') ? 'primary' : 'secondary'"
                size="lg"
                icon="🔍"
                (clicked)="navigateTo('/search')"
                class="nav-touch-button"
              >
                Búsqueda Global
              </app-touch-button>

              <app-touch-button
                [variant]="
                  isCurrentRoute('/excel-import') ? 'primary' : 'secondary'
                "
                size="lg"
                icon="📊"
                (clicked)="navigateTo('/excel-import')"
                class="nav-touch-button"
              >
                Importar Excel
              </app-touch-button>
                            <app-touch-button
                [variant]="
                  isCurrentRoute('/manuales') ? 'primary' : 'secondary'
                "
                size="lg"
                icon="📖"
                (clicked)="navigateTo('/manuales')"
                class="nav-touch-button"
              >
            Manuales
            </app-touch-button>

              <!-- Botón de Tour - Circular con Bootstrap Icons -->
              <!-- <button
                class="tour-button-circular"
                (click)="startTour()"
                title="Iniciar tour interactivo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="blue" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                </svg>
              </button> -->
            </div>

            <!-- Indicador de hora y fecha -->
            <div class="nav-status">
              <div class="time-indicator">
                <div class="time-display">
                  <span class="current-time">{{ currentTime }}</span>
                  <span class="current-date">{{ currentDate }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Contenido principal -->
      <main class="container mx-auto px-6 py-8">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer profesional -->
      <footer class="bg-gray-800 text-white py-6 mt-12">
        <div class="container mx-auto px-6 text-center">
          <p class="text-sm">
            © 2025 Sistema de Mantenimiento Industrial.
            <span class="text-gray-400"
              >Desarrollado para Tool Room Management</span
            >
          </p>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      /* Reset y configuración base */
      * {
        box-sizing: border-box;
      }

      .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: var(--gray-50);
      }

      /* Navegación principal optimizada para táctil */
      .professional-nav {
        background: linear-gradient(135deg, #1e40af, #3b82f6);
        border-bottom: 3px solid #1d4ed8;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        position: sticky;
        top: 0;
        z-index: 100;
      }

      .nav-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 1rem;
      }

      .nav-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 0;
        gap: 2rem;
      }

      /* Branding */
      .nav-brand {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-shrink: 0;
      }

      .brand-logo {
        height: 2.5rem;
        width: auto;
        filter: brightness(0) invert(1);
      }

      .brand-text {
        display: flex;
        flex-direction: column;
        color: white;
      }

      .brand-title {
        font-size: 1.125rem;
        font-weight: bold;
        line-height: 1.2;
      }

      .brand-subtitle {
        font-size: 0.875rem;
        opacity: 0.9;
        line-height: 1.2;
      }

      /* Menú de navegación táctil optimizado */
      .nav-menu {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex: 1;
        justify-content: center;
      }

      /* Estilos específicos para botones de navegación */
      .nav-touch-button {
        min-width: 140px;
        min-height: 80px;
      }

      /* Override para botones secundarios en navbar */
      .nav-menu .nav-touch-button button[class*='secondary'] {
        background: rgba(255, 255, 255, 0.15) !important;
        border: 2px solid rgba(255, 255, 255, 0.25) !important;
        color: white !important;
        backdrop-filter: blur(10px);
      }

      .nav-menu .nav-touch-button button[class*='secondary']:hover {
        background: rgba(255, 255, 255, 0.25) !important;
        border-color: rgba(255, 255, 255, 0.4) !important;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      }

      /* Override para botones primarios en navbar */
      .nav-menu .nav-touch-button button[class*='primary'] {
        background: rgba(255, 255, 255, 0.3) !important;
        border: 2px solid rgba(255, 255, 255, 0.5) !important;
        color: white !important;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
        backdrop-filter: blur(10px);
      }

      .nav-menu .nav-touch-button button[class*='primary']:hover {
        background: rgba(255, 255, 255, 0.4) !important;
        border-color: rgba(255, 255, 255, 0.6) !important;
      }

      /* Botón especial del Voice Driver */
      .nav-menu .voice-driver-btn button {
        background: linear-gradient(135deg, #ff6b6b, #ee5a52) !important;
        border: 2px solid rgba(255, 255, 255, 0.4) !important;
        color: white !important;
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4) !important;
        animation: pulse-light 2s ease-in-out infinite;
      }

      .nav-menu .voice-driver-btn button:hover {
        background: linear-gradient(135deg, #ff7f7f, #ff6b6b) !important;
        box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6) !important;
        transform: translateY(-2px);
      }

      @keyframes pulse-light {
        0%,
        100% {
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
        }
        50% {
          box-shadow: 0 4px 25px rgba(255, 107, 107, 0.8);
        }
      }

      /* Efectos táctiles mejorados */
      .nav-menu .nav-touch-button button {
        transition: all 0.3s ease !important;
        position: relative;
        overflow: hidden;
      }

      .nav-menu .nav-touch-button button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.2),
          transparent
        );
        transition: left 0.6s ease;
        z-index: 1;
      }

      .nav-menu .nav-touch-button button:hover::before {
        left: 100%;
      }

      .nav-menu .nav-touch-button button > * {
        position: relative;
        z-index: 2;
      }

      /* Indicador de tiempo */
      .nav-status {
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      /* Botón circular del tour */
      .tour-button-circular {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FFFFFF, #FFF0E8);
        border: 3px solid rgba(255, 255, 255, 0.3);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(255, 255, 255, 0.4);
        flex-shrink: 0;
        margin: auto;
      }

      .tour-button-circular:hover {
        transform: scale(1.1);
        color: white;
        box-shadow: 0 6px 20px rgba(255, 255, 255, 0.6);
      }

      .tour-button-circular:active {
        transform: scale(0.95);
      }

      .tour-button-circular svg {
        width: 28px;
        height: 28px;
        transition: transform 0.2s;
      }

      .tour-button-circular:hover svg {
        transform: rotate(15deg) scale(1.1);
      }

      .time-indicator {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
        background: rgba(255, 255, 255, 0.15);
        border: 2px solid rgba(255, 255, 255, 0.25);
        border-radius: 1rem;
        color: white;
        backdrop-filter: blur(10px);
        min-width: 140px;
      }

      .time-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        width: 100%;
      }

      .current-time {
        font-size: 1rem;
        font-weight: bold;
        font-family: 'Courier New', monospace;
        letter-spacing: 0.05em;
      }

      .current-date {
        font-size: 0.75rem;
        opacity: 0.9;
        font-weight: 600;
      }

      /* Contenido principal */
      main {
        flex: 1;
        width: 100%;
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
      }

      /* Footer */
      footer {
        background: #1f2937;
        color: white;
        padding: 1.5rem;
        text-align: center;
        margin-top: auto;
      }

      footer p {
        font-size: 0.875rem;
        margin: 0;
      }

      footer .text-gray-400 {
        color: #9ca3af;
      }

      /* Responsive para dispositivos táctiles */
      @media (max-width: 768px) {
        .nav-content {
          flex-direction: column;
          gap: 1rem;
        }

        .nav-menu {
          width: 100%;
          justify-content: space-around;
          gap: 0.5rem;
        }

        .nav-touch-button {
          min-width: 110px;
          min-height: 85px;
          flex: 1;
          max-width: 130px;
        }

        .brand-text {
          display: none;
        }

        .nav-status {
          order: -1;
        }

        .time-indicator {
          padding: 0.5rem 0.75rem;
          min-width: 120px;
        }

        .current-time {
          font-size: 0.875rem;
        }

        .current-date {
          font-size: 0.6875rem;
        }

        main {
          padding: 1rem;
        }
      }

      @media (max-width: 480px) {
        .nav-container {
          padding: 0 0.5rem;
        }

        .nav-menu {
          gap: 0.25rem;
        }

        .nav-touch-button {
          min-width: 90px;
          min-height: 75px;
        }

        .brand-logo {
          height: 2rem;
        }
      }

      /* Optimizaciones táctiles adicionales */
      @media (pointer: coarse) {
        .nav-touch-button {
          min-height: 90px;
          min-width: 150px;
        }

        .nav-menu {
          gap: 1.25rem;
        }
      }
    `,
  ],
})
export class AppComponent implements OnDestroy, OnInit, AfterViewInit {
  title = 'mantenimiento-tactil';
  currentTime = '';
  currentDate = '';
  private timeInterval: any;

  constructor(
    private router: Router,
    private tourService: HomeTourService
  ) {
    console.log('🚀 AppComponent Constructor - Inicializando...');
    this.updateDateTime();
    // Actualizar cada segundo
    this.timeInterval = setInterval(() => {
      this.updateDateTime();
    }, 1000);
    console.log('✅ AppComponent Constructor - Completado');
  }

  ngOnInit() {
    console.log('🔄 AppComponent ngOnInit - Ciclo de vida iniciado');
  }

  ngAfterViewInit() {
    console.log('✅ AppComponent ngAfterViewInit - Vista inicializada');
  }

  ngOnDestroy() {
    console.log('🛑 AppComponent ngOnDestroy - Limpiando recursos');
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  private updateDateTime() {
    const now = new Date();

    // Formato de hora: HH:mm:ss
    this.currentTime = now.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // Formato de fecha: DD/MM/YYYY
    this.currentDate = now.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  navigateTo(route: string): void {
    // Reset scroll position before navigating
    window.scrollTo(0, 0);
    this.router.navigate([route]);
  }

  isCurrentRoute(route: string): boolean {
    if (route === '') {
      return this.router.url === '/' || this.router.url === '';
    }
    return this.router.url.startsWith(route);
  }

  startTour(): void {
    this.tourService.startTourWithLanguageSelection();
  }
}
