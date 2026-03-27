import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TourService } from '../../../core/services/tour.service';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
  expanded?: boolean;
}

// Pipe para filtrar por categoría
@Pipe({
  name: 'filterByCategory',
  standalone: true,
})
export class FilterByCategoryPipe implements PipeTransform {
  transform(items: FAQItem[], category: string): FAQItem[] {
    return items.filter((item) => item.category === category);
  }
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, FilterByCategoryPipe],
  template: `
    <div class="faq-container">
      <div class="faq-header">
        <h1>❓ Preguntas Frecuentes (FAQ)</h1>
        <p class="subtitle">
          Todo lo que necesitas saber sobre el Sistema de Gestión de Refacciones
        </p>
        <button class="tour-btn" (click)="startTour()">🎬 Ver Tour Interactivo</button>
      </div>

      <div class="faq-content">
        <!-- Sección: Acerca del Sistema -->
        <section class="faq-section">
          <h2>📋 Acerca del Sistema</h2>
          <div class="faq-items">
            <div class="faq-item" *ngFor="let item of faqItems | filterByCategory: 'about'">
              <div class="faq-question" (click)="toggleItem(item)">
                <span class="icon">
                  {{ item.expanded ? '▼' : '▶' }}
                </span>
                <h3>{{ item.question }}</h3>
              </div>
              <div class="faq-answer" *ngIf="item.expanded">
                <p>{{ item.answer }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Sección: Uso del Sistema -->
        <section class="faq-section">
          <h2>🚀 Cómo Usar el Sistema</h2>
          <div class="faq-items">
            <div class="faq-item" *ngFor="let item of faqItems | filterByCategory: 'usage'">
              <div class="faq-question" (click)="toggleItem(item)">
                <span class="icon">
                  {{ item.expanded ? '▼' : '▶' }}
                </span>
                <h3>{{ item.question }}</h3>
              </div>
              <div class="faq-answer" *ngIf="item.expanded">
                <p>{{ item.answer }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Sección: Búsqueda y Filtrado -->
        <section class="faq-section">
          <h2>🔍 Búsqueda y Filtrado</h2>
          <div class="faq-items">
            <div class="faq-item" *ngFor="let item of faqItems | filterByCategory: 'search'">
              <div class="faq-question" (click)="toggleItem(item)">
                <span class="icon">
                  {{ item.expanded ? '▼' : '▶' }}
                </span>
                <h3>{{ item.question }}</h3>
              </div>
              <div class="faq-answer" *ngIf="item.expanded">
                <p>{{ item.answer }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Sección: Importación -->
        <section class="faq-section">
          <h2>📤 Importación de Datos</h2>
          <div class="faq-items">
            <div class="faq-item" *ngFor="let item of faqItems | filterByCategory: 'import'">
              <div class="faq-question" (click)="toggleItem(item)">
                <span class="icon">
                  {{ item.expanded ? '▼' : '▶' }}
                </span>
                <h3>{{ item.question }}</h3>
              </div>
              <div class="faq-answer" *ngIf="item.expanded">
                <p>{{ item.answer }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Sección: Troubleshooting -->
        <section class="faq-section">
          <h2>🔧 Solución de Problemas</h2>
          <div class="faq-items">
            <div class="faq-item" *ngFor="let item of faqItems | filterByCategory: 'troubleshooting'">
              <div class="faq-question" (click)="toggleItem(item)">
                <span class="icon">
                  {{ item.expanded ? '▼' : '▶' }}
                </span>
                <h3>{{ item.question }}</h3>
              </div>
              <div class="faq-answer" *ngIf="item.expanded">
                <p>{{ item.answer }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .faq-container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 2rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .faq-header {
        text-align: center;
        margin-bottom: 3rem;
        padding-bottom: 2rem;
        border-bottom: 2px solid #e5e7eb;
      }

      .faq-header h1 {
        font-size: 2.5rem;
        color: #1f2937;
        margin-bottom: 0.5rem;
      }

      .subtitle {
        font-size: 1.1rem;
        color: #6b7280;
        margin-bottom: 1.5rem;
      }

      .tour-btn {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 600;
      }

      .tour-btn:hover {
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      }

      .faq-content {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .faq-section {
        background: #f9fafb;
        padding: 1.5rem;
        border-radius: 8px;
        border-left: 4px solid #3b82f6;
      }

      .faq-section h2 {
        font-size: 1.5rem;
        color: #1f2937;
        margin-bottom: 1rem;
      }

      .faq-items {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .faq-item {
        background: white;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid #e5e7eb;
        transition: all 0.3s ease;
      }

      .faq-item:hover {
        border-color: #3b82f6;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
      }

      .faq-question {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        cursor: pointer;
        user-select: none;
        background: white;
        transition: background 0.3s ease;
      }

      .faq-question:hover {
        background: #f3f4f6;
      }

      .faq-question h3 {
        margin: 0;
        font-size: 1rem;
        color: #1f2937;
        font-weight: 600;
      }

      .icon {
        color: #3b82f6;
        font-weight: bold;
        min-width: 20px;
        text-align: center;
      }

      .faq-answer {
        padding: 1rem;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        color: #4b5563;
        line-height: 1.6;
      }

      .faq-answer p {
        margin: 0;
      }

      @media (max-width: 768px) {
        .faq-container {
          padding: 1rem;
        }

        .faq-header h1 {
          font-size: 1.8rem;
        }

        .faq-section {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class FAQComponent implements OnInit {
  faqItems: FAQItem[] = [];

  constructor(private tourService: TourService) {}

  ngOnInit(): void {
    this.faqItems = [
      // About
      {
        category: 'about',
        expanded: false,
        question: '¿Para qué se creó este sistema?',
        answer:
          'El Sistema de Gestión de Refacciones fue creado para optimizar y automatizar la administración de herramientas, piezas de reposición y refacciones en un entorno industrial. Permite solicitar, catalogar, buscar y gestionar refacciones de manera eficiente a través de una interfaz táctil intuitiva.',
      },
      {
        category: 'about',
        expanded: false,
        question: '¿Cuáles son los objetivos principales del sistema?',
        answer:
          'Los objetivos principales son: (1) Reducir tiempo en búsquedas y solicitudes de refacciones, (2) Mantener un inventario organizado y actualizado, (3) Mejorar la accesibilidad mediante interfaz táctil, (4) Facilitar la importación de datos desde Excel, (5) Proporcionar búsqueda global rápida.',
      },
      {
        category: 'about',
        expanded: false,
        question: '¿Qué tipo de refacciones puedo gestionar?',
        answer:
          'Puedes gestionar cualquier tipo de refacción: piezas mecánicas, herramientas, tornillos, químicos, cilindros neumáticos, motores, válvulas, y más. El sistema está diseñado para ser flexible y adaptarse a cualquier categoría de refacciones.',
      },

      // Usage
      {
        category: 'usage',
        expanded: false,
        question: '¿Cómo navego por el sistema?',
        answer:
          'Desde la barra de navegación superior puedes acceder a: (1) Inicio - vista general del sistema, (2) Búsqueda Global - busca refacciones por nombre, (3) Importar Excel - carga masiva de datos, (4) Menú adicional con más opciones. Haz clic en el botón correspondiente.',
      },
      {
        category: 'usage',
        expanded: false,
        question: '¿Cómo puedo ver el tour interactivo?',
        answer:
          'Haz clic en el botón "🎬 Ver Tour Interactivo" en esta página. El tour te guiará a través de todas las funciones principales del sistema con explicaciones paso a paso.',
      },
      {
        category: 'usage',
        expanded: false,
        question: '¿La interfaz es amigable para dispositivos táctiles?',
        answer:
          'Sí, completamente. El sistema fue diseñado específicamente para funcionar óptimamente en pantallas táctiles con botones grandes, gestos intuitivos y una navegación simplificada. Todos los elementos están optimizados para interacción táctil.',
      },

      // Search
      {
        category: 'search',
        expanded: false,
        question: '¿Cómo realizo una búsqueda global?',
        answer:
          'Navega a "Búsqueda Global" desde la barra de navegación. Ingresa el nombre o código de la refacción que buscas. El sistema busca automáticamente en todas las categorías y te muestra los resultados instantáneamente.',
      },
      {
        category: 'search',
        expanded: false,
        question: '¿Puedo filtrar resultados de búsqueda?',
        answer:
          'Sí. Después de realizar una búsqueda, puedes usar los filtros disponibles para refinar los resultados por categoría, máquina, disponibilidad, precio o cualquier otro criterio disponible.',
      },
      {
        category: 'search',
        expanded: false,
        question: '¿Qué pasa si no encuentro lo que busco?',
        answer:
          'Si la refacción no existe, puedes: (1) Verificar la ortografía, (2) Usar términos diferentes, (3) Navegar por categorías manualmente, (4) Contactar al administrador para agregar nuevas refacciones.',
      },

      // Import
      {
        category: 'import',
        expanded: false,
        question: '¿Cómo importo datos desde Excel?',
        answer:
          'Ve a "Importar Excel" en la barra de navegación. Selecciona tu archivo Excel con los datos de refacciones. El sistema validará la estructura y cargará los datos automáticamente. Asegúrate de que el archivo tenga el formato correcto.',
      },
      {
        category: 'import',
        expanded: false,
        question: '¿Cuál es el formato requerido para el Excel?',
        answer:
          'El archivo debe contener columnas como: Nombre, Código, Categoría, Descripción, Cantidad, Precio, Ubicación. Consulta la plantilla de ejemplo en la sección de importación para ver la estructura exacta.',
      },
      {
        category: 'import',
        expanded: false,
        question: '¿Puedo actualizar refacciones existentes con Excel?',
        answer:
          'Sí, puedes actualizar refacciones existentes importando un archivo con los mismos códigos. El sistema reconocerá las refacciones existentes y actualizará sus datos según el contenido del archivo.',
      },

      // Troubleshooting
      {
        category: 'troubleshooting',
        expanded: false,
        question: '¿Qué hago si la búsqueda es lenta?',
        answer:
          'Intenta reducir los criterios de búsqueda, limpia los filtros, o recarga la página. Si el problema persiste, contacta al administrador del sistema para optimizar la base de datos.',
      },
      {
        category: 'troubleshooting',
        expanded: false,
        question: '¿Cómo reporto un error o problema?',
        answer:
          'Si encuentras algún error o problema con el sistema, documenta lo siguiente: (1) Qué estabas haciendo cuando ocurrió, (2) Qué error viste, (3) En qué dispositivo estabas. Luego contacta al soporte técnico.',
      },
      {
        category: 'troubleshooting',
        expanded: false,
        question: '¿Cómo actualizo mi navegador para mejor compatibilidad?',
        answer:
          'Se recomienda usar las versiones más recientes de Chrome, Firefox, Safari o Edge. El sistema funciona mejor en navegadores modernos. Limpia el caché del navegador si tienes problemas de visualización.',
      },
    ];
  }

  toggleItem(item: FAQItem): void {
    item.expanded = !item.expanded;
  }

  startTour(): void {
    this.tourService.startTour();
  }
}
