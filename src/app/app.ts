import { Component, OnDestroy, ViewChild, OnInit, AfterViewInit, HostListener } from '@angular/core';
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
      <nav class="professional-nav" [class.scrolled]="isScrolled">
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
                <span class="brand-subtitle">Sewing & Cut</span>
              </div>
            </div>

            <!-- Navegación principal -->
            <div class="nav-menu">
              <app-touch-button
                [variant]="isCurrentRoute('') ? 'primary' : 'secondary'"
                size="lg"
                iconClass="bi bi-house-door-fill"
                (clicked)="navigateTo('')"
                class="nav-touch-button"
              >
                Inicio
              </app-touch-button>

              <app-touch-button
                [variant]="isCurrentRoute('/search') ? 'primary' : 'secondary'"
                size="lg"
                iconClass="bi bi-search"
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
                iconClass="bi bi-file-earmark-spreadsheet"
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
                iconClass="bi bi-book-half"
                (clicked)="navigateTo('/manuales')"
                class="nav-touch-button"
              >
                Manuales
              </app-touch-button>

              <!-- Botón de Tour -->
              <button
                class="tour-button-circular"
                (click)="startTour()"
                title="Iniciar tour interactivo"
              >
                <i class="bi bi-info-circle-fill" style="font-size: 1.5rem; color: #2563eb;"></i>
              </button>
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
        background-color: #f8fafc; /* slate-50 */
        background-image: 
          radial-gradient(at 0% 0%, rgba(219, 234, 254, 0.5) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(224, 231, 255, 0.5) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(219, 234, 254, 0.5) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(224, 231, 255, 0.5) 0px, transparent 50%);
        background-attachment: fixed;
        padding-top: 130px; /* Space for the fixed navbar */
      }

      /* Navegación principal optimizada para táctil */
      .professional-nav {
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 58, 138, 0.98)); /* slate-900 to blue-900 */
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
        position: fixed;
        width: 100%;
        left: 0;
        right: 0;
        top: 0;
        z-index: 100;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(16px);
      }

      .professional-nav.scrolled {
        margin: 1.5rem auto;
        max-width: 1000px;
        border-radius: 60px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.4);
        left: 1rem;
        right: 1rem;
        width: calc(100% - 2rem);
        background: rgba(15, 23, 42, 0.9);
      }

      .nav-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 1rem;
        transition: padding 0.5s ease;
      }

      .professional-nav.scrolled .nav-container {
        padding: 0 2rem;
      }

      .nav-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 0;
        gap: 2rem;
        transition: padding 0.5s ease;
      }

      .professional-nav.scrolled .nav-content {
        padding: 0.75rem 0;
        gap: 1.5rem;
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
        transition: opacity 0.3s ease, max-width 0.4s ease, margin 0.4s ease;
        max-width: 200px;
        overflow: hidden;
        white-space: nowrap;
      }

      .professional-nav.scrolled .brand-text {
        opacity: 0;
        max-width: 0;
        margin-left: 0;
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
        transition: all 0.4s ease;
      }

      .professional-nav.scrolled .nav-touch-button {
        min-width: 65px !important;
        min-height: 65px !important;
      }

      ::ng-deep .nav-touch-button button {
        transition: all 0.4s ease !important;
      }

      ::ng-deep .nav-touch-button .button-text {
        transition: max-width 0.4s ease, opacity 0.3s ease, margin 0.4s ease;
        max-width: 150px;
        display: inline-block;
        overflow: hidden;
        white-space: nowrap;
      }

      ::ng-deep .professional-nav.scrolled .nav-touch-button .button-text {
        max-width: 0;
        opacity: 0;
        margin: 0;
        padding: 0;
      }

      ::ng-deep .nav-touch-button .button-icon {
        transition: all 0.4s ease;
      }

      ::ng-deep .professional-nav.scrolled .nav-touch-button .button-icon {
        margin: 0 !important;
        font-size: 1.5rem;
      }

      ::ng-deep .professional-nav.scrolled .nav-touch-button button {
        min-width: 65px !important;
        min-height: 65px !important;
        padding: 0.75rem !important;
        border-radius: 50% !important;
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
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.4s ease;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        flex-shrink: 0;
        margin-left: 0.5rem;
      }

      .tour-button-circular i {
        color: #60a5fa !important; /* blue-400 */
        font-size: 1.75rem !important;
      }

      .professional-nav.scrolled .tour-button-circular {
        width: 56px;
        height: 56px;
        border-width: 1px;
      }
      .professional-nav.scrolled .tour-button-circular i {
        font-size: 1.5rem !important;
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
        max-width: 200px;
        transition: all 0.4s ease;
        overflow: hidden;
        white-space: nowrap;
      }

      .professional-nav.scrolled .time-indicator {
        opacity: 0;
        max-width: 0;
        min-width: 0;
        padding: 0;
        margin: 0;
        border-width: 0;
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
  isScrolled = false;
  private timeInterval: any;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Add hysteresis to avoid flickering when scrolling very slowly near the threshold
    if (window.scrollY > 80 && !this.isScrolled) {
      this.isScrolled = true;
    } else if (window.scrollY < 20 && this.isScrolled) {
      this.isScrolled = false;
    }
  }

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
