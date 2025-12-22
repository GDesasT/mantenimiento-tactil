import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../../core/services/database';

@Component({
  selector: 'app-part-category-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <span class="loading-text">Cargando refacciones...</span>
    </div>
  `,
  styles: [
    `
      .loading-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.5rem;
        min-height: 100vh;
        background: var(--gray-50);
      }

      .loading-spinner {
        width: 2.5rem;
        height: 2.5rem;
        border: 3px solid var(--gray-300);
        border-top: 3px solid var(--primary-600);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .loading-text {
        font-size: 1.125rem;
        color: var(--gray-600);
        font-weight: 500;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class PartCategorySelectorComponent implements OnInit {
  machineId!: number;
  selectedArea: 'corte' | 'costura' | 'consumible' = 'costura';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private databaseService: DatabaseService
  ) {}

  async ngOnInit() {
    try {
      await this.databaseService.initializeDatabase();
    } catch (error) {
      console.error('Error initializing database:', error);
    }

    this.route.params.subscribe((params) => {
      this.machineId = +params['machineId'];
      this.selectedArea = params['area'] || 'costura';
      // Redirigir directamente a la vista de refacciones mecánicas
      this.router.navigate([
        '/machines',
        this.selectedArea,
        this.machineId,
        'parts',
        'mecanica',
      ]);
    });
  }
}
